# ReceiptWise

**ReceiptWise** is a comprehensive **full-stack personal finance management application** designed to revolutionize how you track, manage, and analyze your financial life. Built with modern technologies including **React (frontend), Node.js/Express (backend), MongoDB (database)**, and enhanced with **Google Gemini AI for intelligent receipt scanning** and **GROQ AI for advanced language processing**, ReceiptWise transforms financial management into an intuitive, data-driven experience.

## 🚀 Core Features

### 💳 **Smart Financial Tracking**
* **Comprehensive Transaction Management** – Seamlessly record income and expenses with intelligent categorization
* **Intelligent Receipt Processing** – Upload receipts and automatically extract expense details using **Google Gemini OCR technology**
* **AI-Powered Analysis** – Enhanced financial insights with **GROQ AI** natural language processing
* **Advanced Analytics Dashboard** – Visualize your financial patterns with interactive charts and insights

### 📊 **Powerful Analytics & Insights**
* **Real-time Financial Overview** – Monitor your income, expenses, and balance at a glance
* **Category-based Expense Analysis** – Understand spending patterns with detailed breakdowns
* **Trend Visualization** – Track financial trends over time with dynamic charts
* **Budget Planning & Monitoring** – Set and track budgets across different categories

### 🎯 **Advanced Financial Tools**
* **Goal Setting & Tracking** – Define and monitor your financial objectives
* **Recurring Transaction Management** – Automate regular income and expense tracking
* **Multi-Currency Support** – Handle finances in different currencies
* **Secure Authentication** – JWT-based security with comprehensive user management

### 🌟 **User Experience Excellence**
* **Responsive Design** – Seamless experience across desktop, tablet, and mobile devices
* **Dark/Light Mode** – Customizable themes for optimal viewing
* **Intuitive Interface** – Clean, modern design focused on usability
* **Real-time Updates** – Instant synchronization across all your devices

## 🌐 Deployment Links

* **Frontend Application**: [Netlify](https://receiptwise.netlify.app/)
* **Backend API**: [Render](https://receiptwise.onrender.com)
* **API Documentation**: Available in OpenAPI 3.0 format

## 🛠 Technology Stack

### **Frontend Architecture**
* **React 18** with **Vite** for lightning-fast development
* **React Router** for seamless navigation
* **Axios** for robust API communication
* **TailwindCSS** for modern, responsive styling
* **Context API** for efficient state management
* **Chart.js/Recharts** for interactive data visualization

### **Backend Infrastructure**
* **Node.js** with **Express.js** framework
* **MongoDB** with **Mongoose** ODM
* **JWT Authentication** for secure user sessions
* **Multer** for efficient file upload handling
* **Google Gemini AI SDK** for advanced OCR capabilities
* **GROQ AI API** for enhanced natural language processing
* **RESTful API** design with comprehensive error handling

### **Development & Deployment**
* **ESLint** for code quality
* **Nodemon** for development efficiency
* **Environment Configuration** with dotenv
* **Frontend** → Netlify deployment
* **Backend** → Render deployment
* **Database** → MongoDB Atlas cloud hosting

### 📁 Project Architecture

```
receiptwise/
├── backend/                    # Server-side application
│   ├── server.js              # Express application entry point
│   ├── package.json           # Backend dependencies
│   ├── config/
│   │   └── db.js             # Database configuration
│   ├── routes/               # API route definitions
│   │   ├── authRoutes.js     # Authentication endpoints
│   │   ├── transactionRoutes.js
│   │   ├── receiptRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── goalRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/           # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── controllers/          # Business logic
│   ├── models/              # Database schemas
│   └── uploads/             # Static file storage
│
├── frontend/                # Client-side application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── api/            # API service layer
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── tailwind.config.js  # Tailwind CSS configuration
│
├── docs/
│   └── openapi.yaml        # Complete API documentation
│
├── docker-compose.yml      # Docker container orchestration
└── README.md              # This documentation
```

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (version 16 or higher)
* **npm** or **yarn** package manager
* **MongoDB Atlas** account (or local MongoDB installation)
* **Google Gemini AI API** key
* **GROQ AI API** key

### 1. Repository Setup

**Fork the repository first:**
1. Navigate to: `https://github.com/your-username/receiptwise`
2. Click the **Fork** button in the top-right corner

**Clone your forked repository:**
```bash
git clone https://github.com/your-username/receiptwise.git
cd receiptwise
```

### 2. Backend Configuration

```bash
cd backend
npm install
```

**Create environment file** (`.env`) in the `backend/` directory:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/receiptwise

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here

# AI Integration
GEMINI_API_KEY=your-google-gemini-api-key
GROQ_API_KEY=your-groq-ai-api-key

# Health Check (for deployment)
KEEP_ALIVE_URL=http://localhost:5000
```

**Start the development server:**
```bash
npm run dev
```
✅ Backend server running at: `http://localhost:5000`

### 3. Frontend Configuration

```bash
cd frontend
npm install
```

**Create environment file** (`.env`) in the `frontend/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000
```

**Start the development server:**
```bash
npm run dev
```
✅ Frontend application running at: `http://localhost:5173`

## 📚 Comprehensive API Documentation

### 🔑 Core API Endpoints

#### **Authentication & User Management**
```
POST /api/auth/signup          # Create new user account
POST /api/auth/login           # User authentication
GET  /api/auth/me             # Retrieve user profile
DELETE /api/users/account     # Permanently delete user account
```

#### **Transaction Management**
```
GET    /api/transactions                    # Retrieve all transactions (paginated)
POST   /api/transactions                   # Create new transaction
PUT    /api/transactions/:id              # Update existing transaction
DELETE /api/transactions/:id             # Delete transaction
GET    /api/transactions/summary         # Financial summary & recent transactions
GET    /api/transactions/charts          # Analytics data for dashboard
GET    /api/transactions/categories      # Retrieve all categories
DELETE /api/transactions/category       # Remove custom category
```

#### **Smart Receipt Processing**
```
POST /api/receipts/upload     # Upload receipt, process with AI, create transaction
GET  /api/receipts           # Retrieve all receipts
DELETE /api/receipts/:id     # Delete receipt and associated data
```

#### **Budget & Goals**
```
GET    /api/budgets          # Retrieve user budgets
POST   /api/budgets          # Create new budget
PUT    /api/budgets/:id      # Update budget
DELETE /api/budgets/:id     # Delete budget

GET    /api/goals           # Retrieve financial goals
POST   /api/goals           # Create new goal
PUT    /api/goals/:id       # Update goal progress
DELETE /api/goals/:id      # Delete goal
```

#### **Recurring Transactions**
```
GET    /api/recurring       # Retrieve recurring transactions
POST   /api/recurring/create # Create new recurring transaction
PUT    /api/recurring/:id   # Update recurring transaction
DELETE /api/recurring/:id  # Delete recurring transaction
```

## 🌐 Production Deployment

### **Backend Deployment (Render)**

1. **Create Render Web Service**
2. **Configure Build & Start Commands:**
   ```bash
   Build Command: npm install
   Start Command: npm start
   ```
3. **Environment Variables:**
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=production-secret
   GEMINI_API_KEY=your-api-key
   GROQ_API_KEY=your-groq-api-key
   KEEP_ALIVE_URL=https://your-app.onrender.com
   ```

### **Frontend Deployment (Netlify)**

1. **Build Configuration:**
   ```
   Build Command: npm run build
   Publish Directory: dist
   ```
2. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
3. **Redirect Rules** (create `_redirects` file in `public/`):
   ```
   /*    /index.html   200
   ```

