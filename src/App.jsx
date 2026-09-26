import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import { ToastProvider } from './components/Toast';
import Budgets from './pages/Budgets';
import Dashboard from './pages/Dashboard';
import EmailAlerts from './pages/EmailAlerts';
import ExpenseDetail from './pages/ExpenseDetail';
import ExpenseForm from './pages/ExpenseForm';
import Expenses from './pages/Expenses';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import QuickAdd from './pages/QuickAdd';
import Recurring from './pages/Recurring';
import SignUp from './pages/SignUp';
import Spinner from './components/Spinner';
import { loadChunk } from './lib/chunkReload';

// Charts and PDF export are heavy, so load them only when opened.
const Insights = lazy(() => loadChunk(() => import('./pages/Insights')));
const Export = lazy(() => loadChunk(() => import('./pages/Export')));

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/expenses/new" element={<ExpenseForm />} />
              <Route path="/quick-add" element={<QuickAdd />} />
              <Route path="/expenses/:id" element={<ExpenseDetail />} />
              <Route path="/expenses/:id/edit" element={<ExpenseForm />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/insights" element={<Suspense fallback={<Spinner />}><Insights /></Suspense>} />
              <Route path="/export" element={<Suspense fallback={<Spinner />}><Export /></Suspense>} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/recurring" element={<Recurring />} />
              <Route path="/email-alerts" element={<EmailAlerts />} />
              {/* Old links */}
              <Route path="/create-expense" element={<Navigate to="/expenses/new" replace />} />
              <Route path="/expense/:id" element={<LegacyExpense />} />
              <Route path="/about-me" element={<Navigate to="/profile" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function LegacyExpense() {
  const { id } = useParams();
  return <Navigate to={`/expenses/${id}`} replace />;
}
