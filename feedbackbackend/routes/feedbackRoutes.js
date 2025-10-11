// import express from 'express'
// import { protect, authorizeRole } from '../middlewares/authMiddleware.js'
// import {
//   createTemplate,
//   scheduleFeedback,
//   closeFeedback,
//   getActiveFeedbacks,
//   submitFeedback
// } from '../controllers/feedbackController.js'

// const router = express.Router()


// router.post('/template', protect, authorizeRole(['admin']), createTemplate)


// router.post('/schedule', protect, authorizeRole(['teacher']), scheduleFeedback)
// router.put('/:scheduleId/close', protect, authorizeRole(['teacher']), closeFeedback)


// router.get('/student/active', protect, authorizeRole(['student']), getActiveFeedbacks)
// router.post('/:scheduleId/submit', protect, authorizeRole(['student']), submitFeedback)

// export default router

import express from 'express';
import {
  scheduleFeedback,
  getAllFeedbackSessions,
  closeFeedback,
  getActiveFeedbacks,
  submitFeedback,
  getFeedbackReport,getQuestionsForSchedule
} from '../controllers/feedbackController.js';
import { protect, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Teacher routes
router.post('/schedule', protect, authorizeRole(['teacher']), scheduleFeedback);
router.get('/sessions', protect, authorizeRole(['teacher']), getAllFeedbackSessions);
router.put('/:scheduleId/close', protect, authorizeRole(['teacher']), closeFeedback);

// Student routes
router.get('/student/active', protect, authorizeRole(['student']), getActiveFeedbacks);
router.post('/:scheduleId/submit', protect, authorizeRole(['student']), submitFeedback);
router.get('/reports/:scheduleId', protect, authorizeRole(['teacher']), getFeedbackReport);
router.get('/questions/:scheduleId', protect, authorizeRole(['student']), getQuestionsForSchedule);
export default router;
