import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <span className="text-white font-bold text-2xl tracking-tight select-none">
                Expense<span className="font-light">Tracker</span>
              </span>
            </Link>
            
          </div>
          {/* Nav Links */}
          <div className="flex space-x-4">
            
            <Link
              to="/create-expense"
              className="text-gray-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors duration-200"
            >
              Create Expense
            </Link>
            <button
              onClick={() => navigate('/export')}
              className="text-gray-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors duration-200 flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
            <Link
              to="/about-me"
              className="text-gray-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors duration-200"
            >
              About Me
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
