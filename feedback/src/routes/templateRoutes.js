import express from 'express'
import { createTemplate, getTemplates } from '../controllers/templateController.js'
import { protect } from '../middlewares/authMiddleware.js'  // optional: JWT + admin check

const router = express.Router()

router.post('/', protect(['admin']), createTemplate)  // create template
router.get('/', protect(['admin']), getTemplates)     // get all templates

export default router
