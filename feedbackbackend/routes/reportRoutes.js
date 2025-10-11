import express from 'express';
import { protect, authorizeRole } from '../middlewares/authMiddleware.js';
import { getReport } from '../controllers/reportController.js';

const router = express.Router();

// Teacher gets report by scheduleId
router.get(
  '/:scheduleId',
  protect,
  authorizeRole(['teacher']),
  getReport // ✅ Pass controller directly
);

export default router;
