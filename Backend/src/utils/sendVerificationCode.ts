import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_GMAIL,
    pass: process.env.GOOGLE_GMAIL_PASSWORD,
  },
})

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
) {
  try {
    const mailOptions = {
      from: process.env.GOOGLE_GMAIL,
      to: email,
      subject: "Project Management verfication code",
      text: `you verification code is ${verifyCode}`,
      html: `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email address</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
      }
      .heading {
        font-size: 24px;
        margin-bottom: 20px;
      }
      .verification-code {
        font-size: 20px;
        font-weight: bold;
        margin: 20px 0;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        color: #fff;
        background-color: #007bff;
        border-radius: 5px;
        text-decoration: none;
        margin-top: 20px;
      }
      .footer {
        margin-top: 20px;
        font-size: 14px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="heading">Thank you for joining, ${username}!</h1>
      <p>We're excited to have you on board. To get started, please verify your email address by using the verification code below:</p>
      <p class="verification-code">${verifyCode}</p>
      <p>If you did not sign up for this account, you can ignore this email.</p>
      <div class="footer">
        <p>Best regards,<br>The Project Management Team</p>
      </div>
    </div>
  </body>
</html>`,
    }

    const info = await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.log("Error while sending verification email", error)
    return false
  }
}
