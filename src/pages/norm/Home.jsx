import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { API_BASE } from '../../lib/api';
import { PacmanLoader } from 'react-spinners';

const Home = () => {
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
      console.error("No JWT token found in sessionStorage");
      navigate("/login");
      return;
    }

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/expense`, {
          headers: { "Authorization": `${token}` },
          params: {
            page: currentPage - 1,
            size: itemsPerPage,
            sortBy: sortBy,
            sortDir: sortDirection
          }
        });

        console.log("Fetched expenses:", res.data);

        if (res.data.totalItems === 0) {
          alert("No Expenses found!! Create a new expense...");
          navigate("/create-expense");
        }

        setExpenses(res.data.expenses || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [currentPage, sortBy, sortDirection, selectedCategory, navigate]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(expenses.map(expense => expense.category))];
    return ['all', ...uniqueCategories];
  }, [expenses]);

  const handleExpenseClick = (expenseId) => {
    navigate(`/expense/${expenseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <Navbar />

      {loading ? (
        <div className="flex justify-center items-center min-h-[80vh]">
          <PacmanLoader color="#facc15" size={35} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-100 mb-8 text-center">All Expenses</h1>

          {/* Filters */}
          <div className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg p-6 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-gray-800">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-300">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-700 bg-gray-800 text-gray-100 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-300">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-700 bg-gray-800 text-gray-100 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="title">Title</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-1 rounded hover:bg-gray-800 transition-colors text-gray-300"
                title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortDirection === 'asc' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg p-6 border border-gray-800">
            {expenses.length === 0 ? (
              <p className="text-center text-gray-400">No expenses found.</p>
            ) : (
              <>
                <ul className="space-y-4 mb-6">
                  {expenses.map(expense => (
                    <li
                      key={expense.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleExpenseClick(expense.id)}
                    >
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-gray-100">{expense.title}</div>
                        <div className="text-sm text-gray-400">{expense.category} &bull; {new Date(expense.date).toLocaleDateString()}</div>
                      </div>
                      <div className="mt-2 sm:mt-0 sm:ml-6 text-xl font-bold text-gray-100">
                        ₹{expense.amount.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                    <div className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-700 text-gray-200 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-700 text-gray-200 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
