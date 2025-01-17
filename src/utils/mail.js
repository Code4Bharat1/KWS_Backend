import nodemailer from "nodemailer";

export const sendApprovalEmail = async (email, username) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Membership Approved - Your KWS Account Details',
      text: `Dear User,

Your membership has been approved.

Username: ${username}

Please keep these credentials secure.

Thank you,
KWS Team`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    // console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send approval email.');
  }
};
