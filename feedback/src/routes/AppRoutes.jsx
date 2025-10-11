import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Login from '../pages/Login'
import Register from '../pages/Register'
import AdminDashboard from '../pages/AdminDashboard'
import TeacherDashboard from '../pages/TeacherDashboard'
import FeedbackForm from '../pages/FeedbackForm'
import ReportView from '../pages/ReportView'
import ProtectedRoute from '../components/ProtectedRoute'

function PublicRoute({ children }) {
  const { user } = useContext(AuthContext)

  // Redirect based on role if already logged in
  if (user?.role === 'teacher') return <Navigate to="/teacher" replace />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  if (user?.role === 'student') return <Navigate to="/feedback" replace />

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute role="student">
            <FeedbackForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report/:scheduleId"
        element={
          <ProtectedRoute role="teacher">
            <ReportView />
          </ProtectedRoute>
        }
      />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes
