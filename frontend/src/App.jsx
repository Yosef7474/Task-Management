import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { store } from './store/store'
import { AuthProvider } from './context/authContext'
import Layout from './components/common/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Index from './pages/Tasks/index'
import TaskDetail from './pages/Tasks/[id]'
import Users from './pages/Users'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import { useAuth } from './context/authContext'
import ActivityLog from './components/activities/ActivityLog'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />
}

// Role-based Route Component
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  return allowedRoles.includes(user.role) ? children : <Navigate to="/dashboard" />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      {/* Protected Routes with Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="activity" element={<ActivityLog/>}/>
        
        {/* Tasks Routes */}
        <Route path="tasks" element={<Index/>} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        
        {/* Admin/Manager Routes */}
        <Route path="users" element={
          <RoleRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <Users />
          </RoleRoute>
        } />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </Provider>
  )
}

export default App