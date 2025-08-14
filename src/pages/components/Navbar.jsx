import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const shouldUseDark = stored ? stored === 'dark' : true;
    setIsDark(shouldUseDark);
    const root = document.documentElement;
    if (shouldUseDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    if (next) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };
  return (
    <nav className="bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-black shadow-md border-b border-gray-200 dark:border-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center justify-between flex-1">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" onClick={() => setIsOpen(false)}>
                <span className="dark:text-white text-black font-bold text-2xl tracking-tight select-none">
                  Expense<span className="font-light">Tracker</span>
                </span>
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                aria-label="Toggle theme"
                title={isDark ? 'Switch to Light' : 'Switch to Dark'}
              >
                {isDark ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                aria-expanded={isOpen}
                aria-label="Toggle navigation"
              >
                <span className="sr-only">Toggle navigation</span>
                <span className="flex flex-col items-center justify-center space-y-1.5">
                  <span
                    className={`block h-0.5 w-6 rounded bg-gray-200 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-2 rotate-45' : ''}`}
                  />
                  <span
                    className={`block h-0.5 w-6 rounded bg-gray-200 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`}
                  />
                  <span
                    className={`block h-0.5 w-6 rounded bg-gray-200 transition-transform duration-300 ease-in-out ${isOpen ? '-translate-y-2 -rotate-45' : ''}`}
                  />
                </span>
              </button>
            </div>
          </div>
          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/create-expense"
              className="text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
            >
              Create Expense
            </Link>
            <button
              onClick={() => navigate('/export')}
              className="text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
            <Link
              to="/about-me"
              className="text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
            >
              About Me
            </Link>
            <button
              onClick={toggleTheme}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
              aria-label="Toggle theme"
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            >
              {isDark ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/create-expense"
              onClick={() => setIsOpen(false)}
              className="block text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md text-base font-medium hover:bg-black/5 dark:hover:bg-white/10"
            >
              Create Expense
            </Link>
            <button
              onClick={() => { setIsOpen(false); navigate('/export'); }}
              className="w-full text-left text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md text-base font-medium hover:bg-black/5 dark:hover:bg-white/10 flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
            <Link
              to="/about-me"
              onClick={() => setIsOpen(false)}
              className="block text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md text-base font-medium hover:bg-black/5 dark:hover:bg-white/10"
            >
              About Me
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
