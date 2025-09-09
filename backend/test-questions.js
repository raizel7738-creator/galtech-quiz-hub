const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/galtech-quiz-hub')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const categoryId = '68b70b32325579429c94b7ee'; // Programming Aptitude category
    
    // Test the same query that the API uses
    const questions = await Question.find({ 
      category: categoryId,
      type: 'mcq',
      status: 'active'
    })
    .limit(10)
    .sort({ createdAt: -1 });
    
    console.log(`\nFound ${questions.length} questions using API query:`);
    
    if (questions.length > 0) {
      const firstQuestion = questions[0];
      console.log('\nFirst Question (API format):');
      console.log('ID:', firstQuestion._id);
      console.log('Question Text:', firstQuestion.question);
      console.log('Difficulty:', firstQuestion.difficulty);
      console.log('Points:', firstQuestion.points);
      console.log('Options Count:', firstQuestion.options?.length || 0);
      
      if (firstQuestion.options && firstQuestion.options.length > 0) {
        console.log('Options:');
        firstQuestion.options.forEach((opt, i) => {
          console.log(`  ${String.fromCharCode(65 + i)}. "${opt.text}" (Correct: ${opt.isCorrect})`);
        });
      }
      
      // Test the exact format that would be sent to frontend
      const apiResponse = {
        success: true,
        data: {
          questions: questions
        }
      };
      
      console.log('\nAPI Response Format:');
      console.log(JSON.stringify(apiResponse, null, 2));
    } else {
      console.log('No questions found!');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

