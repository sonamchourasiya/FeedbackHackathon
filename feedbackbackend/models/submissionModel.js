import { db } from './db.js'

export const createSubmission = async (schedule_id, student_id, comments) => {
  const [result] = await db.execute(
    `INSERT INTO feedback_submissions (schedule_id, student_id, comments) VALUES (?, ?, ?)`,
    [schedule_id, student_id, comments]
  )
  return result.insertId
}

export const getSubmissionsBySchedule = async (schedule_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM feedback_submissions WHERE schedule_id = ?`,
    [schedule_id]
  )
  return rows
}
