import Signup from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import Home from './pages/norm/Home'
import ExpenseForm from './pages/norm/ExpenseForm'
import ExpenseDetail from './pages/norm/ExpenseDetail'
import ExportPreview from './pages/norm/ExportPreview'
import Me from './pages/auth/Me'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-expense" element={<ExpenseForm />} />
          <Route path="/expense/:id" element={<ExpenseDetail />} />
          <Route path="/export" element={<ExportPreview />} />
          <Route path="/about-me" element={<Me />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App