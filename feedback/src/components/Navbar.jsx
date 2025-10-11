import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useContext(AuthContext)

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">OFS</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user?.role === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Admin</Link>
              </li>
            )}
            {user?.role === 'teacher' && (
              <li className="nav-item">
                <Link className="nav-link" to="/teacher">Teacher</Link>
              </li>
            )}
            {user?.role === 'student' && (
              <li className="nav-item">
                <Link className="nav-link" to="/feedback">Feedback</Link>
              </li>
            )}
          </ul>

          <div className="d-flex">
            {!user ? (
              <>
                <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
                <Link className="btn btn-outline-light" to="/register">Register</Link>
              </>
            ) : (
              <button className="btn btn-outline-light" onClick={logout}>Logout</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
