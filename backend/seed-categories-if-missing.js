const mongoose = require('mongoose');
const Category = require('./models/Category');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) throw new Error('Admin user not found');

    const defs = [
      {
        name: 'General Mathematical Aptitude',
        description: 'Test your mathematical reasoning and problem-solving skills with beginner-friendly MCQs.',
        icon: 'Calculator',
        color: '#22c55e'
      },
      {
        name: 'Program-Based Questions',
        description: 'Analyze code snippets and determine outputs with beginner-friendly questions.',
        icon: 'Code',
        color: '#6366f1'
      }
    ];

    for (const d of defs) {
      const existing = await Category.findOne({ name: d.name });
      if (!existing) {
        await Category.create({ ...d, createdBy: admin._id, isActive: true });
        console.log('Created category:', d.name);
      } else {
        console.log('Category exists:', d.name);
      }
    }

    process.exit(0);
  } catch (e) {
    console.error('Seed categories error:', e.message);
    process.exit(1);
  }
})();


