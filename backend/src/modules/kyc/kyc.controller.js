const { extractPanNumber } = require("../../services/ocr.service");
const kycService = require("./kyc.service");

class KYCController {
  async submitKyc(req, res, next) {
    try {
      const { panNumber, signature } = req.body;

      const uploadedPhoto = req.file ? req.file.path : null;

      if (!uploadedPhoto) {
        throw new Error("Uploaded photo is required");
      }

      const result = await kycService.submitKyc({
        panNumber,
        signature,
        uploadedPhoto,
      });

      return res.status(201).json({
        success: true,
        message: "KYC submitted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getApplications(req, res, next) {
    try {
      const applications = await kycService.getApplications();

      return res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyKyc(req, res, next) {
    try {
      const { applicationId } = req.body;

      const panCardImage = req.files?.panCardImage
        ? req.files.panCardImage[0].path
        : null;

      const selfieImage = req.files?.selfieImage
        ? req.files.selfieImage[0].path
        : null;

      if (!panCardImage || !selfieImage) {
        throw new Error("Required images missing");
      }

      const extractedPan = await extractPanNumber(panCardImage);

      const result = await kycService.verifyKyc(applicationId, {
        extractedPan,
        panCardImage,
        selfieImage,
      });

      return res.status(200).json({
        success: true,
        message: "Verification completed",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new KYCController();