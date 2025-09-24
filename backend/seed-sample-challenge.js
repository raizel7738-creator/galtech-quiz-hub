require('dotenv').config();
const mongoose = require('mongoose');
const CodingChallenge = require('./models/CodingChallenge');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected');

    const exists = await CodingChallenge.findOne({ title: 'Sum of Two Numbers' });
    if (exists) {
      console.log('Sample challenge already exists');
      process.exit(0);
    }

    await CodingChallenge.create({
      title: 'Sum of Two Numbers',
      description: 'Read two integers from input and output their sum. Use standard input/output.',
      problemStatement: 'Given two integers a and b, output a + b.',
      points: 10,
      sampleInput: '2 3',
      sampleOutput: '5',
      category: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      testCases: [
        { input: '1 2', output: '3', hidden: true, weight: 1 },
        { input: '10 5', output: '15', hidden: true, weight: 1 },
        { input: '-3 7', output: '4', hidden: true, weight: 1 }
      ],
      languages: [63,71,62,54],
      status: 'active'
    });

    console.log('Seeded sample challenge');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();


const mongoose = require('mongoose');
const CodingChallenge = require('./models/CodingChallenge');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected');

    const exists = await CodingChallenge.findOne({ title: 'Sum of Two Numbers' });
    if (exists) {
      console.log('Sample challenge already exists');
      process.exit(0);
    }

    await CodingChallenge.create({
      title: 'Sum of Two Numbers',
      description: 'Read two integers from input and output their sum. Use standard input/output.',
      problemStatement: 'Given two integers a and b, output a + b.',
      points: 10,
      sampleInput: '2 3',
      sampleOutput: '5',
      category: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      testCases: [
        { input: '1 2', output: '3', hidden: true, weight: 1 },
        { input: '10 5', output: '15', hidden: true, weight: 1 },
        { input: '-3 7', output: '4', hidden: true, weight: 1 }
      ],
      languages: [63,71,62,54],
      status: 'active'
    });

    console.log('Seeded sample challenge');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();


