import axiosInstance from '../../services/axiosInstance';

const authService = {
  googleLogin(googleToken) {
    return axiosInstance.post('/auth/google', {
      token: googleToken,
    });
  },

  // 🔮 FUTURE
  sendOtp(email) {
    return axiosInstance.post('/auth/send-otp', { email });
  },

  verifyOtp(email, otp) {
    return axiosInstance.post('/auth/verify-otp', { email, otp });
  },
};

export default authService;
