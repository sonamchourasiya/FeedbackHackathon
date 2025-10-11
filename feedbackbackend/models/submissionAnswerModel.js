import { db } from './db.js'

export const addSubmissionAnswers = async (submission_id, answers) => {
  for (const ans of answers) {
    await db.execute(
      `INSERT INTO submission_answers (submission_id, question_id, rating) VALUES (?, ?, ?)`,
      [submission_id, ans.question_id, ans.rating]
    )
  }
}

export const getAnswersBySchedule = async (schedule_id) => {
  const [rows] = await db.execute(
    `SELECT sa.*, fs.schedule_id
     FROM submission_answers sa
     JOIN feedback_submissions fs ON sa.submission_id = fs.submission_id
     WHERE fs.schedule_id = ?`,
    [schedule_id]
  )
  return rows
}
