import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_AUTH_CONFIG } from "../config/googleAuth";
import {
  authChecked,
  loginSuccess,
  logout,
} from "../features/auth/authSlice";
import authService from "../services/authService";
import { getAccessToken, getRefreshToken, setTokens } from "../utils/token";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        let accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (!accessToken && refreshToken) {
          const refreshResponse = await authService.refreshToken(refreshToken);
          const {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          } = refreshResponse.data.data;

          setTokens(newAccessToken, newRefreshToken);
          accessToken = newAccessToken;
        }

        if (!accessToken) {
          dispatch(authChecked());
          return;
        }

        const res = await authService.getMe();

        dispatch(
          loginSuccess({
            user: res.data.data,
            role: res.data.data.role,
          })
        );
      } catch (err) {
        dispatch(logout());
      } finally {
        dispatch(authChecked());
      }
    };

    restoreAuth();
  }, [dispatch]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_AUTH_CONFIG.clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

export default AuthProvider;
