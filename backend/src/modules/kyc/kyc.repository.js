const BaseRepository = require("../../core/base.repository");
const KYCApplication = require("./kyc.model");

class KYCRepository extends BaseRepository {
  constructor() {
    super(KYCApplication);
  }

  async findByPanNumber(panNumber) {
    return await this.model.findOne({ panNumber });
  }

  async getAllApplications() {
    return await this.model.find().sort({ createdAt: -1 });
  }

  async getApplicationsByUser(userId) {
    return await this.model.find({ user: userId }).sort({ createdAt: -1 });
  }

  async getDashboardSummary() {
    const [totalApplicants, pendingReview, verifiedCount, rejectedCount] = await Promise.all([
      this.model.countDocuments(),
      this.model.countDocuments({ status: "Pending" }),
      this.model.countDocuments({ status: "Verified" }),
      this.model.countDocuments({ status: "Rejected" }),
    ]);

    return {
      totalApplicants,
      pendingReview,
      verifiedCount,
      rejectedCount,
    };
  }

  async getRecentApplications(limit = 6) {
    return await this.model
      .find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getApplicationsTrend(days = 7) {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));

    return await this.model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          apps: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);
  }

  async updateVerification(applicationId, verificationData) {
    return await this.model.findByIdAndUpdate(
      applicationId,
      verificationData,
      { returnDocument: "after" }
    );
  }

  async getPendingApplications() {
    return await this.model
      .find({ status: "Pending" })
      .populate("user", "name email")
      .sort({ createdAt: 1 });
  }

  async getPendingApplicationsPaginated({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.model
        .find({ status: "Pending" })
        .populate("user", "name email")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments({ status: "Pending" }),
    ]);

    return { applications, total };
  }

  async getApplicationForAdminById(applicationId) {
    return await this.model
      .findById(applicationId)
      .populate("user", "name email profileImage");
  }
}

module.exports = new KYCRepository();
