import express from 'express';
import { submitContactForm, getAllContactForms } from '../controllers/contactController.js';

const router = express.Router();

// POST: Submit contact form
router.post('/submit', submitContactForm);

// GET: Get all contact forms (admin only)
router.get('/all', getAllContactForms);

export default router;
