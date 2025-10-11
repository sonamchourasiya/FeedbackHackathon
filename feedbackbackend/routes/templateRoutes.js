import express from 'express'
import { createTemplate, getTemplates } from '../controllers/templateController.js'
import { protect, authorizeRole } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Admin creates template
router.post('/', protect, authorizeRole(['admin']), createTemplate)

// Admin & Teacher fetch templates
router.get('/', protect, authorizeRole(['admin','teacher']), getTemplates)

export default router
