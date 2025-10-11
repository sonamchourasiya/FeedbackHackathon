import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

// ✅ Middleware to protect routes (verifies JWT)
export const protect = (req, res, next) => {
  try {
    // Ensure request object is valid
    if (!req || !req.headers) {
      console.error('Invalid request object:', req)
      return res.status(400).json({ message: 'Invalid request object' })
    }

    // ✅ Extract the Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' })
    }

    // ✅ Get the token part only
    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token missing' })
    }

    // ✅ Verify token with secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // attach decoded user (id, role, etc.) to request

    next() // move to next middleware or route handler
  } catch (err) {
    console.error('JWT Middleware Error:', err.message)
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' })
  }
}

// ✅ Middleware to authorize specific roles (e.g., admin, teacher)
export const authorizeRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access denied' })
    }
    next()
  }
}
