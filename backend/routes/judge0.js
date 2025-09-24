const express = require('express');
const axios = require('axios');
const router = express.Router();

// Uses environment variables: JUDGE0_URL, JUDGE0_KEY (optional)
const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_HEADERS = process.env.JUDGE0_KEY ? { 'X-RapidAPI-Key': process.env.JUDGE0_KEY, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' } : {};

// Run code (no testcases persistence)
router.post('/run', async (req, res) => {
  try {
    const { language_id, source_code, stdin } = req.body || {};
    if (!language_id || !source_code) {
      return res.status(400).json({ success: false, message: 'language_id and source_code required' });
    }

    // create submission
    const createResp = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      language_id,
      source_code,
      stdin,
    }, { headers: { 'Content-Type': 'application/json', ...JUDGE0_HEADERS } });

    return res.json({ success: true, data: createResp.data });
  } catch (err) {
    const upstreamStatus = err.response?.status || 500;
    // Avoid sending 401 to frontend to prevent client auto-logout from interceptors
    if (upstreamStatus === 401) {
      return res.status(400).json({ success: false, code: 'JUDGE0_AUTH', message: 'Judge0 authentication failed. Check JUDGE0_KEY/JUDGE0_URL.' });
    }
    const message = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || err.message);
    return res.status(upstreamStatus).json({ success: false, message });
  }
});

module.exports = router;
