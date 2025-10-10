import { db } from '../models/db.js';

const RATING_LABELS = {
  4: 'Excellent',
  3: 'Good',
  2: 'Satisfactory',
  1: 'Poor'
};

export const getReport = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    if (!scheduleId) {
      return res.status(400).json({ message: 'scheduleId is required' });
    }

    // 1️⃣ Get all questions for this schedule
    const [questions] = await db.execute(
      `SELECT tq.question_id, tq.question_text
       FROM template_questions tq
       JOIN scheduled_feedbacks sf ON tq.template_id = sf.template_id
       WHERE sf.schedule_id = ?`,
      [scheduleId]
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this schedule' });
    }

    const report = [];
    let totalSum = 0;
    let totalCount = 0;

    // 2️⃣ For each question, get rating counts and average
    for (const question of questions) {
      const [ratings] = await db.execute(
        `SELECT sa.rating, COUNT(*) AS count
         FROM submission_answers sa
         JOIN feedback_submissions fs ON sa.submission_id = fs.submission_id
         WHERE sa.question_id = ? AND fs.schedule_id = ?
         GROUP BY sa.rating`,
        [question.question_id, scheduleId]
      );

      const ratingCounts = { Excellent: 0, Good: 0, Satisfactory: 0, Poor: 0 };
      let questionSum = 0;
      let questionTotal = 0;

      ratings.forEach((r) => {
        const label = RATING_LABELS[r.rating];
        if (label) {
          ratingCounts[label] = r.count;
          questionSum += r.rating * r.count;
          questionTotal += r.count;
        }
      });

      const averageRating = questionTotal ? questionSum / questionTotal : 0;

      totalSum += questionSum;
      totalCount += questionTotal;

      report.push({
        question_id: question.question_id,
        question_text: question.question_text,
        average_rating: parseFloat(averageRating.toFixed(2)),
        rating_counts: ratingCounts
      });
    }

    const finalAverage = totalCount ? parseFloat((totalSum / totalCount).toFixed(2)) : 0;

    res.json({
      final_average: finalAverage,
      questions: report
    });
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
