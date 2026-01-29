import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FluidGradient } from '../components/ui/fluid-gradient';
import { NeonGradientCard } from '../components/ui/neon-gradient-card';
import { Receipt, TrendingUp, Target, DollarSign, PieChart, Zap } from 'lucide-react';

export default function WelcomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-blue-950">
      {/* Fluid Gradient Background - Fixed Position */}
      <div className="fixed inset-0 z-0">
        <FluidGradient />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Header */}
        <header className="py-6 px-8 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Receipt<span className="text-blue-400">Wise</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6">
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-white/80 hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-white/80 hover:text-white transition-colors"
              >
                About
              </button>
            </nav>
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-20">
          <div className="max-w-5xl mx-auto space-y-10">
            <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight">
              Master Your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Financial Journey
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Empower your financial future with intelligent expense tracking, automated receipt processing, 
              and comprehensive analytics designed to transform how you manage money.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8">
              <button
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                className="px-10 py-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xl transition-all hover:scale-105 shadow-lg shadow-blue-500/50"
              >
                {user ? 'Go to Dashboard' : 'Get Started for Free'}
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 rounded-full border-2 border-white/40 hover:border-white/60 hover:bg-white/10 text-white font-semibold text-xl transition-all hover:scale-105"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section with Neon Cards */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-center text-4xl font-bold text-white mb-4">
              Comprehensive Financial Management Tools
            </h3>
            <p className="text-center text-white/70 mb-16 max-w-2xl mx-auto">
              Everything you need to take control of your finances in one powerful platform
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <NeonGradientCard
                className="w-full"
                borderSize={3}
                borderRadius={16}
                neonColors={{
                  firstColor: "#0066ff",
                  secondColor: "#00d4ff",
                }}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <TrendingUp size={32} className="text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Advanced Financial Analytics
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Gain deep insights into your spending patterns with comprehensive charts and visualizations. Make data-driven financial decisions with confidence.
                  </p>
                </div>
              </NeonGradientCard>

              {/* Card 2 */}
              <NeonGradientCard
                className="w-full"
                borderSize={3}
                borderRadius={16}
                neonColors={{
                  firstColor: "#0066ff",
                  secondColor: "#00d4ff",
                }}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Receipt size={32} className="text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    AI-Powered Receipt Processing
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Experience seamless expense tracking with intelligent OCR technology. Simply capture receipts and watch details auto-extract.
                  </p>
                </div>
              </NeonGradientCard>

              {/* Card 3 */}
              <NeonGradientCard
                className="w-full"
                borderSize={3}
                borderRadius={16}
                neonColors={{
                  firstColor: "#0066ff",
                  secondColor: "#00d4ff",
                }}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <PieChart size={32} className="text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Smart Categorization
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Streamline your financial tracking with intelligent categorization systems. Customize categories to match your lifestyle.
                  </p>
                </div>
              </NeonGradientCard>

              {/* Card 4 */}
              <NeonGradientCard
                className="w-full"
                borderSize={3}
                borderRadius={16}
                neonColors={{
                  firstColor: "#0066ff",
                  secondColor: "#00d4ff",
                }}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Target size={32} className="text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Goal Tracking
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Set and monitor your financial objectives with precision. Stay motivated with visual progress tracking.
                  </p>
                </div>
              </NeonGradientCard>

              {/* Card 5 */}
              <NeonGradientCard
                className="w-full"
                borderSize={3}
                borderRadius={16}
                neonColors={{
                  firstColor: "#0066ff",
                  secondColor: "#00d4ff",
                }}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <DollarSign size={32} className="text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Budget Management
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Plan and monitor budgets across different categories. Get alerts when approaching spending limits.
                  </p>
                </div>
              </NeonGradientCard>

              {/* Card 6 */}
              <NeonGradientCard
                className="w-full"
                borderSize={3}
                borderRadius={16}
                neonColors={{
                  firstColor: "#0066ff",
                  secondColor: "#00d4ff",
                }}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Zap size={32} className="text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Real-time Sync
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Access your financial data anywhere, anytime. Seamless synchronization across all your devices.
                  </p>
                </div>
              </NeonGradientCard>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl font-bold text-white mb-6">
              Why <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ReceiptWise</span>?
            </h3>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              We combine cutting-edge AI technology with intuitive design to provide a comprehensive financial management solution. 
              Our platform helps you understand your spending, achieve your goals, and build a stronger financial future.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-blue-500/30 rounded-full text-white">
                <span className="font-semibold">AI-Powered</span>
              </div>
              <div className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-blue-500/30 rounded-full text-white">
                <span className="font-semibold">Secure</span>
              </div>
              <div className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-blue-500/30 rounded-full text-white">
                <span className="font-semibold">Multi-Currency</span>
              </div>
              <div className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-blue-500/30 rounded-full text-white">
                <span className="font-semibold">Real-time Analytics</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-white/60 border-t border-white/10">
          <p>&copy; {new Date().getFullYear()} ReceiptWise. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
}
