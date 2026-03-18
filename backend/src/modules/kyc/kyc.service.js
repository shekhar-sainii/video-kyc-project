const kycRepository = require("./kyc.repository");
const { compareFaces } = require("../../services/faceCompare.service");
const sendEmail = require("../../utils/sendEmail");
const kycStatusTemplate = require("../../templates/emails/kycStatus.template");
const logger = require("../../utils/logger");

const maskPan = (pan) =>
  pan.replace(/^(.{4}).*(.{2})$/, "$1••••$2");

class KYCService {
  async getAdminApplicationDetail(applicationId) {
    const application = await kycRepository.getApplicationForAdminById(applicationId);

    if (!application) {
      const error = new Error("Application not found");
      error.statusCode = 404;
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
      faceMatchScore:
        application.faceMatch === null ? null : application.faceMatch ? 100 : 0,
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

  async getAdminQueue() {
    const pendingApplications = await kycRepository.getPendingApplications();

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

    const total = queue.length;
    const criticalCount = queue.filter((item) => item.priority === "Critical").length;
    const highCount = queue.filter((item) => item.priority === "High").length;
    const averageReviewTime = total
      ? `${(
          queue.reduce((sum, item) => {
            const ageMinutes = (Date.now() - new Date(item.submittedAt).getTime()) / (1000 * 60);
            return sum + ageMinutes;
          }, 0) / total
        ).toFixed(1)}m`
      : "0.0m";

    return {
      queue,
      summary: {
        total,
        slaCompliance: total ? `${Math.max(0, 100 - Math.round((criticalCount / total) * 100))}%` : "100%",
        averageReviewTime,
        automationRate: total ? `${Math.max(0, 100 - Math.round((highCount / total) * 100))}%` : "100%",
      },
    };
  }

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
