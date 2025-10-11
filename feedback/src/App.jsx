import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'

function App() {
  return (
    <AuthProvider >
      <BrowserRouter>
        <Navbar />
        <div className="container mt-4">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
