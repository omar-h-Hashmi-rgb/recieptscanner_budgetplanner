import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import CategoryRulesModal from '../components/CategoryRulesModal';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCategoryRulesModalOpen, setIsCategoryRulesModalOpen] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');
      await api.delete('/users/account');
      logout(); 
    } catch (err) {
      console.error(err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary mb-6">Settings</h1>
      
      <div className="card-modern p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary mb-3">Account Info</h2>
        <p className="text-text-light-secondary dark:text-text-dark-secondary"><strong className="text-text-light-primary dark:text-text-dark-primary">Email:</strong> {user?.email}</p>
      </div>

      <div className="card-modern p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary mb-3">
          Auto-Categorization Rules
        </h2>
        <p className="text-text-light-secondary dark:text-text-dark-secondary mb-4">
          Set up keywords to automatically categorize your transactions. For example, transactions containing "starbucks" can be automatically categorized as "Coffee".
        </p>
        <button
          onClick={() => setIsCategoryRulesModalOpen(true)}
          className="btn btn-primary 
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Manage Categorization Rules
        </button>
      </div>

      <div className="card-modern p-6 border-l-4 border-red-500">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-3">Danger Zone</h2>
        <p className="text-text-light-secondary dark:text-text-dark-secondary mb-4">
          Deleting your account is permanent. All your data will be lost.
        </p>
        {error && <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>}
        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="btn btn-danger"
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>

      <CategoryRulesModal
        isOpen={isCategoryRulesModalOpen}
        onClose={() => setIsCategoryRulesModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
