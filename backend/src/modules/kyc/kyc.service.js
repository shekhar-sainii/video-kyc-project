const kycRepository = require("./kyc.repository");
const { compareFaces } = require("../../services/faceCompare.service");
const sendEmail = require("../../utils/sendEmail");
const kycStatusTemplate = require("../../templates/emails/kycStatus.template");
const logger = require("../../utils/logger");

const maskPan = (pan) =>
  pan.replace(/^(.{4}).*(.{2})$/, "$1••••$2");

class KYCService {
  async submitKyc(data) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!panRegex.test(data.panNumber)) {
      throw new Error("Invalid PAN format");
    }

    const existingApplication = await kycRepository.findByPanNumber(
      data.panNumber
    );

    if (existingApplication) {
      throw new Error("KYC application already exists for this PAN number");
    }

    return await kycRepository.create({
      user: data.userId,
      panNumber: data.panNumber,
      signature: data.signature,
      uploadedPhoto: data.uploadedPhoto,
    });
  }

  async getApplications(userId) {
    const applications = userId
      ? await kycRepository.getApplicationsByUser(userId)
      : await kycRepository.getAllApplications();

    return applications.map((app) => ({
      _id: app._id,
      panNumber: maskPan(app.panNumber),
      status: app.status,
      submittedAt: app.submittedAt,
    }));
  }

  async verifyKyc(userId, applicationId, verificationData) {
    const application = await kycRepository.findById(applicationId, "user");

    if (!application) {
      throw new Error("Application not found");
    }

    if (application.user?._id && application.user._id.toString() !== userId.toString()) {
      const error = new Error("You are not authorized to verify this application");
      error.statusCode = 403;
      throw error;
    }

    const panMatch =
      verificationData.extractedPan &&
      verificationData.extractedPan.toUpperCase() ===
      application.panNumber.toUpperCase();

    let faceMatch;

    try {
      faceMatch = await compareFaces(
        application.uploadedPhoto,
        verificationData.selfieImage
      );
    } catch (error) {
      error.statusCode = error.statusCode || 503;
      throw error;
    }

    let status = "Rejected";
    let verificationMessage = "";

    if (faceMatch && panMatch) {
      status = "Verified";
      verificationMessage = "KYC Verified Successfully";
    } else if (!faceMatch && !panMatch) {
      verificationMessage = "Face mismatch and PAN mismatch";
    } else if (!faceMatch) {
      verificationMessage = "Face mismatch";
    } else {
      verificationMessage = "PAN mismatch";
    }

    const updatedApplication = await kycRepository.updateVerification(applicationId, {
      panCardImage: verificationData.panCardImage,
      selfieImage: verificationData.selfieImage,
      faceMatch,
      panMatch,
      status,
      verificationMessage,
    });

    if (application.user?.email) {
      try {
        await sendEmail({
          to: application.user.email,
          subject:
            status === "Verified"
              ? "Your Video KYC Has Been Verified"
              : "Your Video KYC Verification Failed",
          html: kycStatusTemplate({
            name: application.user.name,
            status,
            panNumberMasked: maskPan(application.panNumber),
            submittedAt: application.submittedAt,
            reason: verificationMessage,
          }),
        });
      } catch (emailError) {
        logger.error({
          message: "Failed to send KYC status email",
          applicationId,
          userId: application.user._id,
          email: application.user.email,
          error: emailError.message,
          stack: emailError.stack,
        });
      }
    }

    return updatedApplication;
  }
}

module.exports = new KYCService();
