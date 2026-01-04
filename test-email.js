import { sendContactEmails } from './utils/Email.js';

const sample = {
  name: 'Test User',
  email: 'youremail@example.com',
  phone: '0000000000',
  company: 'Local Test Co',
  message: 'This is a test message from test-email.js'
};

(async () => {
  try {
    console.log('Running contact email test...');
    const result = await sendContactEmails(sample);
    console.log('Test result:', result);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
