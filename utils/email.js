const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter, a service to send an email
  // const transporter = nodemailer.createTransport({
  //   service: 'Gmail',
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },

  // Activate in gmail 'less secure option' option to use gmail to send email

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Support @ <admin@na-tours.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3. Send email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
