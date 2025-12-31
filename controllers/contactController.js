import ContactForm from '../models/ContactForm.js';

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;

    // Validation
    if (!name || !email || !phone || !company || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new contact form
    const newContact = new ContactForm({
      name,
      email,
      phone,
      company,
      message,
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
      data: newContact,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error submitting form. Please try again.',
      error: err.message,
    });
  }
};

// Get all contact forms (for admin)
export const getAllContactForms = async (req, res) => {
  try {
    const contacts = await ContactForm.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching forms',
      error: err.message,
    });
  }
};
