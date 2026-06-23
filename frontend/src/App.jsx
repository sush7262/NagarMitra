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
import OfficerLogin from './pages/OfficerLogin'
import LanguageSelect from './pages/LanguageSelect'
import LocationRequest from './pages/LocationRequest'

const RequireLanguage = ({ children }) => {
  if (!localStorage.getItem('language')) {
    return <Navigate to="/language" replace />
  }
  return children
}

const RequireLocation = ({ children }) => {
  if (!localStorage.getItem('locationPermission')) {
    return <Navigate to="/location-permission" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Language Selection Route */}
          <Route path="/language" element={<LanguageSelect />} />

          {/* Public route */}
          <Route path="/login" element={
            <RequireLanguage>
              <Login />
            </RequireLanguage>
          } />
          <Route path="/officer-login" element={
            <RequireLanguage>
              <OfficerLogin />
            </RequireLanguage>
          } />

          {/* Location Request Route - Requires Login but NOT Location */}
          <Route path="/location-permission" element={
            <RequireLanguage>
              <PrivateRoute>
                <LocationRequest />
              </PrivateRoute>
            </RequireLanguage>
          } />

          {/* Protected routes — require auth AND location */}
          <Route
            element={
              <RequireLanguage>
                <RequireLocation>
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                </RequireLocation>
              </RequireLanguage>
            }
          >
            <Route index element={<HomeFeed />} />
            <Route path="/map" element={<HomeFeed />} />
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
