const mongoose = require('mongoose');
const IncomeExpense = require('./models/IncomeExpense');
const User = require('./models/User');
const Budget = require('./models/Budget');
const Goal = require('./models/Goal');
require('dotenv').config();

// Use the same MongoDB URI as the main application
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

const expenseCategories = ["Food", "Transport", "Housing", "Utilities", "Entertainment", "Healthcare", "Shopping", "Education"];
const incomeCategories = ["Salary", "Freelance", "Unosend", "Investments", "Gifts"];

const expenseNames = ["Lunch at Cafe", "Uber Ride", "Netflix Subscription", "Electricity Bill", "Grocery Shopping", "Movie Ticket", "New T-Shirt", "Pharmacy", "Udemy Course"];
const incomeNames = ["Monthly Salary", "Freelance Project", "Dividend Payout", "Birthday Gift"];

async function seedData() {
    try {
        const email = 'omarhashmi494@gmail.com';
        let user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found. Please register first or run reset_password.js to ensure user exists.`);
            process.exit(1);
        }

        const userId = user._id;
        console.log(`Seeding data for user: ${user.email} (${userId})`);

        // --- 1. Clear existing data for this user ---
        await IncomeExpense.deleteMany({ user: userId });
        await Budget.deleteMany({ user: userId });
        await Goal.deleteMany({ user: userId });
        console.log('Cleared existing data for this user.');

        const records = [];
        const today = new Date();

        // --- 2. Generate Transactions (Last 60 days) ---
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            // Random number of transactions per day (0 to 3)
            const numEntries = Math.floor(Math.random() * 4);

            for (let j = 0; j < numEntries; j++) {
                const isIncome = Math.random() > 0.7; // 30% chance of income

                let category, name, cost;

                if (isIncome) {
                    category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
                    name = incomeNames[Math.floor(Math.random() * incomeNames.length)];
                    // Income range: 500 - 5000
                    cost = parseFloat((Math.random() * 4500 + 500).toFixed(2));
                } else {
                    category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
                    name = expenseNames[Math.floor(Math.random() * expenseNames.length)];
                    // Expense range: 10 - 200
                    cost = parseFloat((Math.random() * 190 + 10).toFixed(2));
                }

                records.push({
                    user: userId,
                    name: name,
                    category: category,
                    cost: cost,
                    addedOn: date,
                    isIncome: isIncome,
                    note: `Auto-generated ${isIncome ? 'income' : 'expense'}`,
                    isDeleted: false,
                });
            }
        }

        // Add some guaranteed recent transactions for "Recent Transactions" view
        records.push({
            user: userId,
            name: "Netflix",
            category: "Entertainment",
            cost: 15.99,
            addedOn: new Date(),
            isIncome: false,
            note: "Monthly subscription"
        });
        records.push({
            user: userId,
            name: "Monthly Salary",
            category: "Salary",
            cost: 3500.00,
            addedOn: new Date(),
            isIncome: true,
            note: "Primary job"
        });

        await IncomeExpense.insertMany(records);
        console.log(`Inserted ${records.length} transactions.`);

        // --- 3. Create Budgets ---
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const currentYear = new Date().getFullYear();

        const budgets = [
            { category: "Food", amount: 500 },
            { category: "Entertainment", amount: 200 },
            { category: "Shopping", amount: 300 }
        ];

        const budgetRecords = budgets.map(b => ({
            user: userId,
            category: b.category,
            amount: b.amount,
            month: currentMonth,
            year: currentYear
        }));

        await Budget.insertMany(budgetRecords);
        console.log(`Inserted ${budgetRecords.length} budgets.`);

        // --- 4. Create Goals ---
        const goals = [
            { name: "New Laptop", targetAmount: 2000, currentAmount: 500, deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
            { name: "Vacation", targetAmount: 5000, currentAmount: 1200, deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) }
        ];

        const goalRecords = goals.map(g => ({
            user: userId,
            name: g.name,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            targetDate: g.deadline, // Mapped correctly
            status: 'In Progress'
        }));

        await Goal.insertMany(goalRecords);
        console.log(`Inserted ${goalRecords.length} goals.`);

        console.log('Seeding complete!');
        mongoose.connection.close();
    } catch (err) {
        console.error('Seeding failed:', err);
        mongoose.connection.close();
        process.exit(1);
    }
}

seedData();
