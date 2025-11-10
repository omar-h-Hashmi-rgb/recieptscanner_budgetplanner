import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import api from '../api/axios';
import TransactionModal from '../components/TransactionModal';
import AIChatModal from '../components/AIChatModal';

const ReceiptsPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [receiptResult, setReceiptResult] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [ocrText, setOcrText] = useState('');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [expenseRes, incomeRes] = await Promise.all([
          api.get('/transactions/categories/expense'),
          api.get('/transactions/categories/income')
        ]);
        setExpenseCategories(expenseRes.data);
        setIncomeCategories(incomeRes.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // New OCR function using Tesseract.js
  const performOCR = async (imageFile) => {
    if (!imageFile) {
      setError('No image file provided');
      return;
    }

    try {
      setScanning(true);
      setError('');
      setOcrProgress(0);

      console.log('Starting OCR process with file:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);
      
      // Validate image file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
      if (!validTypes.includes(imageFile.type.toLowerCase())) {
        throw new Error('Invalid image format. Please use JPG, PNG, BMP, or TIFF.');
      }

      if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Image file is too large. Please use an image smaller than 10MB.');
      }
      
      setOcrProgress(5);
      
      const worker = await createWorker('eng', 1, {
        logger: m => {
          console.log('Tesseract progress:', m);
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            const finalProgress = Math.max(50, Math.min(95, 50 + (progress / 2)));
            setOcrProgress(finalProgress);
            console.log('OCR Progress:', finalProgress + '%');
          } else if (m.status === 'loading tesseract core') {
            setOcrProgress(15);
          } else if (m.status === 'initializing tesseract') {
            setOcrProgress(25);
          } else if (m.status === 'loading language traineddata') {
            setOcrProgress(35);
          } else if (m.status === 'initializing api') {
            setOcrProgress(45);
          }
        }
      });
      
      console.log('Worker created, setting parameters...');
      
      // Set up parameters for better recognition
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz $.,()-/:@',
        tessedit_pageseg_mode: '6'
      });
      
      console.log('Starting text recognition...');
      setOcrProgress(50);
      
      const { data: { text } } = await worker.recognize(imageFile);
      
      console.log('OCR completed, extracted text length:', text?.length);
      console.log('First 100 characters:', text?.substring(0, 100));
      
      setOcrProgress(95);
      await worker.terminate();
      setOcrProgress(100);
      
      if (!text || text.trim().length < 5) {
        setError('Could not extract meaningful text from the image. Please ensure the image is clear and contains readable text.');
        return;
      }
      
      setOcrText(text);
      setIsAIChatOpen(true);
      console.log('OCR process completed successfully');
      
    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to read text from receipt. Please try again with a clearer image.');
    } finally {
      setScanning(false);
      setOcrProgress(0);
    }
  };

  const scanReceiptForForm = async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    try {
      setScanning(true);
      setError('');
      const response = await api.post('/receipts/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Prepare data for TransactionModal
      const scanData = {
        name: `Receipt from ${response.data.vendor}`,
        category: response.data.category || 'Miscellaneous',
        cost: response.data.total || '',
        addedOn: response.data.date || new Date().toISOString().split('T')[0],
        isIncome: false,
      };
      
      setScannedData(scanData);
      setIsModalOpen(true);
    } catch (err) {
      setError('Scan failed. Please try again.');
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setReceiptResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('receipt', file);
    
    try {
      setUploading(true);
      setError('');
      const response = await api.post('/receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setReceiptResult(response.data);
      alert('Receipt processed successfully and transaction created! Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleTransactionSubmit = async (transactionData) => {
    try {
      await api.post('/transactions', transactionData);
      setIsModalOpen(false);
      setScannedData(null);
      setFile(null);
      alert('Transaction created successfully!');
      navigate('/transactions');
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary mb-6">Intelligent Receipt Processing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="card-modern p-6">
          <label className="block mb-2 text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">Select a receipt file (JPG, PNG, PDF)</label>
          <input 
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-text-light-secondary dark:text-text-dark-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/50 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
            accept=".jpeg,.jpg,.png,.pdf"
          />
          
          <div className="mt-4 space-y-2">
            <button 
              onClick={() => file && performOCR(file)}
              disabled={!file || scanning}
              className="btn btn-primary w-full relative overflow-hidden"
            >
              {scanning ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Reading Receipt... {ocrProgress}%
                </div>
              ) : (
                '🤖 AI-Powered Receipt Analysis'
              )}
            </button>
            
            <button 
              onClick={() => file && scanReceiptForForm(file)}
              disabled={!file || scanning}
              className="btn btn-success w-full"
            >
              {scanning ? 'Scanning...' : 'Quick Scan & Fill Form'}
            </button>
            
            <form onSubmit={handleSubmit}>
              <button 
                type="submit" 
                disabled={!file || uploading}
                className="btn btn-secondary w-full"
              >
                {uploading ? 'Processing...' : 'Upload & Auto-Create Transaction'}
              </button>
            </form>
          </div>
          
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="card-modern p-6">
          <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary mb-4">Last Upload Result</h2>
          {receiptResult ? (
            <div>
              <p className="text-gray-700 dark:text-gray-300"><strong>Merchant:</strong> {receiptResult.extractedData.merchant}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Amount:</strong> {receiptResult.extractedData.amount.toFixed(2)}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Category:</strong> {receiptResult.extractedData.category}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Date:</strong> {new Date(receiptResult.extractedData.date).toLocaleDateString()}</p>
              <img src={`http://localhost:5001${receiptResult.fileUrl}`} alt="Uploaded Receipt" className="mt-4 rounded-lg max-w-full h-auto" />
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Upload a receipt to see the extracted data here.</p>
          )}
        </div>

      </div>

      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleTransactionSubmit}
          transaction={scannedData}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
        />
      )}

      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        ocrText={ocrText}
        onBudgetCreated={() => {
          // Handle budget creation success
          setIsAIChatOpen(false);
          navigate('/budgets');
        }}
      />
    </>
  );
};

export default ReceiptsPage;