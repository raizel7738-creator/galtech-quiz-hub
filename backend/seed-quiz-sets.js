const mongoose = require('mongoose');
const Question = require('./models/Question');
const Category = require('./models/Category');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub');
    console.log('✅ Connected to MongoDB');

    const mathCat = await Category.findOne({ name: 'General Mathematical Aptitude' });
    const progCat = await Category.findOne({ name: 'Program-Based Questions' });
    const admin = await User.findOne({ role: 'admin' });
    if (!mathCat || !progCat || !admin) {
      console.log('❌ Missing category or admin user.');
      process.exit(1);
    }

    // 10 MCQs - simple aptitude
    const mcqs = Array.from({ length: 10 }).map((_, i) => {
      const a = i + 2;
      const b = i + 3;
      const sum = a + b;
      return {
        question: `What is ${a} + ${b}?`,
        type: 'mcq',
        category: mathCat._id,
        difficulty: 'easy',
        points: 1,
        options: [
          { text: String(sum), isCorrect: true },
          { text: String(sum - 1), isCorrect: false },
          { text: String(sum + 1), isCorrect: false },
          { text: 'None of the above', isCorrect: false }
        ],
        correctAnswer: String(sum),
        explanation: `Adding ${a} and ${b} gives ${sum}.`,
        tags: ['math','addition','beginner'],
        status: 'active',
        createdBy: admin._id
      };
    });

    // 10 Program-based (language-agnostic simple outputs in JS)
    const programs = Array.from({ length: 10 }).map((_, i) => {
      const x = i + 1;
      const codeSnippet = `const x = ${x};\nconsole.log(x * 2);`;
      const expected = String(x * 2);
      return {
        question: `What will be the output of this code (JS)?`,
        type: 'program',
        category: progCat._id,
        difficulty: 'easy',
        points: 1,
        programQuestion: {
          codeSnippet,
          language: 'javascript',
          expectedOutput: expected,
          testCases: [],
          analysisType: 'output',
          hints: []
        },
        options: [
          { text: expected, isCorrect: true },
          { text: String(x + 2), isCorrect: false },
          { text: String(x * 3), isCorrect: false },
          { text: 'Error', isCorrect: false }
        ],
        correctAnswer: expected,
        explanation: `x is ${x}; x * 2 = ${x * 2}.`,
        tags: ['program','output','beginner'],
        status: 'active',
        createdBy: admin._id
      };
    });

    await Question.deleteMany({ category: { $in: [mathCat._id, progCat._id] } });
    const created = await Question.insertMany([...mcqs, ...programs]);
    console.log(`✅ Seeded ${created.length} questions (10 MCQ + 10 Program)`);

    // Update counts
    const mathCount = await Question.countDocuments({ category: mathCat._id, status: 'active' });
    const progCount = await Question.countDocuments({ category: progCat._id, status: 'active' });
    await Category.findByIdAndUpdate(mathCat._id, { questionCount: mathCount });
    await Category.findByIdAndUpdate(progCat._id, { questionCount: progCount });
    console.log('📊 Updated category counts:', { mathCount, progCount });

    process.exit(0);
  } catch (e) {
    console.error('❌ Seed error:', e);
    process.exit(1);
  }
}

seed();


