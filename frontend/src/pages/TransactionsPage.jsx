import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight, Download, Upload, Split } from 'lucide-react';
import api from '../api/axios';
import TransactionModal from '../components/TransactionModal';
import TransactionDetailModal from '../components/TransactionDetailModal'
import ManageCategoriesModal from '../components/ManageCategoriesModal';
import CSVImportModal from '../components/CSVImportModal';
import TransactionSplitModal from '../components/TransactionSplitModal';
import Spinner from '../components/Spinner';
import useCurrency from '../hooks/useCurrency';
import EmptyState from '../components/EmptyState';
import { handleExportCSV } from '../utils/transactions';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  const [viewingDetails, setViewingDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedTransactionIds, setSelectedTransactionIds] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [availableTags, setAvailableTags] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debounceTimer = useRef(null); // Changed to useRef


  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCSVImportModalOpen, setIsCSVImportModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [transactionToSplit, setTransactionToSplit] = useState(null);
  const { currency } = useCurrency();
  const isInitialMount = useRef(true);
  const allCategories = [...new Set([...expenseCategories, ...incomeCategories])]; 

  const fetchData = useCallback(async (currentSearchTerm = searchTerm) => {
    if (isInitialMount.current) {
      setLoading(true);
    } else {
      setIsFiltering(true);
    }

    try {
      const [summaryRes, expenseCategoriesRes, incomeCategoriesRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions/categories/expense'),
        api.get('/transactions/categories/income')
      ]);
      setSummaryData(summaryRes.data);
      setExpenseCategories(expenseCategoriesRes.data);
      setIncomeCategories(incomeCategoriesRes.data);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (currentSearchTerm) {
        params.append('search', currentSearchTerm);
      }
      if (typeFilter !== 'all') {
        params.append('isIncome', typeFilter === 'income' ? 'true' : 'false');
      }
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (tagFilter !== 'all') {
        params.append('tags', tagFilter);
      }
      if (dateFrom) {
        params.append('startDate', dateFrom);
      }
      if (dateTo) {
        params.append('endDate', dateTo);
      }

      const transactionsRes = await api.get(`/transactions?${params.toString()}`);
      setTransactions(transactionsRes.data.transactions);
      setTotalPages(transactionsRes.data.totalPages);
      setSelectedTransactionIds([]); // Clear selection on data change

    } catch (error) {
      console.error("Failed to fetch transactions data", error);
    } finally {
      setLoading(false);
      setIsFiltering(false);
      isInitialMount.current = false;
    }
  }, [page, typeFilter, categoryFilter, tagFilter, dateFrom, dateTo, searchTerm]);

  // Fetch transactions when fetchData changes
  useEffect(() => {
    // This effect handles all data fetching except for debounced search
    if (isInitialMount.current) {
      fetchData(); // Fetch on initial mount
    } else {
       // Debounced search is handled separately in handleSearchChange
      if (!debounceTimer.current) {
        fetchData();
      }
    }
  }, [fetchData]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchData(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

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
    
    fetchTags();
  }, []);

  const clearAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };
  
  const hasActiveFilters = searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || dateFrom || dateTo;

  const handleOpenTransactionModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleOpenDetailsModal = (transaction) => {
    setViewingDetails(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingDetails(null);
  };

  const handleFormSubmit = async (formData, id) => {
    try {
      if (id) await api.put(`/transactions/${id}`, formData);
      else await api.post('/transactions', formData);
      fetchData();
      handleCloseTransactionModal();
    } catch (error) {
      console.error("Failed to save transaction", error);
    }
  };

  const handleCSVImportSuccess = (importedCount) => {
    alert(`Successfully imported ${importedCount} transactions!`);
    fetchData(); // Refresh the transaction list
    setIsCSVImportModalOpen(false);
  };

  const handleSplitTransaction = (transaction) => {
    setTransactionToSplit(transaction);
    setIsSplitModalOpen(true);
  };

  const handleSplitSubmit = async (splits, originalTransactionId) => {
    try {
      // Delete the original transaction
      await api.delete(`/transactions/${originalTransactionId}`);
      
      // Create all the split transactions
      await Promise.all(
        splits.map(split => api.post('/transactions', split))
      );
      
      fetchData(); // Refresh the transaction list
      setIsSplitModalOpen(false);
      setTransactionToSplit(null);
      alert(`Transaction split into ${splits.length} parts successfully!`);
    } catch (error) {
      console.error('Failed to split transaction:', error);
      throw error; // Let the modal handle the error
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await api.delete(`/transactions/${id}`);
        // Compute the new transactions array after deletion
        setTransactions(prev => {
          const updatedTransactions = prev.filter(t => t._id !== id);
          if (updatedTransactions.length === 0 && page > 1) {
            setPage(page - 1); // useEffect will trigger fetchData
          } else {
            fetchData();
          }
          return updatedTransactions;
        });
      } catch (error) {
        console.error("Failed to delete transaction", error);
      }
    }
  };

  const toggleSelect = (id) => {
    setSelectedTransactionIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  
  const handleBulkDelete = async () => {
    if (!selectedTransactionIds.length) return;
    
    const confirmMessage = `Are you sure you want to permanently delete these ${selectedTransactionIds.length} transactions? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      try {
        await api.delete('/transactions/bulk', { 
          data: { transactionIds: selectedTransactionIds } 
        });
        setSelectedTransactionIds([]);
        fetchData(); // Refetch data
      } catch (error) {
        console.error('Failed to bulk delete transactions', error);
        alert('Failed to delete transactions. Please try again.');
      }
    }
  };
  const handleNewCategory = (newCategory, isIncome) => {
    if (isIncome) {
      setIncomeCategories(prev => [...prev, newCategory].sort());
    } else {
      setExpenseCategories(prev => [...prev, newCategory].sort());
    }

  };

  const handleDeleteCategory = async (categoryToDelete) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryToDelete}"? All associated transactions will be moved to "Miscellaneous".`)) {
      try {
        await api.delete('/transactions/category', { data: { categoryToDelete } });
        fetchData();
      } catch (error) {
        console.error("Failed to delete category", error);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-light-primary dark:text-text-dark-primary">Transactions</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
          {selectedTransactionIds.length > 0 && 
            <button onClick={handleBulkDelete} className="btn btn-danger text-sm sm:text-base">
              Delete ({selectedTransactionIds.length})
            </button>
          }
          <button onClick={() => setIsCategoryModalOpen(true)} className="btn btn-secondary text-sm sm:text-base">
            <span className="hidden sm:inline">Manage </span>Categories
          </button>
          <button onClick={() => handleOpenTransactionModal()} className="btn btn-primary text-sm sm:text-base">
            <span className='text-xl sm:text-2xl'>+</span> <span className="hidden sm:inline">Add </span>Transaction
          </button>
          <button
            onClick={() => setIsCSVImportModalOpen(true)}
            className="btn btn-info text-sm sm:text-base"
            title="Import transactions from CSV file"
          >
            <Upload className="inline-block w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Import </span>CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-success text-sm sm:text-base"
            title="Export all transactions to CSV"
          >
            <Download className="inline-block w-4 h-4 mr-1" />
            Export CSV
          </button>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="mb-4 card-modern p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              placeholder="Search your financial records..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="lg:col-span-1">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-1">
            <select
              value={tagFilter}
              onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Tags</option>
              {availableTags.map((tagObj) => (
                <option key={tagObj.tag} value={tagObj.tag}>
                  {tagObj.tag} ({tagObj.count})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary pointer-events-none">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full pl-14 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary pointer-events-none">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-bg-light-primary dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary">Active:</span>
              {searchTerm && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">"{searchTerm}"</span>}
              {typeFilter !== 'all' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">{typeFilter === 'income' ? 'Income' : 'Expense'}</span>}
              {categoryFilter !== 'all' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">{categoryFilter}</span>}
              {dateFrom && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">From: {new Date(dateFrom).toLocaleDateString()}</span>}
              {dateTo && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">To: {new Date(dateTo).toLocaleDateString()}</span>}
            </div>
            <button onClick={clearAllFilters} className="w-full sm:w-auto px-3 py-1 bg-red-500 dark:bg-red-600 text-white text-xs rounded-md hover:bg-red-600 dark:hover:bg-red-700">
              Clear Filters
            </button>
          </div>
        )}
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className={`card-modern ${isFiltering ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {transactions.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                     <th className="px-2 py-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-600 hover:ring-4 hover:ring-blue-200 transition-all duration-200 cursor-pointer"
                          checked={transactions.length > 0 && selectedTransactionIds.length === transactions.length}
                          disabled={transactions.length === 0}
                          onChange={() => setSelectedTransactionIds(selectedTransactionIds.length ? [] : transactions.map(t => t._id))}
                        />
                      </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">Note</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
            <tbody className="bg-bg-light-card dark:bg-bg-dark-card divide-y divide-slate-200 dark:divide-slate-700">
              {transactions.map((tx) => (
                <tr key={tx._id} className="table-row hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                  <td className="px-2 py-6 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-600 hover:ring-4 hover:ring-blue-200 transition-all duration-200 cursor-pointer"
                        checked={selectedTransactionIds.includes(tx._id)}
                        onChange={() => toggleSelect(tx._id)}
                      />
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-light-primary dark:text-text-dark-primary font-medium">{tx.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-light-secondary dark:text-text-dark-secondary">{tx.category}</td>
                  <td className={`px-6 py-4 whitespace-nowrap font-semibold ${tx.isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.isIncome ? '+' : '-'}{new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency.code,
                    }).format(tx.cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-light-secondary dark:text-text-dark-secondary">{new Date(tx.addedOn).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenDetailsModal(tx)}
                      className="link-primary underline font-medium"
                    >
                      Details
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenTransactionModal(tx)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 p-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/50 transition-all duration-200"
                          title="Edit transaction"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleSplitTransaction(tx)}
                          className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 p-2 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/50 transition-all duration-200"
                          title="Split transaction"
                        >
                          <Split size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 transition-all duration-200"
                          title="Delete transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {transactions.map((tx) => (
                <div key={tx._id} className="bg-bg-light-primary dark:bg-bg-dark-primary rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-600 transition-all duration-200 cursor-pointer"
                        checked={selectedTransactionIds.includes(tx._id)}
                        onChange={() => toggleSelect(tx._id)}
                      />
                      <h3 className="font-medium text-text-light-primary dark:text-text-dark-primary">{tx.name}</h3>
                    </div>
                    <span className={`text-lg font-bold ${tx.isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.isIncome ? '+' : '-'}{new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency.code,
                      }).format(tx.cost)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary">Category</span>
                      <p className="text-sm text-text-light-primary dark:text-text-dark-primary">{tx.category}</p>
                    </div>
                    <div>
                      <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary">Date</span>
                      <p className="text-sm text-text-light-primary dark:text-text-dark-primary">{new Date(tx.addedOn).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => handleOpenDetailsModal(tx)}
                      className="text-primary-600 dark:text-primary-400 text-sm underline"
                    >
                      Details
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenTransactionModal(tx)}
                        className="text-primary-600 dark:text-primary-400 p-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/50 transition-all duration-200"
                        title="Edit transaction"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleSplitTransaction(tx)}
                        className="text-orange-600 dark:text-orange-400 p-2 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/50 transition-all duration-200"
                        title="Split transaction"
                      >
                        <Split size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(tx._id)}
                        className="text-red-600 dark:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 transition-all duration-200"
                        title="Delete transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
          ) : (
          <div className="p-6">
            <EmptyState message="No Transaction done" />
          </div>
                )}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button 
            onClick={() => setPage(p => Math.max(p - 1, 1))} 
            disabled={page === 1} 
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Page</span>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-medium">{page}</span>
            <span className="text-sm text-gray-600">of {totalPages}</span>
          </div>
          
          <button 
            onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
            disabled={page === totalPages} 
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        onSubmit={handleFormSubmit}
        transaction={editingTransaction}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        onNewCategory={handleNewCategory}
        currentBalance={summaryData.balance}
      />
      <ManageCategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        onDelete={handleDeleteCategory}
      />

      <TransactionDetailModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        transaction={viewingDetails}
        currency={currency}
      />

      <CSVImportModal
        isOpen={isCSVImportModalOpen}
        onClose={() => setIsCSVImportModalOpen(false)}
        onSuccess={handleCSVImportSuccess}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
      />

      <TransactionSplitModal
        isOpen={isSplitModalOpen}
        onClose={() => {
          setIsSplitModalOpen(false);
          setTransactionToSplit(null);
        }}
        onSubmit={handleSplitSubmit}
        originalTransaction={transactionToSplit}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
      />
    </>
  );
};

export default TransactionsPage;