import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import GoalModal from '../components/GoalModal';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/goals/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch goal stats:', error);
    }
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      await api.delete(`/goals/${goalId}`);
      setGoals(goals.filter(goal => goal._id !== goalId));
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to delete goal:', error);
      setError('Failed to delete goal');
    }
  };

  const handleGoalSubmit = async (goalData) => {
    try {
      if (editingGoal) {
        // Update existing goal
        const response = await api.put(`/goals/${editingGoal._id}`, goalData);
        setGoals(goals.map(goal => 
          goal._id === editingGoal._id ? response.data : goal
        ));
      } else {
        // Create new goal
        const response = await api.post('/goals', goalData);
        setGoals([response.data, ...goals]);
      }
      setIsModalOpen(false);
      setEditingGoal(null);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to save goal:', error);
      setError('Failed to save goal');
    }
  };

  const handleUpdateProgress = async (goalId, amount) => {
    const newAmount = prompt('Enter progress amount (positive to add, negative to subtract):');
    if (newAmount === null) return;

    const numAmount = parseFloat(newAmount);
    if (isNaN(numAmount)) {
      alert('Please enter a valid number');
      return;
    }

    try {
      const response = await api.patch(`/goals/${goalId}/progress`, { amount: numAmount });
      setGoals(goals.map(goal => 
        goal._id === goalId ? response.data : goal
      ));
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to update progress:', error);
      alert(error.response?.data?.message || 'Failed to update progress');
    }
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Financial Aspirations & Milestones</h1>
          <button
            onClick={handleCreateGoal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create New Goal
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Goals</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalGoals}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
              <p className="text-2xl font-bold text-green-600">{stats.completedGoals}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Progress</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.averageProgress}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Saved</h3>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalCurrentAmount)}</p>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No goals</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating your first financial goal.
              </p>
              <button
                onClick={handleCreateGoal}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            goals.map((goal) => {
              const progressPercentage = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const isCompleted = goal.isCompleted;
              const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && !isCompleted;

              return (
                <div
                  key={goal._id}
                  className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 ${
                    isCompleted 
                      ? 'border-green-500' 
                      : isOverdue 
                        ? 'border-red-500' 
                        : 'border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        {goal.name}
                        {isCompleted && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Completed
                          </span>
                        )}
                        {isOverdue && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Overdue
                          </span>
                        )}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateProgress(goal._id, goal.currentAmount)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Update progress"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Edit goal"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete goal"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>{formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-green-500' 
                            : isOverdue 
                              ? 'bg-red-500' 
                              : 'bg-blue-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {goal.targetDate && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Target Date: {formatDate(goal.targetDate)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <GoalModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGoal(null);
          }}
          onSubmit={handleGoalSubmit}
          goal={editingGoal}
        />
      )}
    </>
  );
};

export default GoalsPage;