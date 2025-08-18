import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { API_BASE } from '../../lib/api';
import { PacmanLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { getCategoryBreakdown, getMonthlyTrend } from "../utills/Analytics";

// For charts
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  ArcElement, CategoryScale, LinearScale, PointElement, LineElement
} from "chart.js";

ChartJS.register(
  Title, Tooltip, Legend,
  ArcElement, CategoryScale, LinearScale, PointElement, LineElement
);

const Me = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1 (555) 123-4567'
  });

  const [loading, setLoading] = useState(false);

  const [analytics, setAnalytics] = useState({
    totalExpenses: 0,
    totalExpensesCount: 0,
    favoriteCategory: '',
    categoryBreakdown: [],
    monthlyTrend: []
  });

  const handleLogout = () => {
    sessionStorage.removeItem('jwtToken');
    navigate('/login');
  };

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");

    if (!token) {
      console.error("No JWT token found in sessionStorage");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { "Authorization": `${token}` }
        });

        let firstName = "";
        let lastName = "";

        if (res.data.username) {
          const parts = res.data.username.trim().split(" ");
          firstName = parts[0];
          lastName = parts.slice(1).join(" ");
        }

        setUser({
          firstName,
          lastName,
          email: res.data.email || "",
          phoneNumber: res.data.phone || ""
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/expense/summary`, {
          headers: { "Authorization": `${token}` }
        });

        const breakdown = getCategoryBreakdown(res.data.expenses || []);
        const trend = getMonthlyTrend(res.data.expenses || []);

        setAnalytics({
          totalExpenses: res.data.totalExpense,
          totalExpensesCount: res.data.totalExpenseCount,
          favoriteCategory: res.data.favoriteCategory,
          categoryBreakdown: breakdown,
          monthlyTrend: trend
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    // Run both in parallel
    fetchUser();
    fetchAnalytics();
  }, [navigate]);

  // ✅ Chart data
  const categoryData = {
    labels: analytics.categoryBreakdown.map(c => c.description),
    datasets: [{
      label: "Expenses by Category",
      data: analytics.categoryBreakdown.map(c => c.amount),
      backgroundColor: ["#60a5fa", "#a78bfa", "#f472b6", "#34d399", "#facc15"],
    }]
  };

  const monthlyData = {
    labels: analytics.monthlyTrend.map(m => m.month),
    datasets: [{
      label: "Monthly Expenses",
      data: analytics.monthlyTrend.map(m => m.amount),
      borderColor: "#6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.2)",
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      {loading ? (
        <div className="flex justify-center items-center min-h-[80vh]">
          <PacmanLoader color="#facc15" size={35} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          
          {/* Profile Section */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-2 text-lg text-gray-600">Expense Tracker User</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Personal Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-lg text-gray-900">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email Address</label>
                  <p className="mt-1 text-lg text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="mt-1 text-lg text-gray-900">{user.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Expense Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                </svg>
                Expense Statistics
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-blue-900">₹ {analytics.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-600">Number of Expenses</p>
                  <p className="text-2xl font-bold text-purple-900">{analytics.totalExpensesCount}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Favorite Category</p>
                  <p className="text-2xl font-bold text-green-900">{analytics.favoriteCategory}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
              <Pie data={categoryData} />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Monthly Trend</h2>
              <Line data={monthlyData} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700">
                + Add New Expense
              </button>
              <button className="p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                📊 View Reports
              </button>
              <button className="p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                ⚙️ Settings
              </button>
              <button onClick={handleLogout} className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Me;
