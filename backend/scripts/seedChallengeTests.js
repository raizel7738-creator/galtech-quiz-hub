/*
  Script: seedChallengeTests.js
  Purpose: Ensure every CodingChallenge has at least a minimal set of hidden test cases.
  Usage: node scripts/seedChallengeTests.js
*/
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const CodingChallenge = require('../models/CodingChallenge');

function inferTestsFromTitle(title) {
  const t = (title || '').toLowerCase();
  // Simple heuristics
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
  // Generic I/O echo test as last resort
  return [
    { input: 'hello', output: 'hello', hidden: true, weight: 1 },
  ];
}

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub';
  await mongoose.connect(mongoUri);
  const challenges = await CodingChallenge.find({});
  let updated = 0;
  for (const ch of challenges) {
    if (!Array.isArray(ch.testCases) || ch.testCases.length === 0) {
      ch.testCases = inferTestsFromTitle(ch.title);
      await ch.save();
      updated++;
      // eslint-disable-next-line no-console
      console.log(`Added ${ch.testCases.length} tests to: ${ch.title}`);
    }
  }
  // eslint-disable-next-line no-console
  console.log(`Done. Updated challenges: ${updated}/${challenges.length}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


