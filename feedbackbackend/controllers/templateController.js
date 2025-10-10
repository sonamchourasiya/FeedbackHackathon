// import { db } from '../models/db.js'

 
// export const createTemplate = async (req, res) => {
//   try {
//     const { template_name, questions } = req.body

   
//     if (!template_name || !Array.isArray(questions) || questions.length < 5) {
//       return res.status(400).json({
//         message: 'Template name and at least 5 questions are required',
//       })
//     }

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: 'Unauthorized: Missing user info' })
//     }

   
//     const [result] = await db.execute(
//       'INSERT INTO feedback_templates (template_name, created_by) VALUES (?, ?)',
//       [template_name, req.user.id]
//     )

//     const templateId = result.insertId

   
//     const filteredQuestions = questions
//       .map(q => q.trim())
//       .filter(q => q.length > 0)

 
//     const placeholders = filteredQuestions.map(() => '(?, ?)').join(', ')
//     const values = filteredQuestions.flatMap(q => [templateId, q])

//     await db.execute(
//       `INSERT INTO template_questions (template_id, question_text) VALUES ${placeholders}`,
//       values
//     )

//     return res.status(201).json({
//       message: 'Template created successfully',
//       template_id: templateId,
//       question_count: filteredQuestions.length,
//     })
//   } catch (err) {
//     console.error('❌ Error creating template:', err)
//     return res.status(500).json({
//       message: 'Error creating template',
//       error: err.message,
//     })
//   }
// }


// export const getTemplates = async (req, res) => {
//   try {
//     const [templates] = await db.execute(`
//       SELECT 
//         ft.template_id, 
//         ft.template_name, 
//         COUNT(tq.question_id) AS question_count
//       FROM feedback_templates ft
//       LEFT JOIN template_questions tq 
//         ON ft.template_id = tq.template_id
//       GROUP BY ft.template_id, ft.template_name
//       ORDER BY ft.template_id DESC
//     `)

//     const formatted = templates.map(t => ({
//       template_id: t.template_id,
//       template_name: t.template_name,
//       questions_count: t.question_count, // renamed field
//     }))

//     return res.status(200).json(formatted)
//   } catch (err) {
//     console.error('❌ Error fetching templates:', err)
//     return res.status(500).json({
//       message: 'Error fetching templates',
//       error: err.message,
//     })
//   }
// }





import { db } from '../models/db.js'

// ===============================
// Create Feedback Template (Admin)
// ===============================
export const createTemplate = async (req, res) => {
  try {
    const { template_name, questions } = req.body

    if (!template_name || !Array.isArray(questions) || questions.length < 5) {
      return res.status(400).json({
        message: 'Template name and at least 5 questions are required',
      })
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User not found' })
    }

    // Insert template
    const [result] = await db.execute(
      `INSERT INTO feedback_templates (template_name, created_by) VALUES (?, ?)`,
      [template_name, req.user.id]
    )
    const template_id = result.insertId

    // Insert questions
    const questionValues = questions.map((q) => [template_id, q])
    await db.query(
      `INSERT INTO template_questions (template_id, question_text) VALUES ?`,
      [questionValues]
    )

    res.status(201).json({
      message: 'Template created successfully',
      template_id,
      question_count: questions.length,
    })
  } catch (err) {
    console.error('❌ Error creating template:', err)
    res.status(500).json({ message: 'Error creating template', error: err.message })
  }
}

// ===============================
// Get All Templates (for Admin & Teacher dropdown)
// ===============================
export const getTemplates = async (req, res) => {
  try {
    const [templates] = await db.execute(`
      SELECT ft.template_id, ft.template_name, COUNT(tq.question_id) AS question_count
      FROM feedback_templates ft
      LEFT JOIN template_questions tq ON ft.template_id = tq.template_id
      GROUP BY ft.template_id, ft.template_name
      ORDER BY ft.template_id DESC
    `)
    res.json(templates)
  } catch (err) {
    console.error('❌ Error fetching templates:', err)
    res.status(500).json({ message: 'Error fetching templates', error: err.message })
  }
}

