const statusConfig = {
  Verified: {
    accent: "#16a34a",
    title: "KYC Verified Successfully",
    intro: "Your Video KYC verification has been completed successfully.",
    badge: "Verified",
  },
  Rejected: {
    accent: "#dc2626",
    title: "KYC Verification Failed",
    intro: "Your Video KYC verification could not be completed successfully.",
    badge: "Rejected",
  },
};

module.exports = ({ name, status, panNumberMasked, submittedAt, reason }) => {
  const config = statusConfig[status] || statusConfig.Rejected;
  const formattedDate = submittedAt
    ? new Date(submittedAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

  return `
    <div style="font-family: Arial, sans-serif; padding: 24px; line-height: 1.6; color: #1f2937; max-width: 620px; margin: auto; background: #f8fafc;">
      <div style="background: #ffffff; border-radius: 18px; padding: 32px; border: 1px solid #e5e7eb;">
        <div style="display: inline-block; padding: 6px 12px; border-radius: 999px; background: ${config.accent}15; color: ${config.accent}; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
          ${config.badge}
        </div>

        <h2 style="margin: 18px 0 10px; color: #111827; font-size: 28px;">
          ${config.title}
        </h2>

        <p style="margin: 0 0 18px; color: #4b5563;">
          Hello ${name || "User"},
        </p>

        <p style="margin: 0 0 22px; color: #4b5563;">
          ${config.intro}
        </p>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px 20px; margin-bottom: 22px;">
          <p style="margin: 0 0 8px;"><strong>PAN:</strong> ${panNumberMasked || "N/A"}</p>
          <p style="margin: 0 0 8px;"><strong>Submitted At:</strong> ${formattedDate}</p>
          <p style="margin: 0;"><strong>Verification Note:</strong> ${reason || "No additional details provided."}</p>
        </div>

        <p style="margin: 0; color: #4b5563;">
          If you believe this result is incorrect, please contact support or retry the KYC process from your dashboard.
        </p>

        <hr style="margin: 28px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          This is an automated message regarding your Video KYC status.
        </p>
      </div>
    </div>
  `;
};
