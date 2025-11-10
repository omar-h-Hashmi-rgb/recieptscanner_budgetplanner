import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const CategoryRulesModal = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState({ keyword: '', category: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/category-rules');
      setRules(response.data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      setError('Failed to load categorization rules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newRule.keyword.trim() || !newRule.category.trim()) {
      setError('Both keyword and category are required');
      return;
    }

    try {
      setError('');
      const response = await api.post('/category-rules', newRule);
      setRules([response.data, ...rules]);
      setNewRule({ keyword: '', category: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create rule');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;

    try {
      await api.delete(`/category-rules/${ruleId}`);
      setRules(rules.filter(rule => rule._id !== ruleId));
    } catch (error) {
      setError('Failed to delete rule');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-light-card dark:bg-bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
          <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">
            Smart Category Rules Engine
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add New Rule Form */}
          <form onSubmit={handleAddRule} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Add New Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Keyword
                </label>
                <input
                  type="text"
                  value={newRule.keyword}
                  onChange={(e) => setNewRule({ ...newRule, keyword: e.target.value })}
                  placeholder="e.g., starbucks, walmart, gas"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newRule.category}
                  onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                  placeholder="e.g., Coffee, Groceries, Transportation"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Rule
            </button>
          </form>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Rules List */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Current Rules ({rules.length})
            </h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading rules...</p>
              </div>
            ) : rules.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No categorization rules found. Add your first rule above.
              </p>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule._id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 
                             border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        If transaction contains "
                      </span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {rule.keyword}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        " → categorize as "
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {rule.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rule._id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 
                               dark:hover:text-red-300 transition-colors"
                      title="Delete rule"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>When adding transactions, if the description contains any of your keywords, it will automatically be categorized</li>
              <li>Keywords are case-insensitive (e.g., "Starbucks" matches "starbucks")</li>
              <li>The first matching rule will be applied</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryRulesModal;