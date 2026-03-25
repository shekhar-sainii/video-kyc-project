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
      const { fullName, panNumber, signature } = req.body;
      const uploadedPhoto = req.file ? req.file.path : null;

      if (!uploadedPhoto) {
        throw new Error("Uploaded photo is required");
      }

      // PAN structure validation (4th & 5th char)
      const sanitizedPan = panNumber.toUpperCase();
      const fourthChar = sanitizedPan[3];
      const fifthChar = sanitizedPan[4];

      const VALID_TYPES = ["P", "C", "H", "A", "B", "G", "J", "L", "F", "T"];
      if (!VALID_TYPES.includes(fourthChar)) {
        throw new Error(`Invalid PAN type character: '${fourthChar}'. Suspicious card detected.`);
      }

      const nameParts = fullName.trim().split(/\s+/);
      let expectedInitial = "";
      
      if (fourthChar === "P") {
        // Individual: 5th char matches first letter of Surname (last word)
        const surname = nameParts[nameParts.length - 1];
        expectedInitial = surname ? surname[0].toUpperCase() : "";
      } else {
        // Company/Firm/etc: 5th char matches first letter of First Name
        expectedInitial = nameParts[0] ? nameParts[0][0].toUpperCase() : "";
      }

      if (fifthChar !== expectedInitial) {
        const errorMsg = fourthChar === "P" 
          ? `PAN 5th character mismatch. For Individuals, it must match your Surname initial ('${expectedInitial}').` 
          : `PAN 5th character mismatch. It must match your entity name initial ('${expectedInitial}').`;
        throw new Error(errorMsg);
      }

      const result = await kycService.submitKyc({
        userId: req.user.id,
        fullName,
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

      console.log(`[Controller] VerifyKYC - PAN: ${panCardImage}, Selfie: ${selfieImage}`);
      if (req.files?.panCardImage) {
        console.log(`[Controller] PAN File Size: ${req.files.panCardImage[0].size} bytes`);
      }

      if (!panCardImage || !selfieImage) {
        throw new Error("Required images missing");
      }

      const result = await kycService.verifyKyc(req.user.id, applicationId, {
        panCardImage,
        selfieImage,
      });

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
