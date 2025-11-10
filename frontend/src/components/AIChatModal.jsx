import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

const AIChatModal = ({ isOpen, onClose, ocrText, onBudgetCreated, chatType = 'receipt' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && chatType === 'receipt' && ocrText && messages.length === 0) {
      // Initialize chat with OCR analysis for receipt type
      handleInitialOCRAnalysis();
    } else if (isOpen && chatType === 'budget' && messages.length === 0) {
      // Initialize budget planning chat
      handleInitialBudgetPlannerChat();
    }
  }, [isOpen, ocrText, chatType]);

  const handleInitialOCRAnalysis = async () => {
    if (!ocrText) return;

    setIsLoading(true);
    try {
      const response = await api.post('/ai/chat-with-receipt', {
        ocrText: ocrText,
        conversationHistory: []
      });

      if (response.data.success) {
        const aiMessage = {
          id: Date.now(),
          text: response.data.data.aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages([aiMessage]);
        setConversationHistory(response.data.data.conversationHistory);
      }
    } catch (error) {
      console.error('Failed to get AI analysis:', error);
      const errorMessage = {
        id: Date.now(),
        text: 'Sorry, I encountered an error analyzing your receipt. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    }
    setIsLoading(false);
  };

  const handleInitialBudgetPlannerChat = async () => {
    setIsLoading(true);
    try {
      const initialMessage = "Hello! I'm your AI Budget Planner. I can help you create budgets, analyze spending patterns, and provide financial advice. How can I assist you with your financial planning today?";
      
      const aiMessage = {
        id: Date.now(),
        text: initialMessage,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages([aiMessage]);
    } catch (error) {
      console.error('Failed to initialize budget chat:', error);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      
      if (chatType === 'budget') {
        response = await api.post('/ai/budget-planner-chat', {
          userMessage: inputMessage,
          conversationHistory: conversationHistory
        });
      } else {
        response = await api.post('/ai/chat-with-receipt', {
          userMessage: inputMessage,
          conversationHistory: conversationHistory
        });
      }

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.data.aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setConversationHistory(response.data.data.conversationHistory);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setMessages([]);
    setConversationHistory([]);
    setInputMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {chatType === 'budget' ? 'AI Budget Planner' : 'AI Receipt Assistant'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-4xl mb-4">{chatType === 'budget' ? '💰' : '🤖'}</div>
              <p>{chatType === 'budget' ? 'AI Budget Planner is ready to help!' : 'AI Assistant is ready to help with your receipt!'}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                  <span className="text-slate-800 dark:text-slate-100">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={chatType === 'budget' 
                ? "Ask about budget planning, financial goals, or investment strategies..." 
                : "Ask about budgets, categorization, or financial advice..."}
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none
                         bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                         flex items-center justify-center"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;