import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import StatementImport from './pages/StatementImport'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to auth page */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        
        <Route path="/auth" element={<AuthPage />} />
        
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="import" element={<StatementImport />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
