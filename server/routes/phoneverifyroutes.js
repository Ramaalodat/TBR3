// server/routes/phoneverifyroutes.js
const express = require('express');
const router = express.Router();
const { sendVerification, checkVerification } = require('../utils/twilio');

// Test log
console.log('SendVerification:', sendVerification);

router.post('/send', async (req, res) => {
  const { phone } = req.body;

  try {
    const result = await sendVerification(phone);
    res.json({ success: true, status: result.status });
  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/check', async (req, res) => {
  const { phone, code } = req.body;

  try {
    const result = await checkVerification(phone, code);
    if (result.status === 'approved') {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Invalid code' });
    }
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
