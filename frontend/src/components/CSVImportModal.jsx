import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import api from '../api/axios';

const CSVImportModal = ({ isOpen, onClose, onSuccess, expenseCategories, incomeCategories }) => {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [preview, setPreview] = useState([]);
  const [step, setStep] = useState(1); // 1: File Upload, 2: Column Mapping, 3: Preview & Import
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const requiredFields = [
    { key: 'name', label: 'Transaction Name/Description', required: true },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'date', label: 'Date', required: true },
    { key: 'type', label: 'Type (Income/Expense)', required: false }
  ];

  const allCategories = [...new Set([...expenseCategories, ...incomeCategories])];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Parse CSV
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV: ' + results.errors[0].message);
          return;
        }

        setHeaders(Object.keys(results.data[0] || {}));
        setCsvData(results.data);
        setStep(2);
      },
      error: (error) => {
        setError('Error reading file: ' + error.message);
      }
    });
  };

  const handleMappingChange = (fieldKey, csvColumn) => {
    setMapping(prev => ({
      ...prev,
      [fieldKey]: csvColumn
    }));
  };

  const generatePreview = () => {
    if (!csvData.length || !mapping.name || !mapping.amount) {
      setError('Please map at least Name and Amount columns');
      return;
    }

    const previewData = csvData.slice(0, 5).map((row, index) => {
      const mappedTransaction = {};
      
      // Map required fields
      requiredFields.forEach(field => {
        if (mapping[field.key] && row[mapping[field.key]]) {
          mappedTransaction[field.key] = row[mapping[field.key]];
        }
      });

      // Clean up amount (remove currency symbols, etc.)
      if (mappedTransaction.amount) {
        mappedTransaction.amount = parseFloat(
          mappedTransaction.amount.toString().replace(/[^0-9.-]/g, '')
        );
      }

      // Determine if it's income or expense
      if (mapping.type && row[mapping.type]) {
        const typeValue = row[mapping.type].toLowerCase();
        mappedTransaction.isIncome = typeValue.includes('income') || 
                                   typeValue.includes('credit') || 
                                   mappedTransaction.amount > 0;
      } else {
        // Default logic: positive amounts are income, negative are expenses
        mappedTransaction.isIncome = mappedTransaction.amount > 0;
      }

      // Make amount positive for consistency
      mappedTransaction.amount = Math.abs(mappedTransaction.amount);

      // Format date
      if (mappedTransaction.date) {
        try {
          const date = new Date(mappedTransaction.date);
          mappedTransaction.date = date.toISOString().split('T')[0];
        } catch {
          mappedTransaction.date = new Date().toISOString().split('T')[0];
        }
      }

      // Set default category if not mapped or invalid
      if (!mappedTransaction.category || !allCategories.includes(mappedTransaction.category)) {
        mappedTransaction.category = mappedTransaction.isIncome ? 'Other Income' : 'Miscellaneous';
      }

      return { ...mappedTransaction, originalIndex: index };
    });

    setPreview(previewData);
    setStep(3);
    setError('');
  };

  const handleImport = async () => {
    setImporting(true);
    setError('');

    try {
      const transactionsToImport = csvData.map(row => {
        const mappedTransaction = {};
        
        requiredFields.forEach(field => {
          if (mapping[field.key] && row[mapping[field.key]]) {
            mappedTransaction[field.key] = row[mapping[field.key]];
          }
        });

        // Process amount
        if (mappedTransaction.amount) {
          mappedTransaction.cost = Math.abs(parseFloat(
            mappedTransaction.amount.toString().replace(/[^0-9.-]/g, '')
          ));
        }

        // Determine income/expense
        if (mapping.type && row[mapping.type]) {
          const typeValue = row[mapping.type].toLowerCase();
          mappedTransaction.isIncome = typeValue.includes('income') || 
                                     typeValue.includes('credit');
        } else {
          mappedTransaction.isIncome = parseFloat(mappedTransaction.amount) > 0;
        }

        // Format date
        if (mappedTransaction.date) {
          try {
            const date = new Date(mappedTransaction.date);
            mappedTransaction.addedOn = date.toISOString().split('T')[0];
          } catch {
            mappedTransaction.addedOn = new Date().toISOString().split('T')[0];
          }
        }

        // Set category
        if (!mappedTransaction.category || !allCategories.includes(mappedTransaction.category)) {
          mappedTransaction.category = mappedTransaction.isIncome ? 'Other Income' : 'Miscellaneous';
        }

        return {
          name: mappedTransaction.name || 'Imported Transaction',
          cost: mappedTransaction.cost || 0,
          category: mappedTransaction.category,
          addedOn: mappedTransaction.addedOn || new Date().toISOString().split('T')[0],
          isIncome: mappedTransaction.isIncome || false
        };
      });

      // Import transactions in batches
      const batchSize = 50;
      let importedCount = 0;

      for (let i = 0; i < transactionsToImport.length; i += batchSize) {
        const batch = transactionsToImport.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(transaction => api.post('/transactions', transaction))
        );
        
        importedCount += batch.length;
      }

      onSuccess(importedCount);
      handleClose();

    } catch (error) {
      console.error('Import failed:', error);
      setError('Failed to import transactions. Please check your data and try again.');
    }
    
    setImporting(false);
  };

  const handleClose = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setPreview([]);
    setStep(1);
    setError('');
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-bg-dark-secondary rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-text-light-primary dark:text-text-dark-primary">
            Import Transactions from CSV
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-bg-dark-primary border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= stepNum ? 'bg-primary-light text-white' : 'bg-gray-300 text-gray-600'}`}>
                  {stepNum}
                </div>
                <span className={`ml-2 text-sm ${step >= stepNum ? 'text-primary-light' : 'text-gray-500'}`}>
                  {stepNum === 1 ? 'Upload File' : stepNum === 2 ? 'Map Columns' : 'Preview & Import'}
                </span>
                {stepNum < 3 && <div className="mx-4 w-8 h-0.5 bg-gray-300"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Step 1: File Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <h4 className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                  Upload Your CSV File
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your CSV should contain columns for transaction name, amount, category, and date
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-flex items-center px-6 py-3 bg-primary-light hover:bg-primary-dark text-white rounded-lg cursor-pointer transition-colors duration-200"
                >
                  Choose CSV File
                </label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Expected CSV Format:</h5>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  <p>• <strong>Name/Description:</strong> Transaction description</p>
                  <p>• <strong>Amount:</strong> Transaction amount (positive for income, negative for expenses)</p>
                  <p>• <strong>Category:</strong> Expense or income category</p>
                  <p>• <strong>Date:</strong> Transaction date (YYYY-MM-DD format preferred)</p>
                  <p>• <strong>Type (Optional):</strong> "Income" or "Expense"</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary">
                Map CSV Columns to Transaction Fields
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Match your CSV columns with our transaction fields:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-bg-dark-primary text-text-light-primary dark:text-text-dark-primary
                               focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    >
                      <option value="">Select CSV Column</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           text-text-light-primary dark:text-text-dark-primary hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={generatePreview}
                  disabled={!mapping.name || !mapping.amount}
                  className="px-6 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-lg
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Preview Import
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Import */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-text-light-primary dark:text-text-dark-primary">
                Preview ({csvData.length} transactions to import)
              </h4>

              <div className="bg-gray-50 dark:bg-bg-dark-primary rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Category</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((transaction, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2">{transaction.name}</td>
                        <td className="py-2">${transaction.amount}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.isIncome 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {transaction.isIncome ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className="py-2">{transaction.category}</td>
                        <td className="py-2">{transaction.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length < csvData.length && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-2">
                    ... and {csvData.length - preview.length} more transactions
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={importing}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           text-text-light-primary dark:text-text-dark-primary hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {importing && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  )}
                  {importing ? 'Importing...' : `Import ${csvData.length} Transactions`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;