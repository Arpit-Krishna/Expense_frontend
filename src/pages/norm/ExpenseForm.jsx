import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../lib/api';

const initialForm = {
  title: '',
  amount: '',
  category: ''
};

const categories = [
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Education',
  'Travel',
  'Other'
];

const ExpenseForm = () => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';

    if (formData.amount === '' || Number.isNaN(Number(formData.amount))) {
      newErrors.amount = 'Amount is required';
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
        const token = sessionStorage.getItem("jwtToken");

        if (!token) {
        console.error("No JWT token found");
        alert("You must be logged in to create an expense.");
    
        setIsSubmitting(false);
        navigate("/login");
        return;
        }

        const payload = {
        ...formData,
        amount: Number(formData.amount),
        description: formData.category 
        };

        const res = await axios.post(`${API_BASE}/api/expense`, payload, {
        headers: {
            "Authorization": `${token}`,
            "Content-Type": "application/json"
        }
        });

        console.log("Expense created:", res.data);

        alert("Expense created successfully!");
        setFormData(initialForm); 
    } catch (error) {
        console.error("Error creating expense:", error);
        alert("Failed to create expense. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-full flex items-center justify-center">
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3v5m6-5a3 3 0 00-3-3m-6 8h12m-9 0V8a3 3 0 116 0v8" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-100">Create Expense</h1>
          <p className="mt-2 text-sm text-gray-400">Add a new expense to track your spending</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg p-6 space-y-5 border border-gray-800">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Grocery shopping"
              className={`mt-1 block w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-700'} px-3 py-2 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className={`mt-1 block w-full rounded-md border ${errors.amount ? 'border-red-500' : 'border-gray-700'} px-3 py-2 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
            />
            {errors.amount && <p className="mt-1 text-sm text-red-400">{errors.amount}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.category ? 'border-red-500' : 'border-gray-700'} px-3 py-2 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
            >
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-gray-900 via-gray-800 to-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-black hover:to-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Create Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
