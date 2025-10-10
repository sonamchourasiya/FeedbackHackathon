// import { db } from '../models/db.js'


// export const createTemplate = async (req, res) => {
//   try {
//     const { template_name, questions } = req.body

 
//     if (!template_name || !Array.isArray(questions) || questions.length < 5) {
//       return res
//         .status(400)
//         .json({ message: 'Template name and at least 5 questions are required' })
//     }

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: 'Unauthorized: User not found' })
//     }

 
//     const [result] = await db.execute(
//       `INSERT INTO feedback_templates (template_name, created_by) VALUES (?, ?)`,
//       [template_name, req.user.id]
//     )

//     const template_id = result.insertId

  
//     const questionValues = questions.map((q) => [template_id, q])
//     await db.query(
//       `INSERT INTO template_questions (template_id, question_text) VALUES ?`,
//       [questionValues]
//     )

//     res
//       .status(201)
//       .json({ message: 'Template created successfully', template_id })
//   } catch (err) {
//     console.error('❌ Error creating template:', err)
//     res
//       .status(500)
//       .json({ message: 'Error creating template', error: err.message })
//   }
// }


// export const scheduleFeedback = async (req, res) => {
//   try {
//     const { template_id, batch_id, start_date, end_date } = req.body

//     if (!template_id || !batch_id || !start_date || !end_date) {
//       return res.status(400).json({ message: 'All fields are required' })
//     }

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: 'Unauthorized: User not found' })
//     }

    
//     await db.execute(
//       `INSERT INTO scheduled_feedbacks 
//        (template_id, batch_id, start_date, end_date, scheduled_by, status) 
//        VALUES (?, ?, ?, ?, ?, 'active')`,
//       [template_id, batch_id, start_date, end_date, req.user.id]
//     )

//     res.status(201).json({ message: 'Feedback scheduled successfully' })
//   } catch (err) {
//     console.error('❌ Error scheduling feedback:', err)
//     res
//       .status(500)
//       .json({ message: 'Error scheduling feedback', error: err.message })
//   }
// }


// export const closeFeedback = async (req, res) => {
//   try {
//     const { scheduleId } = req.params

//     if (!scheduleId) {
//       return res.status(400).json({ message: 'Schedule ID is required' })
//     }

//     const [result] = await db.execute(
//       `UPDATE scheduled_feedbacks 
//        SET status='closed' 
//        WHERE schedule_id=? AND status='active'`,
//       [scheduleId]
//     )

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'No active feedback found to close' })
//     }

//     res.json({ message: 'Feedback closed successfully' })
//   } catch (err) {
//     console.error('❌ Error closing feedback:', err)
//     res
//       .status(500)
//       .json({ message: 'Error closing feedback', error: err.message })
//   }
// }


// export const getActiveFeedbacks = async (req, res) => {
//   try {
//     const [rows] = await db.execute(
//       `SELECT sf.schedule_id, ft.template_name, sf.batch_id, sf.start_date, sf.end_date
//        FROM scheduled_feedbacks sf
//        JOIN feedback_templates ft ON sf.template_id = ft.template_id
//        WHERE sf.status='active'`
//     )

//     res.json(rows)
//   } catch (err) {
//     console.error('❌ Error fetching active feedbacks:', err)
//     res.status(500).json({
//       message: 'Error fetching active feedbacks',
//       error: err.message,
//     })
//   }
// }


// export const submitFeedback = async (req, res) => {
//   try {
//     const { scheduleId } = req.params
//     const { answers, comments } = req.body

//     if (!scheduleId || !Array.isArray(answers) || answers.length === 0) {
//       return res
//         .status(400)
//         .json({ message: 'Schedule ID and answers are required' })
//     }

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: 'Unauthorized: User not found' })
//     }

    
//     const [result] = await db.execute(
//       `INSERT INTO feedback_submissions (schedule_id, student_id, comments) VALUES (?, ?, ?)`,
//       [scheduleId, req.user.id, comments || null]
//     )

//     const submission_id = result.insertId

   
//     const answerValues = answers.map((ans) => [
//       submission_id,
//       ans.question_id,
//       ans.rating,
//     ])
//     await db.query(
//       `INSERT INTO submission_answers (submission_id, question_id, rating) VALUES ?`,
//       [answerValues]
//     )

