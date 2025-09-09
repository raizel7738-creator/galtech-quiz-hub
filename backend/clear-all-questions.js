const mongoose = require('mongoose');
const Question = require('./models/Question');
const Category = require('./models/Category');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub');
    console.log('✅ Connected to MongoDB');

    const before = await Question.estimatedDocumentCount();
    console.log('Current questions count:', before);

    const res = await Question.deleteMany({});
    console.log('🗑️  Deleted questions:', res.deletedCount);

    // Optionally reset questionCount on categories
    await Category.updateMany({}, { $set: { questionCount: 0 } });
    console.log('📊 Reset category questionCount to 0');

    const after = await Question.estimatedDocumentCount();
    console.log('Remaining questions count:', after);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing questions:', err);
    process.exit(1);
  }
}

run();


