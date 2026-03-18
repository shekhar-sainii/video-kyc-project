module.exports = (resetLink) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 24px; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">
      
      <h2 style="color: #2c3e50;">Password Reset Request</h2>

      <p>We received a request to reset your account password.</p>

      <p>Please click the button below to set a new password:</p>

      <div style="margin: 20px 0;">
        <a href="${resetLink}"
           style="display:inline-block; padding:12px 24px; background-color:#f44336; 
                  color:#ffffff; text-decoration:none; border-radius:4px; font-weight:bold;">
          Reset Password
        </a>
      </div>

      <p><strong>Important:</strong> This password reset link will expire in 15 minutes for security reasons.</p>

      <p>If you did not request a password reset, please ignore this email. 
      Your account will remain secure and no changes will be made.</p>

      <p>For additional security, we recommend:</p>
      <ul>
        <li>Using a strong and unique password</li>
        <li>Not sharing your credentials with anyone</li>
        <li>Logging out from shared devices</li>
      </ul>

      <hr style="margin: 30px 0;" />

      <p style="font-size: 13px; color: #777;">
        If the button above does not work, copy and paste the following link into your browser:
        <br/>
        <span style="word-break: break-all;">${resetLink}</span>
      </p>

      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>Support Team</strong><br/>
        Available 24/7 for assistance
      </p>

    </div>
  `;
};