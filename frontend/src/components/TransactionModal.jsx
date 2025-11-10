import React, { useState, useEffect } from 'react';
import TagsInput from './TagsInput';
import api from '../api/axios';

const VIEW_MODE = {
  EXPENSE_FORM: 'expenseForm',
  INCOME_FORM: 'incomeForm',
};

const getInitialFormData = (categories) => ({
  name: '',
  category: categories[0] || '',
  cost: '',
  addedOn: new Date().toISOString().split('T')[0],
  isIncome: false,
  note: '',
  tags: []
});

const TransactionModal = ({ isOpen, onClose, onSubmit, transaction, expenseCategories = [], incomeCategories = [], onNewCategory, currentBalance = 0 }) => {
  const [modalView, setModalView] = useState(VIEW_MODE.EXPENSE_FORM);
  const [submittedAnyway, setSubmittedAnyway] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cost: '',
    addedOn: new Date().toISOString().split('T')[0],
    isIncome: false,
    note: '',
    tags: []
  });

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/transactions/tags');
        setAvailableTags(response.data);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };
    
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        name: transaction.name,
        category: transaction.category,
        cost: transaction.cost,
        addedOn: new Date(transaction.addedOn).toISOString().split('T')[0],
        isIncome: transaction.isIncome,
        note: transaction.note || '',
        tags: transaction.tags || []
      });
      setModalView(transaction.isIncome ? VIEW_MODE.INCOME_FORM : VIEW_MODE.EXPENSE_FORM);
    } else {
      setFormData({
        name: '',
        category: expenseCategories[0] || '', // Default to the first category or empty
        cost: '',
        addedOn: new Date().toISOString().split('T')[0],
        isIncome: false,
        note: '',
        tags: []
      });
      if (modalView === VIEW_MODE.EXPENSE_FORM) {
        setFormData(prev => ({ ...prev, category: expenseCategories[0] || '' }));
      } else {
        setFormData(prev => ({ ...prev, category: incomeCategories[0] || '' }));
      }
    }
  }, [transaction, isOpen, expenseCategories, incomeCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle the "Add New" option for category
    if (name === 'category' && value === '__add_new__') {
      const newCategory = window.prompt("Enter new category name:");

      if (newCategory) {
        const isIncome = modalView === VIEW_MODE.INCOME_FORM;
        onNewCategory(newCategory, isIncome);

        setFormData(prev => ({ ...prev, category: newCategory }));
      }
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isIncomeTransaction = modalView === VIEW_MODE.INCOME_FORM;
    const costValue = parseFloat(formData.cost);
    if (!isIncomeTransaction && !transaction && costValue > currentBalance && !submittedAnyway) {
      const confirmation = window.confirm(
        `Warning: This expense (${costValue}) exceeds your current balance (${currentBalance}). Proceeding will result in a negative balance. Do you wish to submit anyway?`
      );

      if (confirmation) {
        setSubmittedAnyway(true);
        setTimeout(() => {
          e.target.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }, 0);
      }
      return;
    }
    setSubmittedAnyway(false);
    let transactionName = formData.name.trim();
    if (isIncomeTransaction && transactionName === '') {
      transactionName = (formData.category ? formData.category : 'General') + ' Income';
    }
    const finalFormData = {
      ...formData,
      name: transactionName,
      isIncome: modalView === VIEW_MODE.INCOME_FORM
    };
    onSubmit(finalFormData, transaction?._id);
  };

  const handleSwitchToIncome = (e) => {
    e.preventDefault();
    setFormData(getInitialFormData(incomeCategories));
    setModalView(VIEW_MODE.INCOME_FORM);
  }

  const handleSwitchToExpense = (e) => {
    e.preventDefault();
    setFormData(getInitialFormData(expenseCategories));
    setModalView(VIEW_MODE.EXPENSE_FORM);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-bg-light-card dark:bg-bg-dark-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-text-light-primary dark:text-text-dark-primary">
            {transaction ? 'Edit' : 'Add'}{modalView === VIEW_MODE.EXPENSE_FORM ? ' Expense' : ' Income'}
          </h2>
        <form onSubmit={handleSubmit}>
          {/* ... other form fields (name, cost, etc.) remain the same ... */}
          {modalView === VIEW_MODE.EXPENSE_FORM && (
            <>
              <div className="mb-3 sm:mb-4">
                <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base" 
                  required 
                />
              </div>
              <div className="mb-3 sm:mb-4">
                <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base" 
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="__add_new__" className="font-bold text-primary-600 dark:text-primary-400">-- Add New Category --</option>
                </select>
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Amount (Expense)</label>
                <input 
                  type="number" 
                  name="cost" 
                  value={formData.cost} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base" 
                  required 
                />
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Date</label>
                <input 
                  type="date" 
                  name="addedOn" 
                  value={formData.addedOn} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base" 
                  required 
                />
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded resize-y bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base"
                  rows="3"
                  placeholder="E.g., Dinner at favorite restaurant, January salary"
                />
              </div>

              <div className="mb-4">
                <TagsInput
                  tags={formData.tags}
                  onChange={(newTags) => setFormData(prev => ({ ...prev, tags: newTags }))}
                  availableTags={availableTags}
                  placeholder="Add tags to organize your expenses..."
                />
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="flex items-center">
                  <a className="text-primary-600 dark:text-primary-400 underline text-sm" href="#" onClick={handleSwitchToIncome}>
                    Add Income
                  </a>
                </label>
              </div>
            </>
          )}

          {modalView === VIEW_MODE.INCOME_FORM && (
            <>
              <div className="mb-3 sm:mb-4">
                <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base" 
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {incomeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="__add_new__" className="font-bold text-primary-600 dark:text-primary-400">-- Add New Category --</option>
                </select>
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Amount (Income)</label>
                <input 
                  type="number" 
                  name="cost" 
                  value={formData.cost} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base" 
                  required 
                />
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Date</label>
                <input 
                  type="date" 
                  name="addedOn" 
                  value={formData.addedOn} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base" 
                  required 
                />
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-text-light-primary dark:text-text-dark-primary text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded resize-y bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base"
                  rows="3"
                  placeholder="E.g., Dinner at favorite restaurant, January salary"
                />
              </div>

              <div className="mb-4">
                <TagsInput
                  tags={formData.tags}
                  onChange={(newTags) => setFormData(prev => ({ ...prev, tags: newTags }))}
                  availableTags={availableTags}
                  placeholder="Add tags to organize your income..."
                />
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="flex items-center">
                  <a className="text-primary-600 dark:text-primary-400 underline text-sm" href="#" onClick={handleSwitchToExpense}>
                    Add Expense
                  </a>
                </label>
              </div>
            </>
          )}
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
              Save
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;