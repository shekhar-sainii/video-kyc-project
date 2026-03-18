import axios from "axios";
import ENV from "../../config/env";
import {
  getAccessToken,
  clearTokens,
  setTokens,
} from "../../utils/token";

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  /* ================= REQUEST ================= */
  instance.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  });

  /* ================= RESPONSE (refresh + errors) ================= */
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;

      /* ---------- AUTO REFRESH ---------- */
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");

          const res = await axios.post(
            `${ENV.AUTH_SERVICE_URL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefresh } =
            res.data.data;

          setTokens(accessToken, newRefresh);

          original.headers.Authorization = `Bearer ${accessToken}`;

          return instance(original);
        } catch {
          clearTokens();
          window.location.href = "/login";
        }
      }

      /* ---------- OTHER ERRORS ---------- */
      if (error.response?.status >= 500) {
        console.error("Server error");
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export default createAxiosInstance;
