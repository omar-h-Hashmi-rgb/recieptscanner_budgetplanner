import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';

const TransactionSplitModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  originalTransaction,
  expenseCategories = [], 
  incomeCategories = []
}) => {
  const [splits, setSplits] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [error, setError] = useState('');

  // Initialize splits when modal opens
  useEffect(() => {
    if (isOpen && originalTransaction) {
      const amount = parseFloat(originalTransaction.cost) || 0;
      setTotalAmount(amount);
      setRemainingAmount(amount);
      
      // Initialize with the original transaction as first split
      setSplits([
        {
          id: 1,
          name: originalTransaction.name,
          category: originalTransaction.category,
          amount: amount,
          isIncome: originalTransaction.isIncome
        }
      ]);
    }
  }, [isOpen, originalTransaction]);

  // Update remaining amount when splits change
  useEffect(() => {
    const usedAmount = splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
    setRemainingAmount(totalAmount - usedAmount);
  }, [splits, totalAmount]);

  const addSplit = () => {
    const newSplit = {
      id: Date.now(),
      name: '',
      category: expenseCategories[0] || '',
      amount: remainingAmount > 0 ? remainingAmount : 0,
      isIncome: false
    };
    setSplits([...splits, newSplit]);
  };

  const removeSplit = (id) => {
    if (splits.length > 1) {
      setSplits(splits.filter(split => split.id !== id));
    }
  };

  const updateSplit = (id, field, value) => {
    setSplits(splits.map(split => 
      split.id === id 
        ? { ...split, [field]: value }
        : split
    ));
  };

  const handleSubmit = async () => {
    setError('');

    // Validation
    const totalSplitAmount = splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
    
    if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
      setError(`Split amounts (${totalSplitAmount.toFixed(2)}) must equal the original amount (${totalAmount.toFixed(2)})`);
      return;
    }

    // Check for empty fields
    const invalidSplits = splits.filter(split => 
      !split.name.trim() || !split.category || !split.amount || parseFloat(split.amount) <= 0
    );

    if (invalidSplits.length > 0) {
      setError('All splits must have a name, category, and positive amount');
      return;
    }

    // Format splits for submission
    const formattedSplits = splits.map(split => ({
      name: split.name.trim(),
      category: split.category,
      cost: parseFloat(split.amount),
      addedOn: originalTransaction.addedOn,
      isIncome: split.isIncome,
      note: `Split from: ${originalTransaction.name}`,
      originalTransactionId: originalTransaction._id
    }));

    try {
      await onSubmit(formattedSplits, originalTransaction._id);
      handleClose();
    } catch (error) {
      console.error('Failed to split transaction:', error);
      setError('Failed to split transaction. Please try again.');
    }
  };

  const handleClose = () => {
    setSplits([]);
    setError('');
    setTotalAmount(0);
    setRemainingAmount(0);
    onClose();
  };

  if (!isOpen || !originalTransaction) return null;

  const categories = originalTransaction.isIncome ? incomeCategories : expenseCategories;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-bg-dark-secondary rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary">
              Split Transaction
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Original: {originalTransaction.name} - ${totalAmount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Amount Summary */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Original Amount</p>
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Split Total</p>
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                  ${splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                <p className={`text-lg font-semibold ${
                  Math.abs(remainingAmount) < 0.01 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ${remainingAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Splits */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary">
                Split Items ({splits.length})
              </h4>
              <button
                onClick={addSplit}
                className="btn btn-success flex items-center"
                disabled={Math.abs(remainingAmount) < 0.01}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Split
              </button>
            </div>

            {splits.map((split, index) => (
              <div key={split.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-bg-dark-primary">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Split {index + 1}
                  </span>
                  {splits.length > 1 && (
                    <button
                      onClick={() => removeSplit(split.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove split"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={split.name}
                      onChange={(e) => updateSplit(split.id, 'name', e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-bg-dark-secondary text-text-light-primary dark:text-text-dark-primary
                               focus:ring-2 focus:ring-primary-light focus:border-transparent"
                      placeholder="Enter description..."
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={split.category}
                      onChange={(e) => updateSplit(split.id, 'category', e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-bg-dark-secondary text-text-light-primary dark:text-text-dark-primary
                               focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={totalAmount}
                        value={split.amount}
                        onChange={(e) => updateSplit(split.id, 'amount', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-bg-dark-secondary text-text-light-primary dark:text-text-dark-primary
                                 focus:ring-2 focus:ring-primary-light focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Distribution Buttons */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-bg-dark-primary border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Distribution:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const evenAmount = totalAmount / splits.length;
                  setSplits(splits.map(split => ({ ...split, amount: evenAmount.toFixed(2) })));
                }}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50"
              >
                Split Evenly
              </button>
              <button
                onClick={() => {
                  if (remainingAmount > 0 && splits.length > 0) {
                    const lastSplit = splits[splits.length - 1];
                    updateSplit(lastSplit.id, 'amount', (parseFloat(lastSplit.amount) + remainingAmount).toFixed(2));
                  }
                }}
                className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50"
                disabled={remainingAmount <= 0}
              >
                Add Remaining to Last
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     text-text-light-primary dark:text-text-dark-primary hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={Math.abs(remainingAmount) > 0.01 || splits.length === 0}
            className="px-6 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Split Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionSplitModal;