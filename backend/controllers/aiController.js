const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// AI Chat with Receipt OCR text (using llama-3.1-8b-instant for fast processing)
const chatWithReceipt = async (req, res) => {
  try {
    const { ocrText, userMessage, conversationHistory = [] } = req.body;

    if (!ocrText && !userMessage) {
      return res.status(400).json({
        success: false,
        message: 'Either OCR text or user message is required'
      });
    }

    // Build conversation context for receipt analysis
    const systemPrompt = `You are ReceiptWise AI, a specialized financial assistant for receipt analysis and expense categorization.
    
    Your main responsibilities:
    1. Analyze receipt OCR text to extract: store name, items, amounts, total, date, tax
    2. Categorize expenses into standard categories: Food & Dining, Groceries, Transportation, Entertainment, Shopping, Bills & Utilities, Health & Fitness, etc.
    3. Suggest budget creation based on spending patterns
    4. Ask clarifying questions to better understand the purchase context
    5. Provide quick actionable advice for expense tracking
    
    Always respond in a helpful, conversational tone. Be specific about what you found in the receipt and practical about budgeting suggestions.`;

    // Prepare messages array
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
    ];

    // Add OCR context if provided
    if (ocrText) {
      messages.push({
        role: "user",
        content: `Please analyze this receipt OCR text and help me categorize this expense: ${ocrText}`
      });
    }

    // Add current user message if provided
    if (userMessage) {
      messages.push({
        role: "user",
        content: userMessage
      });
    }

    // Call Groq API with fast model for receipt processing
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.3, // Lower temperature for more consistent receipt analysis
      max_tokens: 800,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;

    if (!aiResponse) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get AI response'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        aiResponse,
        conversationHistory: [
          ...conversationHistory,
          ...(ocrText ? [{ role: "user", content: `Analyze receipt: ${ocrText}` }] : []),
          ...(userMessage ? [{ role: "user", content: userMessage }] : []),
          { role: "assistant", content: aiResponse }
        ]
      }
    });

  } catch (error) {
    console.error('AI Receipt Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// General Budget Planning Chat (using llama-3.1-70b-versatile for comprehensive planning)
const budgetPlannerChat = async (req, res) => {
  try {
    const { userMessage, conversationHistory = [], userProfile = {} } = req.body;

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        message: 'User message is required'
      });
    }

    // Build conversation context for comprehensive budget planning
    const systemPrompt = `You are ReceiptWise Budget Planner AI, a comprehensive financial planning assistant.

    Your expertise includes:
    1. Creating detailed monthly and yearly budgets
    2. Analyzing spending patterns and suggesting optimizations
    3. Setting and tracking financial goals (emergency fund, debt payoff, savings)
    4. Investment advice and portfolio recommendations
    5. Debt management strategies
    6. Expense categorization and tracking methods
    7. Financial habit coaching and behavioral insights
    
    User Profile: ${JSON.stringify(userProfile)}
    
    Always provide detailed, actionable advice. Ask follow-up questions to better understand the user's financial situation. Be encouraging and practical in your recommendations.`;

    // Prepare messages array
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage }
    ];

    // Call Groq API with more powerful model for comprehensive planning
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;

    if (!aiResponse) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get AI response'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        aiResponse,
        conversationHistory: [
          ...conversationHistory,
          { role: "user", content: userMessage },
          { role: "assistant", content: aiResponse }
        ]
      }
    });

  } catch (error) {
    console.error('Budget Planner Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Generate Budget Suggestions (using llama-3.1-8b-instant for quick suggestions)
const generateBudgetSuggestions = async (req, res) => {
  try {
    const { spendingData, monthlyIncome, financialGoals } = req.body;

    if (!spendingData) {
      return res.status(400).json({
        success: false,
        message: 'Spending data is required for budget suggestions'
      });
    }

    const prompt = `Based on this spending data: ${JSON.stringify(spendingData)}
    ${monthlyIncome ? `Monthly income: $${monthlyIncome}` : ''}
    ${financialGoals ? `Financial goals: ${financialGoals}` : ''}
    
    Please suggest a realistic monthly budget breakdown with categories and amounts. Format your response as practical budget recommendations.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a financial advisor helping create personalized budget recommendations. Provide practical, realistic budget categories with suggested amounts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 800,
    });

    const suggestions = chatCompletion.choices[0]?.message?.content;

    res.status(200).json({
      success: true,
      data: {
        suggestions
      }
    });

  } catch (error) {
    console.error('Budget Suggestions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  chatWithReceipt,
  budgetPlannerChat,
  generateBudgetSuggestions
};