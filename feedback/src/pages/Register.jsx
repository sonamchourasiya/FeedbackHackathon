import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student', // default role
    phoneNumber: ''
  })
  const navigate = useNavigate()

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/auth/register', formData)
      alert('Registration successful! You can now login.')
      navigate('/login')
    } catch(err) {
      alert('Registration failed: ' + err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="col-md-5 offset-md-3 mt-5">
      <h3>Register</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>First Name</label>
          <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Last Name</label>
          <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Phone Number</label>
          <input type="text" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>Role</label>
          <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn btn-primary w-100" type="submit">Register</button>
      </form>
    </div>
  )
}

export default Register
