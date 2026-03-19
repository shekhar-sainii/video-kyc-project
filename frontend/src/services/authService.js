import authAxios from './axios/authAxios';

const authService = {
  // Google Login implementation
  googleLogin(id_token) {
    return authAxios.get('/auth/google/callback', {
      // Backend expects passport user or token logic
      params: { token: id_token } 
    });
  },

  login(data) {
    return authAxios.post('/auth/login', data);
  },

  refreshToken(refreshToken) {
    return authAxios.post('/auth/refresh-token', { refreshToken });
  },

  register(data) {
    // Backend path: /api/v1/auth/register
    return authAxios.post('/auth/register', data);
  },

  forgotPassword(email) {
    return authAxios.post('/auth/forgot-password', { email });
  },

  resetPassword(data) {
    // Backend expects { token, password } in body
    return authAxios.post('/auth/reset-password', data);
  },

  getMe() {
    // Backend usually has this under /user/me or similar based on your v1 routes
    return authAxios.get('/user/me'); 
  },

  // Email verification route
  verifyEmail(token) {
    return authAxios.get(`/auth/verify-email?token=${token}`);
  },

  resendVerification(email) {
    return authAxios.post("/auth/resend-verification", { email });
  },

  logout(refreshToken) {
    return authAxios.post('/auth/logout', { refreshToken });
  }
};

export default authService;
