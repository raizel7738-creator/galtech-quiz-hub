const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/galtech-quiz-hub')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const categoryId = '68b70b32325579429c94b7ee'; // Programming Aptitude category
    
    // Add fresh programming questions
    const programmingQuestions = [
      {
        question: "What is the time complexity of binary search?",
        type: "mcq",
        category: categoryId,
        difficulty: "medium",
        points: 2,
        options: [
          { text: "O(n)", isCorrect: false },
          { text: "O(log n)", isCorrect: true },
          { text: "O(n²)", isCorrect: false },
          { text: "O(1)", isCorrect: false }
        ],
        correctAnswer: "O(log n)",
        explanation: "Binary search has O(log n) time complexity because it eliminates half of the search space in each iteration.",
        tags: ["algorithms", "complexity", "search"],
        status: "active",
        createdBy: "68b6ffd987f8275420ddd459"
      },
      {
        question: "Which data structure uses LIFO (Last In, First Out) principle?",
        type: "mcq",
        category: categoryId,
        difficulty: "easy",
        points: 1,
        options: [
          { text: "Queue", isCorrect: false },
          { text: "Stack", isCorrect: true },
          { text: "Array", isCorrect: false },
          { text: "Linked List", isCorrect: false }
        ],
        correctAnswer: "Stack",
        explanation: "Stack follows LIFO principle where the last element added is the first one to be removed.",
        tags: ["data-structures", "stack", "lifo"],
        status: "active",
        createdBy: "68b6ffd987f8275420ddd459"
      },
      {
        question: "What does HTML stand for?",
        type: "mcq",
        category: categoryId,
        difficulty: "easy",
        points: 1,
        options: [
          { text: "HyperText Markup Language", isCorrect: true },
          { text: "High-level Text Markup Language", isCorrect: false },
          { text: "Home Tool Markup Language", isCorrect: false },
          { text: "Hyperlink and Text Markup Language", isCorrect: false }
        ],
        correctAnswer: "HyperText Markup Language",
        explanation: "HTML stands for HyperText Markup Language, used for creating web pages.",
        tags: ["html", "web-development", "markup"],
        status: "active",
        createdBy: "68b6ffd987f8275420ddd459"
      },
      {
        question: "Which programming language is known for its use in data science and machine learning?",
        type: "mcq",
        category: categoryId,
        difficulty: "medium",
        points: 2,
        options: [
          { text: "Java", isCorrect: false },
          { text: "Python", isCorrect: true },
          { text: "C++", isCorrect: false },
          { text: "JavaScript", isCorrect: false }
        ],
        correctAnswer: "Python",
        explanation: "Python is widely used in data science and machine learning due to its extensive libraries like NumPy, Pandas, and TensorFlow.",
        tags: ["python", "data-science", "machine-learning"],
        status: "active",
        createdBy: "68b6ffd987f8275420ddd459"
      },
      {
        question: "What is the purpose of CSS in web development?",
        type: "mcq",
        category: categoryId,
        difficulty: "easy",
        points: 1,
        options: [
          { text: "To create web pages", isCorrect: false },
          { text: "To style web pages", isCorrect: true },
          { text: "To add functionality", isCorrect: false },
          { text: "To store data", isCorrect: false }
        ],
        correctAnswer: "To style web pages",
        explanation: "CSS (Cascading Style Sheets) is used to style and format web pages, controlling layout, colors, fonts, etc.",
        tags: ["css", "web-development", "styling"],
        status: "active",
        createdBy: "68b6ffd987f8275420ddd459"
      },
      {
        question: "Which sorting algorithm has the best average-case time complexity?",
        type: "mcq",
        category: categoryId,
        difficulty: "hard",
        points: 3,
        options: [
          { text: "Bubble Sort", isCorrect: false },
          { text: "Quick Sort", isCorrect: true },
          { text: "Selection Sort", isCorrect: false },
          { text: "Insertion Sort", isCorrect: false }
        ],
        correctAnswer: "Quick Sort",
        explanation: "Quick Sort has O(n log n) average-case time complexity, making it one of the most efficient sorting algorithms.",
        tags: ["algorithms", "sorting", "complexity"],
        status: "active",
        createdBy: "68b6ffd987f8275420ddd459"
      },
      {
        question: "What is a variable in programming?",
        type: "mcq",
        category: categoryId,
        difficulty: "easy",
        points: 1,
        options: [
          { text: "A fixed value", isCorrect: false },
          { text: "A storage location with a name", isCorrect: true },
          { text: "A function", isCorrect: false },
          { text: "A data type", isCorrect: false }
        ],
        correctAnswer: "A storage location with a name",
        explanation: "A variable is a storage location with an associated name that can hold data values.",
        tags: ["programming", "variables", "basics"],
        status: "active",
        createdBy: "68b6ffd987f8275420ddd459"
      },
      {
        question: "Which of the following is NOT a programming paradigm?",
        type: "mcq",
        category: categoryId,
        difficulty: "medium",
        points: 2,
        options: [
          { text: "Object-Oriented Programming", isCorrect: false },
          { text: "Functional Programming", isCorrect: false },
          { text: "Procedural Programming", isCorrect: false },
          { text: "Database Programming", isCorrect: true }
        ],
        correctAnswer: "Database Programming",
        explanation: "Database Programming is not a programming paradigm. The main paradigms are OOP, Functional, and Procedural programming.",
        tags: ["programming", "paradigms", "concepts"],
        status: "active",
        createdBy: "68b6ffd987f8275420ddd459"
      },
      {
        question: "What does API stand for in programming?",
        type: "mcq",
        category: categoryId,
        difficulty: "medium",
        points: 2,
        options: [
          { text: "Application Programming Interface", isCorrect: true },
          { text: "Advanced Programming Interface", isCorrect: false },
          { text: "Automated Programming Interface", isCorrect: false },
          { text: "Application Process Interface", isCorrect: false }
        ],
        correctAnswer: "Application Programming Interface",
        explanation: "API stands for Application Programming Interface, which allows different software applications to communicate with each other.",
        tags: ["programming", "api", "web-development"],
        status: "active",
        createdBy: "68b6ffd987f8275420ddd459"
      },
      {
        question: "Which JavaScript method is used to add an element to the end of an array?",
        type: "mcq",
        category: categoryId,
        difficulty: "easy",
        points: 1,
        options: [
          { text: "push()", isCorrect: true },
          { text: "pop()", isCorrect: false },
          { text: "shift()", isCorrect: false },
          { text: "unshift()", isCorrect: false }
        ],
        correctAnswer: "push()",
        explanation: "The push() method adds one or more elements to the end of an array and returns the new length of the array.",
        tags: ["javascript", "arrays", "methods"],
        status: "active",
        createdBy: "68b6ffd987f8275420ddd459"
      }
    ];
    
    // Add all questions
    console.log('Adding fresh programming questions...');
    for (const questionData of programmingQuestions) {
      const question = new Question(questionData);
      await question.save();
      console.log(`Added: ${questionData.question}`);
    }
    
    console.log(`\n✅ Successfully added ${programmingQuestions.length} fresh programming questions!`);
    
    // Verify the questions
    const finalQuestions = await Question.find({ category: categoryId });
    console.log(`\nFinal count: ${finalQuestions.length} questions in Programming Aptitude category`);
    
    finalQuestions.forEach((q, i) => {
      console.log(`${i+1}. ${q.question}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

