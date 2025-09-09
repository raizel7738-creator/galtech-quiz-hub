const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/galtech-quiz-hub')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const categoryId = '68b70b32325579429c94b7ee';
    const questions = await Question.find({ category: categoryId });
    
    console.log(`\nFound ${questions.length} questions in Programming Aptitude category:`);
    
    questions.forEach((q, i) => {
      console.log(`\n${i+1}. ${q.question}`);
      console.log(`   Difficulty: ${q.difficulty}, Points: ${q.points}`);
      console.log(`   Options:`);
      q.options.forEach((opt, j) => {
        console.log(`     ${String.fromCharCode(65 + j)}. ${opt.text} ${opt.isCorrect ? '(CORRECT)' : ''}`);
      });
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

