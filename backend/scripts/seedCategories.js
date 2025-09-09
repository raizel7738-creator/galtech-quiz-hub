const mongoose = require('mongoose');
const Category = require('../models/Category');
const User = require('../models/User');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB for seeding');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Sample categories data
const sampleCategories = [
  {
    name: 'General Mathematical Aptitude',
    description: 'Test your mathematical reasoning and problem-solving skills with comprehensive aptitude questions covering algebra, geometry, arithmetic, and logical reasoning.',
    icon: 'BookOpen',
    color: '#667eea',
    difficulty: 'beginner',
    estimatedTime: 45,
    questionCount: 0
  },
  {
    name: 'Programming Aptitude',
    description: 'Evaluate your programming logic and algorithmic thinking with coding-related questions covering data structures, algorithms, and programming concepts.',
    icon: 'Code',
    color: '#28a745',
    difficulty: 'intermediate',
    estimatedTime: 60,
    questionCount: 0
  },
  {
    name: 'Program-Based Questions',
    description: 'Analyze code snippets and understand program logic through multiple-choice questions that test your ability to trace code execution and predict outputs.',
    icon: 'Target',
    color: '#ffc107',
    difficulty: 'intermediate',
    estimatedTime: 30,
    questionCount: 0
  },
  {
    name: 'Data Structures & Algorithms',
    description: 'Advanced questions on data structures like arrays, linked lists, trees, graphs, and algorithms including sorting, searching, and dynamic programming.',
    icon: 'TrendingUp',
    color: '#dc3545',
    difficulty: 'advanced',
    estimatedTime: 90,
    questionCount: 0
  },
  {
    name: 'Database Concepts',
    description: 'Test your knowledge of database design, SQL queries, normalization, indexing, and database management systems.',
    icon: 'Database',
    color: '#17a2b8',
    difficulty: 'intermediate',
    estimatedTime: 40,
    questionCount: 0
  },
  {
    name: 'Web Development',
    description: 'Questions covering HTML, CSS, JavaScript, web frameworks, responsive design, and modern web development practices.',
    icon: 'Globe',
    color: '#6f42c1',
    difficulty: 'intermediate',
    estimatedTime: 50,
    questionCount: 0
  }
];

const seedCategories = async () => {
  try {
    console.log('🌱 Starting to seed categories...');

    // Find or create an admin user for the categories
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('📝 Creating admin user for categories...');
      adminUser = new User({
        name: 'System Admin',
        email: 'admin@galtech.edu',
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    }

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing categories');

    // Create sample categories
    const categories = sampleCategories.map(categoryData => ({
      ...categoryData,
      createdBy: adminUser._id
    }));

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Display created categories
    console.log('\n📋 Created Categories:');
    createdCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.difficulty})`);
    });

    console.log('\n🎉 Categories seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedCategories();

