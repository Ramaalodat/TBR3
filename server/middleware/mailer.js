require('dotenv').config();
console.log("mailer.js loaded"); //debuygging
const nodemailer = require('nodemailer'); //hello this is mavis, this is going to use nodemailer to send emails

const transporter = nodemailer.createTransport({ // this will make it get our gmail acc login from env to send emails from
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
});

(async () => {
    try {
        await transporter.verify(); //here will check our gmail acc and print if error or no
        console.log("login successss");
    } catch (err) {
        console.error("email verification fail :(", err);
    }
})();

async function sendemail(to, resetlink) { // send email function
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: '[TBR3] Account Password Reset',
        html: `
        <p>Dear User,</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <a href="${resetlink}">Reset Password</a>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('email sentt');
    } catch (error) {
        console.error('there was a problem sending email:', error);
    }
}
async function SendeCustomEmail(to,htmlmsg)
{
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: '[TBR3] Account Password Reset',
        html: htmlmsg
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('customer email sentt');
    } catch (error) {
        console.error('there was a problem sending customer email:', error);
    }
}


module.exports = {sendemail , SendeCustomEmail}; // export the function to use in other files!!
