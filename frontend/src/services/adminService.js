import authAxios from "./axios/authAxios";

const adminService = {
  /* ================= USERS ================= */

  // pagination params support
  getAllUsers(params) {
    return authAxios.get("/admin", { params });
  },

  getUserById(id) {
    return authAxios.get(`/admin/${id}`);
  },

  changeUserRole(id, role) {
    return authAxios.patch(`/admin/${id}/role`, { role });
  },

  toggleBlock(id, isBlocked) {
    return authAxios.patch(`/admin/${id}/block`, { isBlocked });
  },

  deleteUser(id) {
    return authAxios.delete(`/admin/${id}`);
  },
};

export default adminService;
