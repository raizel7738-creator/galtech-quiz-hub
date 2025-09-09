const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/galtech-quiz-hub')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear ALL questions from the database
    console.log('Clearing ALL questions from database...');
    const result = await Question.deleteMany({});
    console.log(`Deleted ${result.deletedCount} questions from database`);
    
    // Verify database is empty
    const remainingQuestions = await Question.find({});
    console.log(`Remaining questions in database: ${remainingQuestions.length}`);
    
    if (remainingQuestions.length === 0) {
      console.log('✅ Database is now completely empty');
    } else {
      console.log('❌ Database still contains questions');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

