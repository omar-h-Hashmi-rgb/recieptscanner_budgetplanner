const mongoose = require('mongoose');
const Budget = require('./models/Budget');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

async function createTestBudgets() {
  try {
    // Find an existing user
    const user = await User.findOne();
    if (!user) {
      console.log('No users found');
      return;
    }
    
    const userId = user._id;
    console.log('Using user:', user.email);
    
    // Clear existing budgets for this user
    await Budget.deleteMany({ user: userId });
    
    // Create some test budgets for the current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const testBudgets = [
      {
        user: userId,
        category: 'Food',
        amount: 500,
        month: currentMonth,
        year: currentYear
      },
      {
        user: userId,
        category: 'Transport',
        amount: 200,
        month: currentMonth,
        year: currentYear
      },
      {
        user: userId,
        category: 'Entertainment',
        amount: 150,
        month: currentMonth,
        year: currentYear
      }
    ];
    
    await Budget.insertMany(testBudgets);
    console.log(`Created ${testBudgets.length} test budgets for ${currentMonth}/${currentYear}`);
    
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

createTestBudgets();