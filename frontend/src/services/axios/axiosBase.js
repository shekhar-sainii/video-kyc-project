import axios from "axios";
import ENV from "../../config/env";
import {
  getAccessToken,
  getRefreshToken,
  clearTokens,
  setTokens,
} from "../../utils/token";

let refreshRequest = null;

const requestTokenRefresh = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    `${ENV.AUTH_SERVICE_URL}/auth/refresh-token`,
    { refreshToken }
  );

  const { accessToken, refreshToken: newRefresh } = response.data.data;

  setTokens(accessToken, newRefresh);

  return {
    accessToken,
    refreshToken: newRefresh,
  };
};

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
      const isRefreshCall = original?.url?.includes("/auth/refresh-token");

      /* ---------- AUTO REFRESH ---------- */
      if (error.response?.status === 401 && !original?._retry && !isRefreshCall) {
        original._retry = true;

        try {
          if (!refreshRequest) {
            refreshRequest = requestTokenRefresh().finally(() => {
              refreshRequest = null;
            });
          }

          const { accessToken } = await refreshRequest;
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
