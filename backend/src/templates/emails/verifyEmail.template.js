module.exports = (verificationLink) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 24px; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">
      
      <h2 style="color: #2c3e50;">Verify Your Email Address</h2>

      <p>Thank you for registering with us.</p>

      <p>To complete your account setup and start using our services, please verify your email address by clicking the button below:</p>

      <div style="margin: 20px 0;">
        <a href="${verificationLink}"
           style="display:inline-block; padding:12px 24px; background-color:#4CAF50; 
                  color:#ffffff; text-decoration:none; border-radius:4px; font-weight:bold;">
          Verify Email
        </a>
      </div>

      <p><strong>Important:</strong> This verification link will expire in 1 hour for security reasons.</p>

      <p>If you did not create an account with us, please ignore this email. No further action is required and your email address will not be registered.</p>

      <p>For your security:</p>
      <ul>
        <li>Do not share this verification link with anyone.</li>
        <li>Ensure you are accessing the link from a secure device.</li>
        <li>Contact support immediately if you notice any suspicious activity.</li>
      </ul>

      <hr style="margin: 30px 0;" />

      <p style="font-size: 13px; color: #777;">
        If the button above does not work, copy and paste the following link into your browser:
        <br/>
        <span style="word-break: break-all;">${verificationLink}</span>
      </p>

      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>Support Team</strong><br/>
        Available 24/7 for assistance
      </p>

    </div>
  `;
};