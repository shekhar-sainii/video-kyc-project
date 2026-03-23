const kycService = require("./kyc.service");
const {StatusCodes} = require("http-status-codes")

class KYCController {
  async getAdminApplicationDetail(req, res, next) {
    try {
      const data = await kycService.getAdminApplicationDetail(req.params.id);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "KYC application detail fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminQueue(req, res, next) {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 1000);
      const data = await kycService.getAdminQueue({ page, limit });

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Admin queue fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminDashboard(req, res, next) {
    try {
      const data = await kycService.getAdminDashboard();

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Admin dashboard fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitKyc(req, res, next) {
    try {
      const { panNumber, signature } = req.body;
      const uploadedPhoto = req.file ? req.file.path : null;
      if (!uploadedPhoto) {
        throw new Error("Uploaded photo is required");
      }

      const result = await kycService.submitKyc({
        userId: req.user.id,
        panNumber,
        signature,
        uploadedPhoto,
      });

      return res.status(StatusCodes.CREATED).json({
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
      const applications = await kycService.getApplications(req.user.id);

      return res.status(StatusCodes.OK).json({
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

      const result = await kycService.verifyKyc(req.user.id, applicationId, {
        panCardImage,
        selfieImage,
      });

      console.log(result);
      
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Verification completed",
        data: {
          applicationId: result._id,
          faceMatch: result.faceMatch,
          faceMatchScore: result.faceMatchScore,
          panMatch: result.panMatch,
          status: result.status,
          verificationMessage: result.verificationMessage,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new KYCController();
