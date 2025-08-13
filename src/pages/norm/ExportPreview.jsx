import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ExportPreview = () => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  // Mock data - replace with actual expense data from your backend
  const expenses = [
    {
      id: 1,
      title: 'Groceries',
      amount: 54.99,
      date: '2024-06-01',
      category: 'Food',
    },
    {
      id: 2,
      title: 'Internet Bill',
      amount: 39.99,
      date: '2024-06-03',
      category: 'Utilities',
    },
    {
      id: 3,
      title: 'Movie Night',
      amount: 15.00,
      date: '2024-06-05',
      category: 'Entertainment',
    },
    {
      id: 4,
      title: 'Gym Membership',
      amount: 29.99,
      date: '2024-06-07',
      category: 'Health',
    },
    {
      id: 5,
      title: 'Coffee',
      amount: 4.50,
      date: '2024-06-08',
      category: 'Food',
    },
  ];

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCount = expenses.length;

  const handleExport = () => {
    setIsExporting(true);

    let content, mimeType, fileExtension;

    switch (exportFormat) {
      case 'csv': {
        // Convert to CSV format
        const headers = ['ID', 'Title', 'Amount', 'Date', 'Category'];
        content = [
          headers.join(','),
          ...expenses.map(expense => [
            expense.id,
            `"${expense.title}"`,
            expense.amount,
            expense.date,
            `"${expense.category}"`
          ].join(','))
        ].join('\n');
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
        break;
      }

      case 'json': {
        // Convert to JSON format
        content = JSON.stringify(expenses, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        fileExtension = 'json';
        break;
      }

      case 'excel': {
        // Convert to Excel format (CSV with Excel MIME type)
        const excelHeaders = ['ID', 'Title', 'Amount', 'Date', 'Category'];
        content = [
          excelHeaders.join(','),
          ...expenses.map(expense => [
            expense.id,
            `"${expense.title}"`,
            expense.amount,
            expense.date,
            `"${expense.category}"`
          ].join(','))
        ].join('\n');
        mimeType = 'application/vnd.ms-excel;charset=utf-8;';
        fileExtension = 'xls';
        break;
      }

      case 'pdf': {
        // Generate PDF content using HTML
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const currentDate = new Date().toLocaleDateString();
        
        content = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Expense Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #111827; margin-bottom: 5px; }
              .header p { color: #6b7280; margin: 0; }
              .summary { margin-bottom: 30px; }
              .summary-item { display: inline-block; margin-right: 30px; }
              .summary-label { font-size: 12px; color: #6b7280; }
              .summary-value { font-size: 18px; font-weight: bold; color: #111827; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #111827; color: #F9FAFB; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #1f2937; }
              td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
              .category { background-color: #1f2937; color: #F3F4F6; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
              .amount { font-weight: bold; color: #059669; }
              .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Expense Report</h1>
              <p>Generated on ${currentDate}</p>
            </div>
            
            <div class="summary">
              <div class="summary-item">
                <div class="summary-label">Total Expenses</div>
                <div class="summary-value">${expenses.length}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Amount</div>
                <div class="summary-value">$${totalAmount.toFixed(2)}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                ${expenses.map(expense => `
                  <tr>
                    <td>${expense.id}</td>
                    <td>${expense.title}</td>
                    <td class="amount">$${expense.amount.toFixed(2)}</td>
                    <td>${expense.date}</td>
                    <td><span class="category">${expense.category}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>This report was generated by Expense Tracker</p>
            </div>
          </body>
          </html>
        `;
        mimeType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      }

      default:
        content = '';
        mimeType = 'text/plain';
        fileExtension = 'txt';
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.${fileExtension}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message and redirect
    setTimeout(() => {
      setIsExporting(false);
      alert(`Export completed successfully! File saved as ${fileExtension.toUpperCase()}`);
      navigate('/');
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-black via-gray-900 to-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-100">Export Data Preview</h1>
          <p className="mt-2 text-lg text-gray-400">Review your expense data before exporting</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-100">{totalCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3v5m6-5a3 3 0 00-3-3m-6 8h12m-9 0V8a3 3 0 116 0v8" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-100">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Export Format</p>
                <p className="text-2xl font-bold text-gray-100">{exportFormat.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg p-6 mb-8 border border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Choose Export Format</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="relative flex cursor-pointer rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-sm focus:outline-none text-gray-100">
              <input
                type="radio"
                name="export-format"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={(e) => setExportFormat(e.target.value)}
                className="sr-only"
              />
              <span className={`flex flex-1 ${exportFormat === 'csv' ? 'ring-2 ring-gray-500' : ''}`}>
                <span className="flex flex-col">
                  <span className="block text-sm font-medium">CSV</span>
                  <span className="mt-1 flex items-center text-sm text-gray-400">
                    Comma-separated values, perfect for Excel
                  </span>
                </span>
              </span>
              <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${exportFormat === 'csv' ? 'border-gray-600' : 'border-transparent'}`}></span>
            </label>

            <label className="relative flex cursor-pointer rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-sm focus:outline-none text-gray-100">
              <input
                type="radio"
                name="export-format"
                value="json"
                checked={exportFormat === 'json'}
                onChange={(e) => setExportFormat(e.target.value)}
                className="sr-only"
              />
              <span className={`flex flex-1 ${exportFormat === 'json' ? 'ring-2 ring-gray-500' : ''}`}>
                <span className="flex flex-col">
                  <span className="block text-sm font-medium">JSON</span>
                  <span className="mt-1 flex items-center text-sm text-gray-400">
                    Structured data format for developers
                  </span>
                </span>
              </span>
              <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${exportFormat === 'json' ? 'border-gray-600' : 'border-transparent'}`}></span>
            </label>

            <label className="relative flex cursor-pointer rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-sm focus:outline-none text-gray-100">
              <input
                type="radio"
                name="export-format"
                value="excel"
                checked={exportFormat === 'excel'}
                onChange={(e) => setExportFormat(e.target.value)}
                className="sr-only"
              />
              <span className={`flex flex-1 ${exportFormat === 'excel' ? 'ring-2 ring-gray-500' : ''}`}>
                <span className="flex flex-col">
                  <span className="block text-sm font-medium">Excel</span>
                  <span className="mt-1 flex items-center text-sm text-gray-400">
                    Excel-compatible format (.xls)
                  </span>
                </span>
              </span>
              <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${exportFormat === 'excel' ? 'border-gray-600' : 'border-transparent'}`}></span>
            </label>

            <label className="relative flex cursor-pointer rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-sm focus:outline-none text-gray-100">
              <input
                type="radio"
                name="export-format"
                value="pdf"
                checked={exportFormat === 'pdf'}
                onChange={(e) => setExportFormat(e.target.value)}
                className="sr-only"
              />
              <span className={`flex flex-1 ${exportFormat === 'pdf' ? 'ring-2 ring-gray-500' : ''}`}>
                <span className="flex flex-col">
                  <span className="block text-sm font-medium">PDF</span>
                  <span className="mt-1 flex items-center text-sm text-gray-400">
                    Portable document format for printing
                  </span>
                </span>
              </span>
              <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${exportFormat === 'pdf' ? 'border-gray-600' : 'border-transparent'}`}></span>
            </label>
          </div>
        </div>

        {/* Data Preview Table */}
        <div className="bg-gray-900/80 backdrop-blur rounded-xl shadow-lg overflow-hidden border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-gray-100">Expense Data Preview</h2>
            <p className="text-sm text-gray-400 mt-1">Showing {expenses.length} expenses</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{expense.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{expense.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">${expense.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{expense.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-200">
                        {expense.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-700 text-gray-200 rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-3 bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white rounded-md hover:from-black hover:to-gray-900 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export to {exportFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPreview;
