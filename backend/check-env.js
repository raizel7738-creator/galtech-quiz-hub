const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub');
    const admin = await User.findOne({ role: 'admin' });
    const cats = await Category.find({ name: { $in: ['General Mathematical Aptitude', 'Program-Based Questions'] } }).select('name');
    console.log({ hasAdmin: !!admin, adminEmail: admin?.email, categories: cats.map(c => c.name) });
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
})();
