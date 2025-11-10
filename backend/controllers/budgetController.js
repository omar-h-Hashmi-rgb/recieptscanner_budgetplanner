const mongoose = require("mongoose");
const Budget = require('../models/Budget.js');
const IncomeExpense = require('../models/IncomeExpense.js');

const createBudget = async (req, res) => {
    try {
        const { category, amount, month, year } = req.body;
        const budget = new Budget({ user: req.user.id, category, amount, month, year });
        const savedBudget = await budget.save();
        res.status(201).json(savedBudget);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id });

        const budgetsWithSpent = await Promise.all(
            budgets.map(async (b) => {
                const startDate = new Date(b.year, b.month - 1, 1);
                const endDate = new Date(b.year, b.month, 0, 23, 59, 59);

                const result = await IncomeExpense.aggregate([
                    {
                        $match: {
                            user: new mongoose.Types.ObjectId(req.user.id),
                            category: b.category,
                            isIncome: false,
                            addedOn: { $gte: startDate, $lte: endDate },
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSpent: { $sum: "$cost" }
                        }
                    }
                ]);

                const spent = result[0]?.totalSpent || 0;

                return {
                    ...b.toObject(),
                    spent,
                    remaining: b.amount - spent
                };
            })
        );

        res.status(200).json(budgetsWithSpent);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        await budget.deleteOne();
        res.json({ message: 'Budget deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const getBudgetVsActual = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        const currentYear = currentDate.getFullYear();

        // Get current month's budgets
        const budgets = await Budget.find({ 
            user: req.user.id, 
            month: currentMonth, 
            year: currentYear 
        });

        if (budgets.length === 0) {
            return res.status(200).json([]);
        }

        const budgetReport = await Promise.all(
            budgets.map(async (budget) => {
                const startDate = new Date(budget.year, budget.month - 1, 1);
                const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

                const result = await IncomeExpense.aggregate([
                    {
                        $match: {
                            user: new mongoose.Types.ObjectId(req.user.id),
                            category: budget.category,
                            isIncome: false,
                            addedOn: { $gte: startDate, $lte: endDate },
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSpent: { $sum: "$cost" }
                        }
                    }
                ]);

                const spent = result[0]?.totalSpent || 0;
                const remaining = budget.amount - spent;
                const percentageSpent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

                // Determine status
                let status = 'safe';
                if (percentageSpent >= 100) {
                    status = 'over';
                } else if (percentageSpent >= 80) {
                    status = 'warning';
                } else if (percentageSpent >= 60) {
                    status = 'caution';
                }

                return {
                    category: budget.category,
                    budget: budget.amount,
                    spent,
                    remaining,
                    percentageSpent: Math.round(percentageSpent * 100) / 100,
                    status,
                    month: budget.month,
                    year: budget.year
                };
            })
        );

        res.status(200).json(budgetReport);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get spending insights and alerts
const getSpendingInsights = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        // Get current month spending by category
        const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const currentMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        const currentMonthSpending = await IncomeExpense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id),
                    isIncome: false,
                    addedOn: { $gte: currentMonthStart, $lte: currentMonthEnd },
                }
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$cost" }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Get last month spending by category
        const lastMonthStart = new Date(lastMonthYear, lastMonth - 1, 1);
        const lastMonthEnd = new Date(lastMonthYear, lastMonth, 0, 23, 59, 59);

        const lastMonthSpending = await IncomeExpense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id),
                    isIncome: false,
                    addedOn: { $gte: lastMonthStart, $lte: lastMonthEnd },
                }
            },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$cost" }
                }
            }
        ]);

        // Create comparison data
        const lastMonthMap = new Map(lastMonthSpending.map(item => [item._id, item.total]));
        
        const insights = currentMonthSpending.map(current => {
            const lastMonthAmount = lastMonthMap.get(current._id) || 0;
            const change = lastMonthAmount > 0 ? ((current.total - lastMonthAmount) / lastMonthAmount) * 100 : 0;
            
            return {
                category: current._id,
                currentMonth: current.total,
                lastMonth: lastMonthAmount,
                change: Math.round(change * 100) / 100,
                changeType: change > 10 ? 'increase' : change < -10 ? 'decrease' : 'stable'
            };
        });

        // Generate alerts
        const alerts = [];
        insights.forEach(insight => {
            if (insight.change > 50) {
                alerts.push({
                    type: 'warning',
                    message: `Your ${insight.category} spending increased by ${insight.change.toFixed(1)}% compared to last month`,
                    category: insight.category
                });
            }
        });

        res.status(200).json({
            insights,
            alerts,
            totalCurrentMonth: currentMonthSpending.reduce((sum, item) => sum + item.total, 0),
            totalLastMonth: lastMonthSpending.reduce((sum, item) => sum + item.total, 0)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = { createBudget, getBudgets, deleteBudget, getBudgetVsActual, getSpendingInsights }
