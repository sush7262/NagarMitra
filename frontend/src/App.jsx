import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import HomeFeed from './pages/HomeFeed'
import ReportIssue from './pages/ReportIssue'
import AnalyzeIssue from './pages/AnalyzeIssue'
import ConfirmIssue from './pages/ConfirmIssue'
import IssueDetail from './pages/IssueDetail'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes — require auth */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<HomeFeed />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/report/analyze" element={<AnalyzeIssue />} />
            <Route path="/report/confirm" element={<ConfirmIssue />} />
            <Route path="/issue/:id" element={<IssueDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
