import authAxios from "./axios/authAxios";

const kycService = {
  /**
   * Submit KYC Application Form
   * POST /api/kyc/submit
   * Body: multipart/form-data with panNumber, signature (base64), uploadedPhoto (file)
   */
  submitKyc(formData) {
    return authAxios.post("/kyc/submit", formData);
  },

  /**
   * Get all KYC applications for the current user
   * GET /api/kyc/applications
   */
  getApplications() {
    return authAxios.get("/kyc/applications");
  },

  /**
   * Verify KYC – send captured PAN card image + selfie to backend
   * POST /api/kyc/verify
   * Body: multipart/form-data with applicationId, panCardImage (file), selfieImage (file)
   */
  verifyKyc(formData) {
    return authAxios.post("/kyc/verify", formData, {
      timeout: 90000,
    });
  },

  getAdminDashboard() {
    return authAxios.get("/kyc/admin/dashboard");
  },

  getAdminQueue(params) {
    return authAxios.get("/kyc/admin/queue", { params });
  },

  getAdminApplicationDetail(id) {
    return authAxios.get(`/kyc/admin/application/${id}`);
  },
};

export default kycService;
