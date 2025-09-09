const mongoose = require('mongoose');
const Question = require('./models/Question');
const Category = require('./models/Category');
const User = require('./models/User');

const LANGUAGES = ['python', 'java', 'cpp', 'javascript'];

function buildQuestionsForLanguage(language, categoryId, adminId) {
  const questions = [];
  for (let i = 1; i <= 10; i++) {
    const base = {
      type: 'program',
      category: categoryId,
      difficulty: 'easy',
      points: 1,
      tags: [language, 'beginner'],
      status: 'active',
      createdBy: adminId
    };

    if (language === 'python') {
      const codeSnippet = `x = ${i}
print(x * 2)`;
      const expected = String(i * 2);
      questions.push({
        ...base,
        question: `Python Output Q${i}: Given x=${i}, what does print(x * 2) output?`,
        programQuestion: {
          codeSnippet,
          language: 'python',
          expectedOutput: expected,
          testCases: [],
          analysisType: 'output',
          hints: []
        },
        options: [
          { text: expected, isCorrect: true },
          { text: String(i + 2), isCorrect: false },
          { text: String(i * 3), isCorrect: false },
          { text: 'Error', isCorrect: false }
        ],
        correctAnswer: expected,
        explanation: `The variable x is ${i}, so x * 2 = ${i * 2}.`
      });
    } else if (language === 'javascript') {
      const codeSnippet = `const x = ${i};
console.log(x + ${i});`;
      const expected = String(i + i);
      questions.push({
        ...base,
        question: `JavaScript Output Q${i}: With x=${i}, what does console.log(x + ${i}) print?`,
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
          { text: String(i - 1), isCorrect: false },
          { text: String(i * 2 + 1), isCorrect: false },
          { text: 'undefined', isCorrect: false }
        ],
        correctAnswer: expected,
        explanation: `x is ${i}; x + ${i} = ${i + i}.`
      });
    } else if (language === 'java') {
      const codeSnippet = `public class Main {
  public static void main(String[] args) {
    int x = ${i};
    System.out.println(x - 1);
  }
}`;
      const expected = String(i - 1);
      questions.push({
        ...base,
        question: `Java Output Q${i}: For x=${i}, what does System.out.println(x - 1) print?`,
        programQuestion: {
          codeSnippet,
          language: 'java',
          expectedOutput: expected,
          testCases: [],
          analysisType: 'output',
          hints: []
        },
        options: [
          { text: expected, isCorrect: true },
          { text: String(i), isCorrect: false },
          { text: String(i + 1), isCorrect: false },
          { text: 'Compilation Error', isCorrect: false }
        ],
        correctAnswer: expected,
        explanation: `x is ${i}; printing x - 1 gives ${i - 1}.`
      });
    } else if (language === 'cpp') {
      const codeSnippet = `#include <iostream>
using namespace std;
int main(){
  int x = ${i};
  cout << x + 1;
  return 0;
}`;
      const expected = String(i + 1);
      questions.push({
        ...base,
        question: `C++ Output Q${i}: If x=${i}, what does cout << x + 1 output?`,
        programQuestion: {
          codeSnippet,
          language: 'cpp',
          expectedOutput: expected,
          testCases: [],
          analysisType: 'output',
          hints: []
        },
        options: [
          { text: expected, isCorrect: true },
          { text: String(i), isCorrect: false },
          { text: String(i + 2), isCorrect: false },
          { text: '0', isCorrect: false }
        ],
        correctAnswer: expected,
        explanation: `x is ${i}; x + 1 prints ${i + 1}.`
      });
    }
  }
  return questions;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub');
    console.log('✅ Connected to MongoDB');

    const programCategory = await Category.findOne({ name: 'Program-Based Questions' });
    if (!programCategory) {
      console.error('❌ Program-Based Questions category not found');
      process.exit(1);
    }
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    // Remove existing generated beginner questions for these languages in this category
    await Question.deleteMany({
      type: 'program',
      category: programCategory._id,
      'programQuestion.language': { $in: LANGUAGES }
    });
    console.log('🗑️  Cleared existing program questions for target languages');

    let all = [];
    for (const lang of LANGUAGES) {
      const qs = buildQuestionsForLanguage(lang, programCategory._id, admin._id);
      all = all.concat(qs);
    }

    const created = await Question.insertMany(all);
    console.log(`✅ Inserted ${created.length} questions (${created.length / LANGUAGES.length} per language)`);

    // Update question count on category
    const count = await Question.countDocuments({ category: programCategory._id, status: 'active' });
    await Category.findByIdAndUpdate(programCategory._id, { questionCount: count });
    console.log('📊 Updated category questionCount:', count);

    console.log('🎉 Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

run();


