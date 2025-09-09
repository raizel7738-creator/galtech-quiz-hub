const mongoose = require('mongoose');
const Question = require('./models/Question');
const Category = require('./models/Category');
const User = require('./models/User');

// Sample questions data
const sampleQuestions = [
  // General Mathematical Aptitude Questions
  {
    question: "What is the value of 15 + 27?",
    type: "mcq",
    difficulty: "easy",
    points: 1,
    options: [
      { text: "42", isCorrect: true },
      { text: "41", isCorrect: false },
      { text: "43", isCorrect: false },
      { text: "40", isCorrect: false }
    ],
    correctAnswer: "42",
    explanation: "15 + 27 = 42. This is basic addition.",
    tags: ["arithmetic", "addition", "basic"],
    status: "active"
  },
  {
    question: "If a train travels 120 km in 2 hours, what is its average speed?",
    type: "mcq",
    difficulty: "medium",
    points: 2,
    options: [
      { text: "60 km/h", isCorrect: true },
      { text: "50 km/h", isCorrect: false },
      { text: "70 km/h", isCorrect: false },
      { text: "80 km/h", isCorrect: false }
    ],
    correctAnswer: "60 km/h",
    explanation: "Average speed = Distance / Time = 120 km / 2 hours = 60 km/h",
    tags: ["speed", "distance", "time", "physics"],
    status: "active"
  },
  {
    question: "What is the area of a circle with radius 7 cm? (Use π = 22/7)",
    type: "mcq",
    difficulty: "medium",
    points: 3,
    options: [
      { text: "154 cm²", isCorrect: true },
      { text: "44 cm²", isCorrect: false },
      { text: "88 cm²", isCorrect: false },
      { text: "308 cm²", isCorrect: false }
    ],
    correctAnswer: "154 cm²",
    explanation: "Area of circle = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm²",
    tags: ["geometry", "circle", "area", "pi"],
    status: "active"
  },

  // Programming Aptitude Questions
  {
    question: "What will be the output of the following code?\n\nint x = 5;\nint y = x++;\nprintf(\"%d %d\", x, y);",
    type: "mcq",
    difficulty: "medium",
    points: 2,
    options: [
      { text: "6 5", isCorrect: true },
      { text: "5 6", isCorrect: false },
      { text: "6 6", isCorrect: false },
      { text: "5 5", isCorrect: false }
    ],
    correctAnswer: "6 5",
    explanation: "x++ is post-increment, so y gets the value of x (5) before x is incremented to 6.",
    tags: ["c", "increment", "post-increment", "output"],
    status: "active"
  },
  {
    question: "Which data structure follows LIFO (Last In, First Out) principle?",
    type: "mcq",
    difficulty: "easy",
    points: 1,
    options: [
      { text: "Stack", isCorrect: true },
      { text: "Queue", isCorrect: false },
      { text: "Array", isCorrect: false },
      { text: "Linked List", isCorrect: false }
    ],
    correctAnswer: "Stack",
    explanation: "Stack follows LIFO principle where the last element added is the first one to be removed.",
    tags: ["data-structures", "stack", "lifo", "concepts"],
    status: "active"
  },
  {
    question: "What is the time complexity of binary search?",
    type: "mcq",
    difficulty: "medium",
    points: 2,
    options: [
      { text: "O(log n)", isCorrect: true },
      { text: "O(n)", isCorrect: false },
      { text: "O(n²)", isCorrect: false },
      { text: "O(1)", isCorrect: false }
    ],
    correctAnswer: "O(log n)",
    explanation: "Binary search has O(log n) time complexity because it eliminates half of the search space in each iteration.",
    tags: ["algorithms", "binary-search", "time-complexity", "big-o"],
    status: "active"
  },

  // Program-Based Questions
  {
    question: "What will be the output of this Python code?\n\ndef func(x):\n    if x > 0:\n        return x + func(x-1)\n    else:\n        return 0\n\nprint(func(3))",
    type: "mcq",
    difficulty: "hard",
    points: 3,
    options: [
      { text: "6", isCorrect: true },
      { text: "3", isCorrect: false },
      { text: "9", isCorrect: false },
      { text: "Error", isCorrect: false }
    ],
    correctAnswer: "6",
    explanation: "This is a recursive function that calculates the sum of numbers from 3 down to 1: 3 + 2 + 1 + 0 = 6",
    tags: ["python", "recursion", "functions", "output"],
    status: "active"
  },
  {
    question: "Which sorting algorithm has the best average-case time complexity?",
    type: "mcq",
    difficulty: "medium",
    points: 2,
    options: [
      { text: "Merge Sort", isCorrect: true },
      { text: "Bubble Sort", isCorrect: false },
      { text: "Selection Sort", isCorrect: false },
      { text: "Insertion Sort", isCorrect: false }
    ],
    correctAnswer: "Merge Sort",
    explanation: "Merge Sort has O(n log n) time complexity in all cases (best, average, worst), making it very efficient.",
    tags: ["sorting", "algorithms", "merge-sort", "time-complexity"],
    status: "active"
  },

  // Data Structures & Algorithms Questions
  {
    question: "What is the maximum number of nodes in a binary tree of height h?",
    type: "mcq",
    difficulty: "hard",
    points: 3,
    options: [
      { text: "2^(h+1) - 1", isCorrect: true },
      { text: "2^h - 1", isCorrect: false },
      { text: "2^h", isCorrect: false },
      { text: "h^2", isCorrect: false }
    ],
    correctAnswer: "2^(h+1) - 1",
    explanation: "A complete binary tree of height h has at most 2^(h+1) - 1 nodes.",
    tags: ["binary-tree", "data-structures", "height", "nodes"],
    status: "active"
  },
  {
    question: "Which traversal method visits the root node first?",
    type: "mcq",
    difficulty: "easy",
    points: 1,
    options: [
      { text: "Preorder", isCorrect: true },
      { text: "Inorder", isCorrect: false },
      { text: "Postorder", isCorrect: false },
      { text: "Level order", isCorrect: false }
    ],
    correctAnswer: "Preorder",
    explanation: "Preorder traversal visits the root node first, then left subtree, then right subtree.",
    tags: ["tree-traversal", "preorder", "data-structures"],
    status: "active"
  },

  // Database Concepts Questions
  {
    question: "Which SQL command is used to retrieve data from a database?",
    type: "mcq",
    difficulty: "easy",
    points: 1,
    options: [
      { text: "SELECT", isCorrect: true },
      { text: "GET", isCorrect: false },
      { text: "FETCH", isCorrect: false },
      { text: "RETRIEVE", isCorrect: false }
    ],
    correctAnswer: "SELECT",
    explanation: "SELECT is the SQL command used to retrieve data from database tables.",
    tags: ["sql", "database", "select", "queries"],
    status: "active"
  },
  {
    question: "What does ACID stand for in database transactions?",
    type: "mcq",
    difficulty: "medium",
    points: 2,
    options: [
      { text: "Atomicity, Consistency, Isolation, Durability", isCorrect: true },
      { text: "Access, Control, Integrity, Data", isCorrect: false },
      { text: "Authentication, Confidentiality, Integrity, Data", isCorrect: false },
      { text: "All, Create, Insert, Delete", isCorrect: false }
    ],
    correctAnswer: "Atomicity, Consistency, Isolation, Durability",
    explanation: "ACID properties ensure reliable database transactions: Atomicity, Consistency, Isolation, and Durability.",
    tags: ["database", "acid", "transactions", "properties"],
    status: "active"
  },

  // Web Development Questions
  {
    question: "What does HTML stand for?",
    type: "mcq",
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
    tags: ["html", "web-development", "markup", "basics"],
    status: "active"
  },
  {
    question: "Which CSS property is used to change the text color?",
    type: "mcq",
    difficulty: "easy",
    points: 1,
    options: [
      { text: "color", isCorrect: true },
      { text: "text-color", isCorrect: false },
      { text: "font-color", isCorrect: false },
      { text: "text-style", isCorrect: false }
    ],
    correctAnswer: "color",
    explanation: "The 'color' property in CSS is used to set the color of text content.",
    tags: ["css", "styling", "text", "color"],
    status: "active"
  }
];