//     res.status(201).json({
//       message: 'Feedback submitted successfully',
//       submission_id,
//     })
//   } catch (err) {
//     console.error('❌ Error submitting feedback:', err)
//     res.status(500).json({
//       message: 'Error submitting feedback',
//       error: err.message,
//     })
//   }
// }


import { db } from '../models/db.js';

const RATING_LABELS = {
  4: 'Excellent',
  3: 'Good',
  2: 'Satisfactory',
  1: 'Poor'
};

// 📌 Get Questions for a specific schedule (Student)
export const getQuestionsForSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    if (!scheduleId) {
      return res.status(400).json({ message: 'scheduleId is required' });
    }

    // Get template_id for this schedule
    const [[schedule]] = await db.execute(
      `SELECT template_id FROM scheduled_feedbacks WHERE schedule_id = ? AND status='active'`,
      [scheduleId]
    );

    if (!schedule) {
      return res.status(404).json({ message: 'Feedback session not found or inactive' });
    }

    // Get questions from template
    const [questions] = await db.execute(
      `SELECT question_id, question_text 
       FROM template_questions 
       WHERE template_id = ?`,
      [schedule.template_id]
    );

    res.status(200).json(questions);
  } catch (err) {
    console.error('❌ Error fetching questions:', err);
    res.status(500).json({ message: 'Error fetching questions', error: err.message });
  }
};















