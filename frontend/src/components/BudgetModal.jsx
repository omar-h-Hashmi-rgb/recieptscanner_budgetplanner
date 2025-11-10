import React, { useState, useEffect } from 'react';

const BudgetModal = ({ isOpen, onClose, onSubmit, budget, categories }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
      });
    } else {
      setFormData({
        category: categories[0] || '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
    }
  }, [budget, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'month') {
      const num = parseInt(value, 10);
      if (num < 1) return setFormData((prev) => ({ ...prev, month: 1 }));
      if (num > 12) return setFormData((prev) => ({ ...prev, month: 12 }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, budget?._id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-bg-light-card dark:bg-bg-dark-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-text-light-primary dark:text-text-dark-primary">
            {budget ? 'Edit Budget' : 'Add Budget'}
          </h2>

        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base"
            />
          </div>

          {/* Month */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Month</label>
            <input
              type="number"
              name="month"
              value={formData.month}
              onChange={handleChange}
              min="1"
              max="12"
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base"
            />
          </div>

          {/* Year */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="2000"
              max="2100"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-slate-300 dark:bg-slate-600 text-text-light-primary dark:text-text-dark-primary rounded hover:bg-slate-400 dark:hover:bg-slate-500 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded hover:bg-primary-700 dark:hover:bg-primary-600 text-sm sm:text-base"
            >
              {budget ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
