import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import CategoryPieChart from '../components/CategoryPieChart';
import ActivityBarChart from '../components/ActivityBarChart';
import LineChart from '../components/LineChart';
import TransactionModal from '../components/TransactionModal';
import BudgetStatus from '../components/BudgetStatus';
import useCurrency from '../hooks/useCurrency';
import useTheme from '../hooks/useTheme';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { IoWarning } from "react-icons/io5";



// A reusable card component for the dashboard summary
const SummaryCard = ({ title, value, bgColor, loading }) => {
  const { currency } = useCurrency();
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
  }).format(value);

  return (
    <div className={`card-modern p-4 sm:p-6 ${bgColor}`}>
      <h3 className="text-sm sm:text-lg font-medium text-text-light-secondary dark:text-text-dark-secondary">{title}</h3>
      {loading ? (
        <div className="mt-2 h-6 sm:h-8 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
      ) : (
        <p className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-text-light-primary dark:text-text-dark-primary break-all">{formattedValue}</p>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [chartData, setChartData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const { currency } = useCurrency();
  const { theme } = useTheme();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, chartRes, expenseCategoriesRes, // New API call
        incomeCategoriesRes] = await Promise.all([
          api.get('/transactions/summary'),
          api.get('/transactions/charts'),
          api.get('/transactions/categories/expense'),
          api.get('/transactions/categories/income')
        ]);
      console.log(chartRes)
      setSummaryData(summaryRes.data);
      setChartData(chartRes.data);
      setExpenseCategories(expenseCategoriesRes.data);
      setIncomeCategories(incomeCategoriesRes.data);
      setRecentTransactions(summaryRes.data.recentTransactions || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormSubmit = async (formData) => {
    if (!formData.name || formData.name.trim() === "") {
      alert("Please enter a name for the transaction");
      return;
    }
    if (!formData.cost || isNaN(formData.cost) || Number(formData.cost) <= 0) {
      alert("Please enter a valid cost greater than 0");
      return;
    }
    if (!formData.category || formData.category.trim() === "") {
      alert("Please select a category");
      return;
    }

    try {
      await api.post("/transactions", formData);
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save transaction", error);
    }
  };

  const handleNewCategory = (newCategory, isIncome) => {
    if (isIncome) {
      setIncomeCategories(prev => [...prev, newCategory].sort());
    } else {
      setExpenseCategories(prev => [...prev, newCategory].sort());
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-light-primary dark:text-text-dark-primary">Financial Command Center</h1>
        <button
          onClick={handleOpenModal}
          className="btn btn-primary w-full sm:w-auto"
        >
          <span className='text-2xl'>+</span> Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <SummaryCard title="Total Income" value={summaryData.totalIncome} bgColor="bg-gradient-success" loading={loading} />
        <SummaryCard title="Total Expense" value={summaryData.totalExpenses} bgColor="bg-gradient-danger" loading={loading} />
        <SummaryCard title="Current Balance" value={summaryData.balance} bgColor="bg-gradient-primary" loading={loading} />
      </div>

      {/* Budget Status Section */}
      <div className="my-8">
        <BudgetStatus />
      </div>

      <div className="my-6 sm:my-8 lg:my-10 grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <div className="card-modern p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-text-light-primary dark:text-text-dark-primary mb-4">Expense Distribution Analysis</h2>
          {loading ? <Spinner /> : chartData?.expensesByCategory.length > 0 ? (
            <CategoryPieChart data={chartData.expensesByCategory} theme={theme} />
          ) : (
            <EmptyState message="No expense data to display." icon={<IoWarning className="w-6 h-6 text-yellow-500" />} />
          )}
        </div>
        <div className="card-modern p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-text-light-primary dark:text-text-dark-primary mb-4">Financial Activity Timeline</h2>
          <div className="relative h-60 sm:h-80">
            {loading ? <Spinner /> : (chartData?.expensesOverTime.length > 0 || chartData?.incomeOverTime.length > 0) ? (
              <ActivityBarChart
                expensesData={chartData.expensesOverTime}
                incomeData={chartData.incomeOverTime}
                theme={theme}
              />
            ) : (
              <EmptyState message="No recent activity to display." />
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-text-light-secondary dark:text-text-dark-secondary border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">Recent Transactions</h3>
            {loading ? <p className="text-gray-500 dark:text-gray-400 mt-2">Loading transactions...</p> : recentTransactions.length > 0 ? (
              <ul className="mt-2 space-y-3">
                {recentTransactions.map(tx => (
                  <li key={tx._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-text-light-primary dark:text-text-dark-primary">{tx.name}</p>
                      <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">{new Date(tx.addedOn).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-semibold ${tx.isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.isIncome ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(tx.cost)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500 dark:text-gray-400 mt-2">No recent transactions.</p>}
          </div>
        </div>
        <div className="card-modern p-4 sm:p-6 h-[400px] sm:h-[500px]">
          <h2 className="text-lg sm:text-xl font-bold text-text-light-primary dark:text-text-dark-primary mb-4">Income Performance Trends</h2>
          {loading ? <Spinner /> : chartData?.incomeOverTime.length > 0 ? (
            <LineChart label={"Income"} data={chartData.incomeOverTime} theme={theme} />
          ) : (
            <EmptyState message="No income data to display." icon={<IoWarning className="w-6 h-6 text-yellow-500" />} />
          )}
        </div>
        <div className="card-modern p-4 sm:p-6 h-[400px] sm:h-[500px]">
          <h2 className="text-lg sm:text-xl font-bold text-text-light-primary dark:text-text-dark-primary mb-4">Expense Pattern Analysis</h2>
          {loading ? <Spinner /> : chartData?.expensesOverTime.length > 0 ? (
            <LineChart label={"Expenses"} data={chartData.expensesOverTime} theme={theme} />
          ) : (
            <EmptyState message="No expense data to display." icon={<IoWarning className="w-6 h-6 text-yellow-500" />} />
          )}
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleFormSubmit} expenseCategories={expenseCategories}
        incomeCategories={incomeCategories} onNewCategory={handleNewCategory} currentBalance={summaryData.balance} />
    </>
  );
};

export default DashboardPage;
