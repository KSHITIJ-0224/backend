import express from 'express';
import { submitContactForm, getAllContactForms } from '../controllers/contactController.js';

const router = express.Router();

// GET: Health check
router.get('/', (req, res) => {
  res.json({ message: 'Contact API is running' });
});

// POST: Submit contact form
router.post('/submit', submitContactForm);

// GET: Get all contact forms (admin only)
router.get('/all', getAllContactForms);

export default router;