const seedQuestions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub');
    console.log('✅ Connected to MongoDB');

    // Get categories and admin user
    const categories = await Category.find({});
    const adminUser = await User.findOne({ role: 'admin' });

    if (categories.length === 0) {
      console.log('❌ No categories found. Please run the category seed script first.');
      return;
    }

    if (!adminUser) {
      console.log('❌ No admin user found. Please run the user seed script first.');
      return;
    }

    // Clear existing questions
    await Question.deleteMany({});
    console.log('🗑️  Cleared existing questions');

    // Create questions with proper category assignment
    const questionsToCreate = sampleQuestions.map((questionData, index) => {
      // Assign questions to categories in a round-robin fashion
      const categoryIndex = index % categories.length;
      const category = categories[categoryIndex];

      return {
        ...questionData,
        category: category._id,
        createdBy: adminUser._id
      };
    });

    const createdQuestions = await Question.insertMany(questionsToCreate);
    console.log(`✅ Created ${createdQuestions.length} sample questions`);

    // Update category question counts
    for (const category of categories) {
      const questionCount = await Question.countDocuments({ 
        category: category._id, 
        status: 'active' 
      });
      await Category.findByIdAndUpdate(category._id, { questionCount });
    }

    console.log('✅ Updated category question counts');

    // Display summary
    console.log('\n📊 Questions Summary:');
    for (const category of categories) {
      const count = await Question.countDocuments({ 
        category: category._id, 
        status: 'active' 
      });
      console.log(`   ${category.name}: ${count} questions`);
    }

    console.log('\n🎉 Question seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    process.exit(1);
  }
};

// Run the seed function
seedQuestions();

