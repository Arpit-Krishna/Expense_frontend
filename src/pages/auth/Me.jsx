import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { API_BASE } from '../../lib/api';
import { PacmanLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';

const Me = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1 (555) 123-4567'
    
  }
  );
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalExpenses: 1247.89,
    totalExpensesCount: 23,
    favoriteCategory: 'Food'
  })

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
  
    if (!token) {
      console.error("No JWT token found in sessionStorage");
      navigate("/login")
      return;
    }
  
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: {
            "Authorization": `${token}`
          }
        });
  
        console.log("User data:", res.data);
  
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
      }
    };
  
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/expense/summary`, {
          headers: {
            "Authorization": `${token}`
          }
        });
  
        console.log("Analytics data:", res.data);
  
        setAnalytics({
          totalExpenses: res.data.totalExpense,
          totalExpensesCount: res.data.totalExpenseCount,
          favoriteCategory: res.data.favoriteCategory
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
      finally{
        setLoading(false);
      }
    };
  
    // Run both in parallel
    fetchUser();
    fetchAnalytics();
  
  }, [navigate]); // Empty deps = run once
  
    
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to purple-50">
      <Navbar />
      {
        (loading) ? 
        (<div className="flex justify-center items-center min-h-[80vh]">
          <PacmanLoader color="#facc15" size={35} />
        </div>
        ) : (
        
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
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
            {/* Personal Information */}
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

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Expense Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-blue-900">₹ {analytics.totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="text-blue-600">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3v5m6-5a3 3 0 00-3-3m-6 8h12m-9 0V8a3 3 0 116 0v8" />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Number of Expenses</p>
                    <p className="text-2xl font-bold text-purple-900">{analytics.totalExpensesCount}</p>
                  </div>
                  <div className="text-purple-600">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-600">Favorite Category</p>
                    <p className="text-2xl font-bold text-green-900">{analytics.favoriteCategory}</p>
                  </div>
                  <div className="text-green-600">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
              </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Expense
              </button>
              <button className="flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Reports
              </button>
              <button className="flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          </div>
        </div>
        )
      }
    </div>
  );
};

export default Me;
