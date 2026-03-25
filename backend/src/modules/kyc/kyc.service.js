const kycRepository = require("./kyc.repository");
const { compareFaces } = require("../../services/faceCompare.service");
const { extractPanNumber } = require("../../services/ocr.service");
const sendEmail = require("../../utils/sendEmail");
const kycStatusTemplate = require("../../templates/emails/kycStatus.template");
const logger = require("../../utils/logger");
const { StatusCodes } = require("http-status-codes")

const maskPan = (pan) =>
  pan.replace(/^(.{4}).*(.{2})$/, "$1••••$2");
const MAX_KYC_VERIFICATION_ATTEMPTS = 5;

const toErrorWithStatus = (error, fallbackMessage, fallbackStatusCode = 503) => {
  const wrappedError = new Error(error?.message || fallbackMessage);
  wrappedError.statusCode = error?.statusCode || fallbackStatusCode;
  wrappedError.cause = error;
  return wrappedError;
};

const getPanDistance = (left, right) => {
  if (!left || !right || left.length !== right.length) {
    return Number.POSITIVE_INFINITY;
  }

  let distance = 0;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      distance += 1;
    }
  }

  return distance;
};

class KYCService {
  async getAdminApplicationDetail(applicationId) {
    const application = await kycRepository.getApplicationForAdminById(applicationId);

    if (!application) {
      const error = new Error("Application not found");
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    }

    const submittedAt = application.submittedAt || application.createdAt;

    return {
      _id: application._id,
      applicant: {
        name: application.user?.name || "Unknown User",
        email: application.user?.email || "",
        profileImage: application.user?.profileImage || null,
      },
      panNumber: application.panNumber,
      submittedAt,
      status: application.status,
      uploadedPhoto: application.uploadedPhoto,
      selfieImage: application.selfieImage,
      panCardImage: application.panCardImage,
      signature: application.signature,
      faceMatch: application.faceMatch,
      panMatch: application.panMatch,
      verificationMessage: application.verificationMessage,
      faceMatchScore: application.faceMatchScore,
    };
  }

