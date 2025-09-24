const express = require('express');
const axios = require('axios');
const router = express.Router();
const CodingChallenge = require('../models/CodingChallenge');
const Submission = require('../models/Submission');
const { authenticateToken, requireStudent, requireAdmin } = require('../middleware/auth');

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_HEADERS = process.env.JUDGE0_KEY ? { 'X-RapidAPI-Key': process.env.JUDGE0_KEY, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' } : {};

// List challenges
router.get('/', async (req, res) => {
  const items = await CodingChallenge.find({}).select('title languages');
  res.json({ success: true, data: items });
});

// Get challenge by id
router.get('/:id', async (req, res) => {
  const item = await CodingChallenge.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: item });
});

function inferTestsFromTitle(title) {
  const t = (title || '').toLowerCase();
  if (/fizz\s*buzz/.test(t)) {
    return [
      { input: '3', output: 'Fizz', hidden: true, weight: 1 },
      { input: '5', output: 'Buzz', hidden: true, weight: 1 },
      { input: '15', output: 'FizzBuzz', hidden: true, weight: 2 },
      { input: '7', output: '7', hidden: true, weight: 1 },
    ];
  }
  if (/sum|add|addition/.test(t)) {
    return [
      { input: '3 5', output: '8', hidden: true, weight: 1 },
      { input: '10 -2', output: '8', hidden: true, weight: 1 },
      { input: '0 0', output: '0', hidden: true, weight: 1 },
    ];
  }
  if (/factorial/.test(t)) {
    return [
      { input: '5', output: '120', hidden: true, weight: 1 },
      { input: '0', output: '1', hidden: true, weight: 1 },
      { input: '1', output: '1', hidden: true, weight: 1 },
    ];
  }
  if (/palindrome/.test(t)) {
    return [
      { input: 'racecar', output: 'true', hidden: true, weight: 1 },
      { input: 'hello', output: 'false', hidden: true, weight: 1 },
    ];
  }
  return [];
}

// Submit solution → run against hidden tests and record score
// Allow any authenticated user to submit (student or admin)
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const challenge = await CodingChallenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const { language_id, source_code } = req.body || {};
    if (!language_id || !source_code) {
      return res.status(400).json({ success: false, message: 'language_id and source_code required' });
    }

    const tests = Array.isArray(challenge.testCases) && challenge.testCases.length > 0
      ? challenge.testCases
      : inferTestsFromTitle(challenge.title);

    if (!tests || tests.length === 0) {
      return res.status(400).json({ success: false, message: 'This challenge has no hidden test cases configured yet.' });
    }

    let passed = 0;
    let total = tests.length;
    let lastResult = null;

    for (const tc of tests) {
      const resp = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
        language_id,
        source_code,
        stdin: tc.input,
        expected_output: tc.output,
        cpu_time_limit: '5',
      }, { headers: { 'Content-Type': 'application/json', ...JUDGE0_HEADERS } });

      lastResult = resp.data;
      const statusId = resp.data?.status?.id;
      const ok = statusId === 3 && (resp.data.stdout?.replace(/\r/g,'').trim() === tc.output.replace(/\r/g,'').trim());
      if (ok) passed += 1 * (tc.weight || 1);
    }

    const score = Math.round((passed / total) * 100) || 0;

    const submission = await Submission.create({
      user: req.user.id,
      challenge: challenge._id,
      language_id,
      source_code,
      result: lastResult,
      score,
      total,
      passed
    });

    res.json({ success: true, data: submission });
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json({ success: false, message: err.response?.data || err.message });
  }
});

// Admin: list submissions
router.get('/admin/submissions', authenticateToken, requireAdmin, async (req, res) => {
  const filter = {};
  if (req.query.challengeId) filter.challenge = req.query.challengeId;
  const items = await Submission.find(filter)
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('challenge', 'title');
  res.json({ success: true, data: items });
});

// Admin: list submissions for a specific challenge
router.get('/:id/submissions', authenticateToken, requireAdmin, async (req, res) => {
  const items = await Submission.find({ challenge: req.params.id })
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('challenge', 'title');
  res.json({ success: true, data: items });
});

module.exports = router;
