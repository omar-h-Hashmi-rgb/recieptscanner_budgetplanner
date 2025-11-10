import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import useCurrency from '../hooks/useCurrency';
import BudgetModal from '../components/BudgetModal';
import EmptyState from '../components/EmptyState';
import AIChatModal from '../components/AIChatModal';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency } = useCurrency();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetsRes, categoriesRes, transactionsRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/transactions/categories/expense'),
        api.get('/transactions'),
      ]);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch budgets or transactions', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenBudgetModal = (budget = null) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleCloseBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) await api.put(`/budgets/${id}`, formData);
      else await api.post('/budgets', formData);
      fetchData();
      handleCloseBudgetModal();
    } catch (error) {
      console.error('Failed to save budget', error);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await api.delete(`/budgets/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete budget', error);
      }
    }
  };

  const calculateSpent = (budget) => {
    return transactions
      .filter((tx) => {
        const txDate = new Date(tx.addedOn);
        return (
          tx.category === budget.category &&
          txDate.getMonth() + 1 === budget.month &&
          txDate.getFullYear() === budget.year
        );
      })
      .reduce((sum, tx) => sum + tx.cost, 0);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary">Budgets</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            AI Budget Planner
          </button>
          <button
            onClick={() => handleOpenBudgetModal()}
            className="btn btn-primary"
          >
            Create Budget Plan
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : budgets.length > 0 ? (
        <div className="card-modern overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                  Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-bg-light-card dark:bg-bg-dark-card divide-y divide-slate-200 dark:divide-slate-700">
              {budgets.map((b) => {
                const spent = calculateSpent(b);
                const remaining = b.amount - spent;
                const percent = Math.min((spent / b.amount) * 100, 100).toFixed(
                  1
                );

                return (
                  <tr key={b._id} className="table-row hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-text-light-primary dark:text-text-dark-primary font-medium">
                      {b.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-light-secondary dark:text-text-dark-secondary font-semibold">{`${b.month}/${b.year}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-light-primary dark:text-text-dark-primary font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency.code,
                      }).format(b.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 dark:text-red-400 font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency.code,
                      }).format(spent)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-semibold ${
                        remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency.code,
                      }).format(remaining)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-1/3">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            percent < 80
                              ? 'bg-green-500'
                              : percent < 100
                              ? 'bg-yellow-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary">{percent}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteBudget(b._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <BudgetModal
            isOpen={isBudgetModalOpen}
            onClose={handleCloseBudgetModal}
            onSubmit={handleFormSubmit}
            budget={editingBudget}
            categories={categories}
          />
        </div>
      ) : (
        <div className="p-6 card-modern">
          <EmptyState message="No budgets found" />
        </div>
      )}

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={handleCloseBudgetModal}
        onSubmit={handleFormSubmit}
        budget={editingBudget}
        categories={categories}
      />

      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        chatType="budget"
        onBudgetCreated={fetchData}
      />
    </>
  );
};

export default Budgets;
