import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password); // data is res.data

      if (data.token) {
        // Store token and user info in sessionStorage
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('firstName', data.firstName);
        sessionStorage.setItem('lastName', data.lastName);

        // Update AuthContext
        login(data.user, data.token);

        // Navigate to dashboard (change as per your app)
        navigate('/admin'); // or /teacher based on role
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <div className="col-md-4 offset-md-4 mt-5">
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}

export default Login;
