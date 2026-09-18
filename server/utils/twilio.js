// twilio.js
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendVerification = (phone) => {
  return client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
    .verifications.create({ to: phone, channel: 'sms' });
};

const checkVerification = (phone, code) => {
  return client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
    .verificationChecks.create({ to: phone, code });
};

module.exports = { sendVerification, checkVerification };
