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

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      dispatch(authChecked());
      return;
    }

    const restoreAuth = async () => {
      try {
        const res = await authService.getMe();

        dispatch(
          loginSuccess({
            user: res.data.data,
            role: res.data.data.role,
          })
        );
      } catch (err) {
        // Token expired / invalid
        localStorage.removeItem("accessToken");
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