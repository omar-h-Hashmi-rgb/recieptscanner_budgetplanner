const mongoose = require('mongoose');
const IncomeExpense = require('./models/IncomeExpense');
const User = require('./models/User');
require('dotenv').config();

// Use the same MongoDB URI as the main application
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const categories = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Freelance", "Salary", "Investments"];
const names = ["Lunch", "Bus Fare", "Netflix", "Electric Bill", "Client Payment", "Bonus", "Snacks", "Movie"];

async function seedData() {
  try {
    // Find an existing user or create one for testing
    let user = await User.findOne();
    if (!user) {
      console.log('No users found, creating a test user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await User.create({
        email: 'test@example.com',
        password: hashedPassword
      });
      console.log('Test user created:', user.email);
    }
    
    const userId = user._id;
    console.log('Using user:', user.email);
    
    // Clear existing transactions for this user only
    await IncomeExpense.deleteMany({ user: userId });

    const records = [];
    const today = new Date();

    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i); // go back i days

      const numEntries = Math.floor(Math.random() * 3) + 1; // 1–3 records per day

      for (let j = 0; j < numEntries; j++) {
        const isIncome = Math.random() > 0.5;
        const record = {
          user: userId,
          name: names[Math.floor(Math.random() * names.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          cost: parseFloat((Math.random() * (isIncome ? 2000 : 500)).toFixed(2)),
          addedOn: date,
          isIncome,
          note: isIncome ? "Received income" : "Spent money",
          isDeleted: false,
        };
        records.push(record);
      }
    }

    await IncomeExpense.insertMany(records);
    console.log(`Inserted ${records.length} income/expense records`);

    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Seeding failed:', err);
    mongoose.connection.close();
  }
}

seedData();

