import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const BudgetStatus = () => {
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBudgetStatus();
    fetchInsights();
  }, []);

  const fetchBudgetStatus = async () => {
    try {
      const response = await api.get('/budgets/status');
      setBudgetStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch budget status:', error);
      setError('Failed to load budget status');
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await api.get('/budgets/insights');
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'caution': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'over': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe': return '✅';
      case 'caution': return '⚠️';
      case 'warning': return '🚨';
      case 'over': return '🚫';
      default: return '📊';
    }
  };

  const getProgressBarColor = (status) => {
    switch (status) {
      case 'safe': return 'bg-green-500';
      case 'caution': return 'bg-yellow-500';
      case 'warning': return 'bg-orange-500';
      case 'over': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (budgetStatus.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📊 Budget Overview
        </h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">
            No budgets set for this month. Create budgets to track your spending.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Status Overview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📊 Budget Overview - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {budgetStatus.map((budget, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getStatusIcon(budget.status)}</span>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {budget.category}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                    {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(budget.spent)} of {formatCurrency(budget.budget)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {budget.percentageSpent.toFixed(1)}% used
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(budget.status)}`}
                  style={{ width: `${Math.min(budget.percentageSpent, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Remaining: {budget.remaining >= 0 
                    ? formatCurrency(budget.remaining) 
                    : `-${formatCurrency(Math.abs(budget.remaining))} over`}
                </span>
                {budget.status === 'over' && (
                  <span className="text-red-600 font-medium">
                    Budget exceeded!
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spending Insights */}
      {insights && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            💡 Spending Insights
          </h3>

          {/* Alerts */}
          {insights.alerts && insights.alerts.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alerts</h4>
              <div className="space-y-2">
                {insights.alerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Month Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(insights.totalCurrentMonth)}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Last Month</div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{formatCurrency(insights.totalLastMonth)}</div>
            </div>
          </div>

          {/* Category Insights */}
          {insights.insights && insights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Changes</h4>
              <div className="space-y-2">
                {insights.insights.slice(0, 5).map((insight, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{insight.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(insight.currentMonth)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        insight.changeType === 'increase' 
                          ? 'bg-red-100 text-red-600' 
                          : insight.changeType === 'decrease' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetStatus;