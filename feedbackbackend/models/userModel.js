import { db } from './db.js'

export const createUser = async ({ firstName, lastName, email, password_hash, phoneNumber, role }) => {
  const [result] = await db.execute(
    `INSERT INTO users (firstName, lastName, email, password_hash, phoneNumber, role) VALUES (?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, email, password_hash, phoneNumber, role]
  )
  return result
}

export const getUserByEmail = async (email) => {
  const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email])
  return rows[0]
}

export const getUserById = async (user_id) => {
  const [rows] = await db.execute(`SELECT * FROM users WHERE user_id = ?`, [user_id])
  return rows[0]
}
