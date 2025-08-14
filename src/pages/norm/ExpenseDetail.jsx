import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { API_BASE } from '../../lib/api';

const ExpenseDetail = () => {
  const { id } = useParams();
  // console.log(id);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [expense, setExpense] = useState({});

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
      console.error("No JWT token found in sessionStorage");
      navigate("/login");
      return;
    }

    const fetchExpense = async(id) => {
      try {
        const res = await axios.get(`${API_BASE}/api/expense/${id}`, {
          headers: { "Authorization": token }
        });

        console.log("Fetched expense:", res.data);
        
        setExpense(res.data);

      } catch (error) {
        console.error("Error fetching expense:", error);
      }
    };
    fetchExpense(id);
  },[id, navigate]);

  const handleEdit = () => {
    console.log('Edit expense:', expense.id);
    alert('Edit functionality will be implemented here');
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
  
    setIsDeleting(true);
  
    try {
      const token = sessionStorage.getItem("jwtToken"); 
      const res = await axios.delete(`${API_BASE}/api/expense/${expense.id}`, {
        headers: {
          "Authorization": token
        }
      });
  
      console.log("Expense deleted:", res.data);
      alert("Expense deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      ),
      'Transport': (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'Utilities': (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      'Entertainment': (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'Health': (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      'Shopping': (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      'Education': (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      'Travel': (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'Other': (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    };
    return icons[category] || icons['Other'];
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food': 'bg-gray-800 text-gray-200',
      'Transport': 'bg-gray-800 text-gray-200',
      'Utilities': 'bg-gray-800 text-gray-200',
      'Entertainment': 'bg-gray-800 text-gray-200',
      'Health': 'bg-gray-800 text-gray-200',
      'Shopping': 'bg-gray-800 text-gray-200',
      'Education': 'bg-gray-800 text-gray-200',
      'Travel': 'bg-gray-800 text-gray-200',
      'Other': 'bg-gray-800 text-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-300 hover:text-white transition-colors duration-200 mb-4"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Expenses
          </button>
          <h1 className="text-3xl font-extrabold text-gray-100">Expense Details</h1>
        </div>

        {/* Expense Card */}
        <div className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg overflow-hidden border border-gray-800">
          {/* Header with amount */}
          <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{expense.title}</h2>
                <div className="flex items-center mt-2 text-gray-200">
                  {getCategoryIcon(expense.category)}
                  <span className="ml-2">{expense.category}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">₹{expense.amount}</p>
                <p className="text-gray-300 text-sm">Amount</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Category Badge */}
            <div className="flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(expense.category)}`}>
                {getCategoryIcon(expense.category)}
                <span className="ml-2">{expense.category}</span>
              </span>
            </div>

            {/* Date Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Expense Date</h3>
                <p className="text-lg text-gray-100">{new Date(expense.date).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Created</h3>
                <p className="text-lg text-gray-100">{new Date(expense.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="border-t border-gray-800 pt-4">
              <div className="text-sm text-gray-400 space-y-1">
                <p>Created: {new Date(expense.createdAt).toLocaleString()}</p>
                <p>Last updated: {new Date(expense.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-800 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleEdit}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-600 text-gray-200 rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Expense
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-red-600 text-red-400 rounded-md hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Expense
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
