import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import CurrencySelector from './CurrencySelector';
import ThemeToggle from './ThemeToggle';

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = 'relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3';
    if (isActive) {
      return `${baseClasses} nav-link-active`;
    }
    return `${baseClasses} nav-link-inactive`;
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-bg-light-card/90 dark:bg-bg-dark-card/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand Logo */}
            <div className="flex items-center">
              <span
                onClick={handleHomeClick}
                className="cursor-pointer text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-300"
                title="Go to home"
              >
                ReceiptWise
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavLink to="/dashboard" className={getNavLinkClass}>
                📊 Command Center
              </NavLink>
              <NavLink to="/receipts" className={getNavLinkClass}>
                📄 Smart Receipt Hub
              </NavLink>
              <NavLink to="/budgets" className={getNavLinkClass}>
                💰 Budget Planning
              </NavLink>
              <NavLink to="/goals" className={getNavLinkClass}>
                🎯 Financial Goals
              </NavLink>
              <NavLink to="/transactions" className={getNavLinkClass}>
                💳 Transaction History
              </NavLink>
              <NavLink to="/recurring-transactions" className={getNavLinkClass}>
                🔄 Recurring Payments
              </NavLink>
              <NavLink to="/settings" className={getNavLinkClass}>
                ⚙️ Account Settings
              </NavLink>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <CurrencySelector />
              <button
                onClick={logout}
                className="btn btn-outline text-sm hidden sm:flex"
              >
                Logout
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-200/20 dark:hover:bg-slate-700/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-700 fade-in">
              <div className="flex flex-col space-y-2">
                <NavLink to="/dashboard" className={getNavLinkClass} onClick={toggleMobileMenu}>
                  📊 Command Center
                </NavLink>
                <NavLink to="/receipts" className={getNavLinkClass} onClick={toggleMobileMenu}>
                  📄 Smart Receipt Hub
                </NavLink>
                <NavLink to="/budgets" className={getNavLinkClass} onClick={toggleMobileMenu}>
                  💰 Budget Planning
                </NavLink>
                <NavLink to="/goals" className={getNavLinkClass} onClick={toggleMobileMenu}>
                  🎯 Financial Goals
                </NavLink>
                <NavLink to="/transactions" className={getNavLinkClass} onClick={toggleMobileMenu}>
                  💳 Transaction History
                </NavLink>
                <NavLink to="/recurring-transactions" className={getNavLinkClass} onClick={toggleMobileMenu}>
                  🔄 Recurring Payments
                </NavLink>
                <NavLink to="/settings" className={getNavLinkClass} onClick={toggleMobileMenu}>
                  ⚙️ Account Settings
                </NavLink>
                <button
                  onClick={() => { logout(); toggleMobileMenu(); }}
                  className="btn btn-outline text-sm mt-4"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="content-wrapper">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;