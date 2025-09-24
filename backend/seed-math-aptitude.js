const mongoose = require('mongoose');
const Question = require('./models/Question');
const Category = require('./models/Category');
const User = require('./models/User');

// Curated easy-to-moderate General Mathematical Aptitude MCQs
// Topics: percentages, ratios, averages, profit & loss, simple interest,
// time-speed-distance, time & work, numbers, HCF/LCM, mixtures.

const QUESTIONS = [
  { q: 'If a number increases from 80 to 100, what is the percentage increase?', options: ['20%', '25%', '15%', '18%'], answer: '25%', expl: 'Increase = 100 − 80 = 20. Percentage = (20/80)×100 = 25%.' },
  { q: 'A shopkeeper offers a discount of 20% on an article marked at Rs. 750. What is the selling price?', options: ['Rs. 560', 'Rs. 600', 'Rs. 620', 'Rs. 650'], answer: 'Rs. 600', expl: 'Discount = 20% of 750 = 150. Selling price = 750 − 150 = 600.' },
  { q: 'The ratio of two numbers is 3:5 and their sum is 64. What is the larger number?', options: ['24', '30', '40', '45'], answer: '40', expl: 'Let numbers be 3x and 5x. 8x = 64 ⇒ x = 8. Larger = 5x = 40.' },
  { q: 'The average of 6 numbers is 15. If the number 27 is removed, what is the new average?', options: ['12', '12.6', '13', '14'], answer: '12.6', expl: 'Total = 6×15 = 90. Removing 27 ⇒ 63 over 5 numbers ⇒ 63/5 = 12.6.' },
  { q: 'A man covers 60 km at 30 km/h and the next 60 km at 60 km/h. What is his average speed for the whole journey?', options: ['40 km/h', '45 km/h', '48 km/h', '50 km/h'], answer: '40 km/h', expl: 'Time = 60/30 + 60/60 = 2 + 1 = 3 h. Avg speed = 120/3 = 40 km/h.' },
  { q: 'Simple interest on Rs. 4000 at 5% per annum for 3 years is:', options: ['Rs. 500', 'Rs. 600', 'Rs. 700', 'Rs. 750'], answer: 'Rs. 600', expl: 'SI = (P×R×T)/100 = (4000×5×3)/100 = 600.' },
  { q: 'Two pipes can fill a tank in 12 min and 18 min respectively. Together they will fill the tank in:', options: ['7.2 min', '8 min', '9 min', '10 min'], answer: '7.2 min', expl: 'Rate = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 min.' },
  { q: 'The LCM of 12, 15 and 20 is:', options: ['60', '120', '180', '240'], answer: '60', expl: 'LCM = 2^2 × 3 × 5 = 60.' },
  { q: 'A sum of money doubles itself in 5 years at simple interest. The rate of interest per annum is:', options: ['10%', '12.5%', '15%', '20%'], answer: '20%', expl: 'For SI, to double in T years, R = 100/T = 20%.' },
  { q: 'A and B can do a piece of work in 12 days and 15 days respectively. Together they will complete it in:', options: ['6 2/3 days', '6 1/2 days', '7 days', '8 days'], answer: '6 2/3 days', expl: 'Rate = 1/12 + 1/15 = 3/20 ⇒ Time = 20/3 = 6 2/3 days (≈ 6.67 days).' },
  { q: 'If the selling price is 16% more than the cost price, the profit percent is:', options: ['12%', '14%', '16%', '20%'], answer: '16%', expl: 'SP = 1.16×CP ⇒ Profit% = 16%.' },
  { q: 'The average of the first 10 natural numbers is:', options: ['5', '5.5', '6', '6.5'], answer: '5.5', expl: 'Average of 1..n = (n+1)/2. For n = 10 ⇒ 11/2 = 5.5.' },
  { q: 'A train 180 m long crosses a pole in 12 s. Its speed is:', options: ['45 km/h', '50 km/h', '54 km/h', '60 km/h'], answer: '54 km/h', expl: 'Speed = 180/12 = 15 m/s = 54 km/h.' },
  { q: 'In a 12-liter mixture of milk and water, milk:water = 3:1. If 4 liters of water are added, the new ratio (milk:water) is:', options: ['9:7', '3:2', '4:3', '2:1'], answer: '9:7', expl: 'Initially milk = 9, water = 3. Add 4 water ⇒ water = 7. Ratio = 9:7.' },
  { q: 'The compound interest on Rs. 1000 at 10% p.a. for 2 years (annual compounding) is:', options: ['Rs. 200', 'Rs. 210', 'Rs. 220', 'Rs. 240'], answer: 'Rs. 210', expl: 'Amount = 1000×(1.1)^2 = 1210 ⇒ CI = 210.' },
  { q: 'What is the value of 3/5 of 250?', options: ['100', '120', '130', '150'], answer: '150', expl: '3/5 of 250 = 150.' },
  { q: 'If 40% of a number is 88, the number is:', options: ['200', '210', '220', '230'], answer: '220', expl: '0.4x = 88 ⇒ x = 220.' },
  { q: 'The HCF (GCD) of 36 and 84 is:', options: ['6', '12', '18', '24'], answer: '12', expl: '36 = 2^2×3^2; 84 = 2^2×3×7 ⇒ HCF = 2^2×3 = 12.' },
  { q: 'A person walks at 5 km/h for 3 hours and then at 4 km/h for 2 hours. Total distance covered is:', options: ['21 km', '22 km', '23 km', '25 km'], answer: '23 km', expl: 'Distance = 5×3 + 4×2 = 15 + 8 = 23 km.' },
  { q: 'If CP = Rs. 500 and profit = 12%, what is the SP?', options: ['Rs. 540', 'Rs. 560', 'Rs. 580', 'Rs. 600'], answer: 'Rs. 560', expl: 'SP = CP×(1 + 12/100) = 560.' }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub');
    console.log('✅ Connected to MongoDB');

    const category = await Category.findOne({ name: 'General Mathematical Aptitude' });
    if (!category) {
      console.error('❌ Category "General Mathematical Aptitude" not found.');
      process.exit(1);
    }
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    // Remove existing MCQs in this category
    await Question.deleteMany({ category: category._id, type: 'mcq' });
    console.log('🗑️  Removed existing MCQs in General Mathematical Aptitude');

    // Build question docs
    const docs = QUESTIONS.map((item, idx) => ({
      question: item.q,
      type: 'mcq',
      category: category._id,
      difficulty: 'easy',
      points: 1,
      options: item.options.map(text => ({ text, isCorrect: text === item.answer })),
      correctAnswer: item.answer,
      explanation: item.expl,
      tags: ['aptitude', 'math', 'beginner'],
      status: 'active',
      createdBy: admin._id
    }));

    const created = await Question.insertMany(docs);
    console.log(`✅ Inserted ${created.length} aptitude MCQs`);

    // Update category questionCount
    const count = await Question.countDocuments({ category: category._id, status: 'active' });
    await Category.findByIdAndUpdate(category._id, { questionCount: count });
    console.log('📊 Updated category questionCount:', count);

    console.log('🎉 Math aptitude seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

run();
