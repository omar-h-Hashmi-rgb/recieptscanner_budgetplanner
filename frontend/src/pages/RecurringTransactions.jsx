import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import RecurringTransactionModal from '../components/RecurringTransactionModal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import useCurrency from '../hooks/useCurrency';

const RecurringTransactions = () => {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const { currency } = useCurrency();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recurringRes, categoriesRes] = await Promise.all([
        api.get('/recurring'),
        api.get('/transactions/categories'),
      ]);
      setRecurring(recurringRes.data || []);
      // Extract categories from the response structure
      const categoriesData = categoriesRes.data?.data?.all || categoriesRes.data || [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch recurring transactions', err);
      // Set empty array as fallback to prevent map errors
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) {
        await api.put(`/recurring/${id}`, formData);
      } else {
        await api.post('/recurring/create', formData);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save recurring transaction', err);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        'Are you sure you want to delete this recurring transaction?'
      )
    ) {
      try {
        await api.delete(`/recurring/${id}`);
        fetchData();
      } catch (err) {
        console.error('Failed to delete recurring transaction', err);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-light-primary dark:text-text-dark-primary">
          Recurring Transactions
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary w-full sm:w-auto"
        >
          Add Recurring
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card-modern">
          {recurring.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                    Next Due
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-bg-light-card dark:bg-bg-dark-card divide-y divide-slate-200 dark:divide-slate-700">
                {recurring.map((r) => (
                  <tr key={r._id} className="table-row hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-text-light-primary dark:text-text-dark-primary font-medium">{r.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-light-secondary dark:text-text-dark-secondary">
                      {r.category}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-semibold ${
                        r.isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {r.isIncome ? '+' : '-'}
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency.code,
                      }).format(r.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-light-secondary dark:text-text-dark-secondary">
                      {r.isIncome ? 'Income' : 'Expense'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-light-secondary dark:text-text-dark-secondary">
                      {r.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-light-secondary dark:text-text-dark-secondary">
                      {new Date(r.nextDueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(r)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState message="No recurring transactions" />
            </div>
          )}
        </div>
      )}

      <RecurringTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        transaction={editingTransaction}
        categories={categories}
      />
    </>
  );
};

export default RecurringTransactions;
