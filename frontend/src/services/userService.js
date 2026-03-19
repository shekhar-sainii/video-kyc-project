import authAxios from "./axios/authAxios";

const userService = {
  // ================= USER APIs =================

  /**
   * Get current logged in user profile
   * Route: GET /api/v1/users/me
   */
  getProfile() {
    return authAxios.get("/user/me");
  },

  /**
   * Update user profile (Name, etc.)
   * Route: PATCH /api/v1/users/update-profile
   */
  updateProfile(data) {
    return authAxios.patch("/user/update-profile", data);
  },

  /**
   * Change Password (while logged in)
   * Route: PATCH /api/v1/users/change-password
   */
  changePassword(data) {
    return authAxios.patch("/user/change-password", data);
  },

  /**
   * Delete own account
   * Route: DELETE /api/v1/users/delete-account
   */
  deleteAccount() {
    return authAxios.delete("/user/delete-account");
  },

  // ================= ADMIN APIs =================

  /**
   * Get list of all users (Admin only)
   * Route: GET /api/v1/users/admin/all-users
   */
  getAllUsers(params) {
    return authAxios.get("/user/admin/all-users", { params });
  },

  getSecurityLogs(params) {
    return authAxios.get("/user/admin/security-logs", { params });
  },

  /**
   * Deactivate a specific user
   * Route: PATCH /api/v1/users/admin/deactivate/:id
   */
  deactivateUser(userId) {
    return authAxios.patch(`/user/admin/deactivate/${userId}`);
  },

  /**
   * Activate a specific user
   * Route: PATCH /api/v1/users/admin/activate/:id
   */
  activateUser(userId) {
    return authAxios.patch(`/user/admin/activate/${userId}`);
  },

  // ================= ADDITIONAL (Context based) =================

  // Note: Aapke user.routes.js mein ye routes filhaal nahi hain, 
  // lekin agar aap order/payment modules use kar rahe hain toh ye wahan se aayenge:

  getMyPayments() {
    return authAxios.get("/payment/my-payments");
  },
};

export default userService;
