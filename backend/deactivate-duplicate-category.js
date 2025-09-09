const mongoose = require('mongoose');
const Category = require('./models/Category');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub');
    const dup = await Category.findOne({ name: 'Mathematical Aptitude' });
    if (!dup) {
      console.log('No duplicate category found.');
    } else {
      await Category.updateOne({ _id: dup._id }, { $set: { isActive: false } });
      console.log('Deactivated:', dup.name, dup._id.toString());
    }
    const active = await Category.find({ isActive: true }).select('name');
    console.log('Active categories:', active.map(c => c.name));
  } catch (e) {
    console.error(e.message);
  } finally {
    await mongoose.disconnect();
  }
})();
