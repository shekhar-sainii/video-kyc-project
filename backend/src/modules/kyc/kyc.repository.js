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

  async updateVerification(applicationId, verificationData) {
    return await this.model.findByIdAndUpdate(
      applicationId,
      verificationData,
      { new: true }
    );
  }

  async getPendingApplications() {
    return await this.model.find({ status: "Pending" });
  }
}

module.exports = new KYCRepository();