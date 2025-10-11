import { db } from './db.js'

export const scheduleFeedback = async (template_id, batch_id, start_date, end_date, scheduled_by) => {
  const [result] = await db.execute(
    `INSERT INTO scheduled_feedbacks (template_id, batch_id, start_date, end_date, scheduled_by) VALUES (?, ?, ?, ?, ?)`,
    [template_id, batch_id, start_date, end_date, scheduled_by]
  )
  return result.insertId
}

export const closeFeedback = async (schedule_id) => {
  await db.execute(
    `UPDATE scheduled_feedbacks SET status='closed' WHERE schedule_id=?`,
    [schedule_id]
  )
}

export const getActiveFeedbacks = async () => {
  const [rows] = await db.execute(
    `SELECT sf.schedule_id, ft.template_name, sf.batch_id, sf.start_date, sf.end_date
     FROM scheduled_feedbacks sf
     JOIN feedback_templates ft ON sf.template_id = ft.template_id
     WHERE sf.status='active'`
  )
  return rows
}