/* ============================================================
   1️⃣ Create Template (Teacher)
============================================================ */
export const createTemplate = async (req, res) => {
  try {
    const { template_name, questions } = req.body;

    if (!template_name || !Array.isArray(questions) || questions.length < 5) {
      return res.status(400).json({
        message: 'Template name and at least 5 questions are required'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Insert template
    const [result] = await db.execute(
      `INSERT INTO feedback_templates (template_name, created_by) VALUES (?, ?)`,
      [template_name, req.user.id]
    );
    const template_id = result.insertId;

    // Insert questions
    const questionValues = questions.map(q => [template_id, q]);
    await db.query(
      `INSERT INTO template_questions (template_id, question_text) VALUES ?`,
      [questionValues]
    );

    res.status(201).json({ message: '✅ Template created successfully', template_id });
  } catch (err) {
    console.error('❌ Error creating template:', err);
    res.status(500).json({ message: 'Error creating template', error: err.message });
  }
};

/* ============================================================
   2️⃣ Schedule Feedback (Teacher)
============================================================ */
export const scheduleFeedback = async (req, res) => {
  try {
    const { template_id, batch_id, start_date, end_date } = req.body;

    if (!template_id || !batch_id || !start_date || !end_date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    await db.execute(
      `INSERT INTO scheduled_feedbacks
        (template_id, batch_id, start_date, end_date, scheduled_by, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [template_id, batch_id, start_date, end_date, req.user.id]
    );

    res.status(201).json({ message: '✅ Feedback scheduled successfully' });
  } catch (err) {
    console.error('❌ Error scheduling feedback:', err);
    res.status(500).json({ message: 'Error scheduling feedback', error: err.message });
  }
};

/* ============================================================
   3️⃣ Close Feedback (Teacher)
============================================================ */
export const closeFeedback = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const [[session]] = await db.execute(
      `SELECT * FROM scheduled_feedbacks WHERE schedule_id=?`,
      [scheduleId]
    );

    if (!session) return res.status(404).json({ message: 'Feedback session not found' });
    if (session.status === 'closed') return res.status(400).json({ message: 'Already closed' });

    const [result] = await db.execute(
      `UPDATE scheduled_feedbacks SET status='closed' WHERE schedule_id=?`,
      [scheduleId]
    );

    if (result.affectedRows === 0) return res.status(400).json({ message: 'Unable to close session' });

    res.json({ message: '✅ Feedback closed successfully', scheduleId });
  } catch (err) {
    console.error('❌ Error closing feedback:', err);
    res.status(500).json({ message: 'Error closing feedback', error: err.message });
  }
};

/* ============================================================
   4️⃣ Get All Feedback Sessions (Teacher)
============================================================ */
export const getAllFeedbackSessions = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        sf.schedule_id, 
        ft.template_name, 
        sf.batch_id, 
        sf.start_date, 
        sf.end_date, 
        sf.status
      FROM scheduled_feedbacks sf
      JOIN feedback_templates ft ON sf.template_id = ft.template_id
      ORDER BY sf.start_date DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Error fetching feedback sessions:', err);
    res.status(500).json({ message: 'Error fetching feedback sessions', error: err.message });
  }
};

/* ============================================================
   5️⃣ Get Active Feedbacks (Student)
============================================================ */
export const getActiveFeedbacks = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        sf.schedule_id,
        ft.template_name,
        sf.batch_id,
        sf.template_id,
        sf.start_date,
        sf.end_date
      FROM scheduled_feedbacks sf
      JOIN feedback_templates ft ON sf.template_id = ft.template_id
      WHERE sf.status='active'
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Error fetching active feedbacks:', err);
    res.status(500).json({ message: 'Error fetching active feedbacks', error: err.message });
  }
};

/* ============================================================
   6️⃣ Get Questions By Template (Student)
============================================================ */
export const getQuestionsByTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const [rows] = await db.execute(
      `SELECT question_id, question_text FROM template_questions WHERE template_id=?`,
      [templateId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Error fetching questions:', err);
    res.status(500).json({ message: 'Error fetching questions', error: err.message });
  }
};

/* ============================================================
   7️⃣ Submit Feedback (Student)
============================================================ */
export const submitFeedback = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { answers, comments } = req.body;

    if (!scheduleId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Schedule ID and answers are required' });
    }

    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized' });

    // Insert submission
    const [result] = await db.execute(
      `INSERT INTO feedback_submissions (schedule_id, student_id, comments) VALUES (?, ?, ?)`,
      [scheduleId, req.user.id, comments || null]
    );
    const submission_id = result.insertId;

    // Insert answers
    const answerValues = answers.map(a => [submission_id, a.question_id, a.rating]);
    await db.query(
      `INSERT INTO submission_answers (submission_id, question_id, rating) VALUES ?`,
      [answerValues]
    );

    res.status(201).json({ message: '✅ Feedback submitted successfully', submission_id });
  } catch (err) {
    console.error('❌ Error submitting feedback:', err);
    res.status(500).json({ message: 'Error submitting feedback', error: err.message });
  }
};

/* ============================================================
   8️⃣ Get Feedback Report (Teacher)
============================================================ */
export const getFeedbackReport = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    // Get all questions for this schedule
    const [questions] = await db.execute(`
      SELECT tq.question_id, tq.question_text
      FROM template_questions tq
      JOIN scheduled_feedbacks sf ON tq.template_id = sf.template_id
      WHERE sf.schedule_id = ?
    `, [scheduleId]);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this schedule' });
    }

    let totalSum = 0;
    let totalCount = 0;
    const report = [];

    for (const question of questions) {
      const [ratings] = await db.execute(`
        SELECT sa.rating, COUNT(*) AS count
        FROM submission_answers sa
        JOIN feedback_submissions fs ON sa.submission_id = fs.submission_id
        WHERE sa.question_id=? AND fs.schedule_id=?
        GROUP BY sa.rating
      `, [question.question_id, scheduleId]);

      const ratingCounts = { Excellent: 0, Good: 0, Satisfactory: 0, Poor: 0 };
      let questionSum = 0;
      let questionTotal = 0;

      ratings.forEach(r => {
        const label = RATING_LABELS[r.rating];
        if (label) {
          ratingCounts[label] = r.count;
          questionSum += r.rating * r.count;
          questionTotal += r.count;
        }
      });

      report.push({
        question_id: question.question_id,
        question_text: question.question_text,
        average_rating: questionTotal ? parseFloat((questionSum / questionTotal).toFixed(2)) : 0,
        rating_counts: ratingCounts
      });

      totalSum += questionSum;
      totalCount += questionTotal;
    }

    const finalAverage = totalCount ? parseFloat((totalSum / totalCount).toFixed(2)) : 0;

    res.json({ final_average: finalAverage, questions: report });
  } catch (err) {
    console.error('❌ Error fetching report:', err);
    res.status(500).json({ message: 'Error fetching report', error: err.message });
  }
};
