const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/galtech-quiz-hub')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const categoryId = '68b70b32325579429c94b7ee'; // Programming Aptitude category
    const questions = await Question.find({ category: categoryId });
    
    console.log(`\nFound ${questions.length} questions in Programming Aptitude category:`);
    
    if (questions.length > 0) {
      questions.forEach((q, i) => {
        console.log(`\n${i+1}. Question: "${q.question}"`);
        console.log(`   Difficulty: ${q.difficulty}, Points: ${q.points}`);
        console.log(`   Options:`);
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, j) => {
            console.log(`     ${String.fromCharCode(65 + j)}. "${opt.text}" ${opt.isCorrect ? '(CORRECT)' : ''}`);
          });
        } else {
          console.log('     No options found!');
        }
      });
    } else {
      console.log('No questions found in this category!');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