  async getAdminDashboard() {
    const summary = await kycRepository.getDashboardSummary();
    const recentApplications = await kycRepository.getRecentApplications(6);
    const trendRows = await kycRepository.getApplicationsTrend(7);

    const trendMap = new Map(
      trendRows.map((row) => [
        `${row._id.year}-${row._id.month}-${row._id.day}`,
        row.apps,
      ])
    );

    const trend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      return {
        name: date.toLocaleDateString("en-US", { weekday: "short" }),
        apps: trendMap.get(key) || 0,
      };
    });

    const totalReviewed = summary.verifiedCount + summary.rejectedCount;
    const verificationRate = summary.totalApplicants
      ? ((summary.verifiedCount / summary.totalApplicants) * 100).toFixed(1)
      : "0.0";
    const rejectionRate = totalReviewed
      ? ((summary.rejectedCount / totalReviewed) * 100).toFixed(1)
      : "0.0";

    const recentQueue = recentApplications.map((application) => ({
      id: application._id,
      name: application.user?.name || "Unknown User",
      email: application.user?.email || "",
      pan: maskPan(application.panNumber),
      panStatus: application.panMatch === null ? "Pending" : application.panMatch ? "Match" : "Mismatch",
      score: application.faceMatch === null ? "N/A" : application.faceMatch ? "100%" : "0%",
      status: application.status,
      submittedAt: application.submittedAt,
    }));

    return {
      summary: {
        totalApplicants: summary.totalApplicants,
        pendingReview: summary.pendingReview,
        verificationRate: `${verificationRate}%`,
        rejectionRate: `${rejectionRate}%`,
      },
      trend,
      recentQueue,
    };
  }

  async getAdminQueue({ page = 1, limit = 10 } = {}) {
    const { applications: pendingApplications, total } =
      await kycRepository.getPendingApplicationsPaginated({ page, limit });

    const queue = pendingApplications.map((application) => {
      const submittedAt = application.submittedAt || application.createdAt;
      const priority = (() => {
        const ageHours = (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60);

        if (ageHours >= 24) return "Critical";
        if (ageHours >= 8) return "High";
        if (ageHours >= 2) return "Medium";
        return "Low";
      })();

      return {
        _id: application._id,
        name: application.user?.name || "Unknown User",
        email: application.user?.email || "",
        pan: maskPan(application.panNumber),
        submittedAt,
        date: new Date(submittedAt).toLocaleDateString("en-CA"),
        time: new Date(submittedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        priority,
        score: application.faceMatch === null ? 50 : application.faceMatch ? 100 : 0,
      };
    });

    const criticalCount = queue.filter((item) => item.priority === "Critical").length;
    const highCount = queue.filter((item) => item.priority === "High").length;
    const averageReviewTime = queue.length
      ? `${(
        queue.reduce((sum, item) => {
          const ageMinutes = (Date.now() - new Date(item.submittedAt).getTime()) / (1000 * 60);
          return sum + ageMinutes;
        }, 0) / queue.length
      ).toFixed(1)}m`
      : "0.0m";

    return {
      queue,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary: {
        total,
        slaCompliance: total ? `${Math.max(0, 100 - Math.round((criticalCount / total) * 100))}%` : "100%",
        averageReviewTime,
        automationRate: total ? `${Math.max(0, 100 - Math.round((highCount / total) * 100))}%` : "100%",
      },
    };
  }

  async submitKyc({ userId, fullName, panNumber, signature, uploadedPhoto }) {
    try {
      const sanitizedPan = panNumber.toUpperCase();
      const existingApplication = await kycRepository.findByPanNumber(sanitizedPan);

      if (existingApplication) {
        throw new Error("KYC application already exists for this PAN number");
      }

      const application = await kycRepository.create({
        user: userId,
        fullName,
        panNumber: sanitizedPan,
        signature,
        uploadedPhoto,
      });
      return application;
    } catch (error) {
      throw error;
    }
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
      verificationAttempts: app.verificationAttempts || 0,
      maxVerificationAttempts: app.maxVerificationAttempts || MAX_KYC_VERIFICATION_ATTEMPTS,
      attemptsRemaining: Math.max(
        0,
        (app.maxVerificationAttempts || MAX_KYC_VERIFICATION_ATTEMPTS) - (app.verificationAttempts || 0)
      ),
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

    const currentAttempts = application.verificationAttempts || 0;
    const maxAttempts = application.maxVerificationAttempts || MAX_KYC_VERIFICATION_ATTEMPTS;

    if (application.status === "Verified") {
      const error = new Error("This application is already verified");
      error.statusCode = StatusCodes.BAD_REQUEST;
      throw error;
    }

    if (currentAttempts >= maxAttempts) {
      const error = new Error("Maximum verification attempts reached for this application");
      error.statusCode = StatusCodes.CONFLICT;
      throw error;
    }

    const [panExtractionResult, faceComparisonResult] = await Promise.allSettled([
      extractPanNumber(verificationData.panCardImage, application.panNumber),
      compareFaces(application.uploadedPhoto, verificationData.selfieImage),
    ]);

    if (panExtractionResult.status === "rejected" || faceComparisonResult.status === "rejected") {
      logger.error({
        message: "KYC verification dependency failed",
        applicationId,
        userId,
        panError:
          panExtractionResult.status === "rejected"
            ? panExtractionResult.reason?.message
            : null,
        faceError:
          faceComparisonResult.status === "rejected"
            ? faceComparisonResult.reason?.message
            : null,
      });

      if (
        panExtractionResult.status === "rejected" &&
        faceComparisonResult.status === "rejected"
      ) {
        const combinedError = new Error(
          "PAN extraction and face verification both failed. Please retry with a clearer PAN card and selfie."
        );
        combinedError.statusCode =
          panExtractionResult.reason?.statusCode ||
          faceComparisonResult.reason?.statusCode ||
          StatusCodes.SERVICE_UNAVAILABLE;
        throw combinedError;
      }

      if (panExtractionResult.status === "rejected") {
        throw toErrorWithStatus(
          panExtractionResult.reason,
          "PAN extraction failed. Please hold the PAN card clearly in better lighting."
        );
      }

      throw toErrorWithStatus(
        faceComparisonResult.reason,
        "Face verification failed. Please look directly into the camera and try again."
      );
    }

    const extractedPan = panExtractionResult.value;
    const faceMatchResult = faceComparisonResult.value;

    console.log(`[KYC] Verification result for ${applicationId}: PAN=${extractedPan || "FAILED"}, Face=${faceMatchResult.matched}`);

    if (!extractedPan) {
      const error = new Error(
        "PAN number could not be extracted. Please hold the PAN card closer and keep it steady."
      );
      error.statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
      throw error;
    }

    const normalizedExtractedPan = extractedPan.toUpperCase();
    const normalizedApplicationPan = application.panNumber.toUpperCase();
    const panDistance = getPanDistance(normalizedExtractedPan, normalizedApplicationPan);
    const panMatch = panDistance === 0;

    // Entity Type Validation (4th char)
    const extractedType = normalizedExtractedPan[3];
    const expectedType = normalizedApplicationPan[3];
    const typeMismatch = extractedType !== expectedType;

    const faceMatch = faceMatchResult.matched;
    const nextAttempts = currentAttempts + 1;
    const attemptsRemaining = Math.max(0, maxAttempts - nextAttempts);

    let status = "Pending";
    let verificationMessage = "";

    if (faceMatch && panMatch) {
      status = "Verified";
      verificationMessage = "KYC Verified Successfully";
    } else {
      let mismatchReason = "";

      if (!faceMatch && !panMatch) {
        mismatchReason = "Face mismatch and PAN mismatch";
      } else if (!faceMatch) {
        mismatchReason = "Face mismatch";
      } else {
        if (typeMismatch) {
          mismatchReason = `PAN entity type mismatch (Card is '${extractedType}', Application is '${expectedType}')`;
        } else {
          mismatchReason = "PAN number mismatch";
        }
        mismatchReason += normalizedExtractedPan ? ` (detected ${normalizedExtractedPan})` : "";
      }

      status = attemptsRemaining > 0 ? "Pending" : "Rejected";
      verificationMessage = attemptsRemaining > 0
        ? `${mismatchReason}. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining.`
        : `${mismatchReason}. Maximum verification attempts reached.`;
    }

    const updatedApplication = await kycRepository.updateVerification(applicationId, {
      panCardImage: verificationData.panCardImage,
      selfieImage: verificationData.selfieImage,
      faceMatch,
      faceMatchScore: faceMatchResult.score,
      panMatch,
      verificationAttempts: nextAttempts,
      maxVerificationAttempts: maxAttempts,
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
