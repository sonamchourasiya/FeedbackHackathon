import { createUser, getUserByEmail } from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

// ---------------- REGISTER ----------------
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, role } = req.body

    // Check if email already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10)

    // Save user in DB
    await createUser({
      firstName,
      lastName,
      email,
      password_hash: hashedPassword, // must match DB column name
      phoneNumber,
      role: role || 'user', // default to 'user' if not provided
    })

    return res.status(201).json({ message: 'User registered successfully' })
  } catch (err) {
    console.error('❌ Registration Error:', err)
    return res.status(500).json({ message: 'Server error during registration' })
  }
}

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'defaultsecret', // fallback for safety
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )

    // Send response
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        firstName: user.firstName,
        role: user.role,
      },
      token,
    })
  } catch (err) {
    console.error('❌ Login Error:', err)
    return res.status(500).json({ message: 'Server error during login' })
  }
}
