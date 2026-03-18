const kycRepository = require("./kyc.repository");
const { compareFaces } = require("../../services/faceCompare.service");

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
      panNumber: data.panNumber,
      signature: data.signature,
      uploadedPhoto: data.uploadedPhoto,
    });
  }

  async getApplications() {
    const applications = await kycRepository.getAllApplications();

    return applications.map((app) => ({
      ...app._doc,
      panNumber: maskPan(app.panNumber),
    }));
  }

  async verifyKyc(applicationId, verificationData) {
    const application = await kycRepository.findById(applicationId);

    if (!application) {
      throw new Error("Application not found");
    }

    const panMatch =
      verificationData.extractedPan &&
      verificationData.extractedPan.toUpperCase() ===
        application.panNumber.toUpperCase();

    const faceMatch = await compareFaces(
      application.uploadedPhoto,
      verificationData.selfieImage
    );

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

    return await kycRepository.updateVerification(applicationId, {
      panCardImage: verificationData.panCardImage,
      selfieImage: verificationData.selfieImage,
      faceMatch,
      panMatch,
      status,
      verificationMessage,
    });
  }
}

module.exports = new KYCService();