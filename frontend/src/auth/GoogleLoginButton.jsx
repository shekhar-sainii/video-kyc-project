import React from "react";
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../features/auth/authSlice';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import Swal from 'sweetalert2';
// 1. Correct Utility Import (Apne folder path ke hisaab se check karein)
import { setTokens } from "../utils/token"; 

const GoogleLoginButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // ERROR FIX: Is state ki zaroorat nahi hai, ye utility function 'setTokens' ko overwrite kar raha tha
  // const [tokens, setTokens] = useState(false); 

  const role = useSelector((state) => state.auth.role);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isDark = useSelector((state) => state.theme.mode === 'dark');

  const handleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const id_token = credentialResponse.credential;

      // Backend API call
      const res = await authService.googleLogin(id_token);
      
      // Data extraction
      const { user, accessToken, refreshToken } = res.data.data;

      // 2. Calling the UTILITY function (not state)
      // Ye aapke localStorage/cookies mein tokens set kar dega
      setTokens(accessToken, refreshToken, user.role);

      // 3. Update Redux Store
      dispatch(
        loginSuccess({
          user,
          role: user.role,
        })
      );
      
      // Success Feedback
      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: `Logged in as ${user.name}`,
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? '#1a2b4b' : '#fff',
        color: isDark ? '#fff' : '#1a2b4b',
      });

    } catch (err) {
      console.error("Google Auth Error", err);
      Swal.fire({ 
        icon: 'error', 
        title: 'Login Failed', 
        text: err.response?.data?.message || 'Google authentication failed.',
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !role) return;

    // Redirect based on role
    if (role === 'admin' || role === 'manager') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="w-full flex justify-center">
      {loading ? (
        <div
          className={`w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border-2 animate-pulse
            ${isDark
              ? 'bg-slate-800 border-slate-700 text-slate-200'
              : 'bg-slate-50 border-slate-100 text-slate-700'}
          `}
        >
          <FcGoogle className="text-xl animate-spin" />
          <span className="text-sm font-bold uppercase tracking-widest">Verifying Identity...</span>
        </div>
      ) : (
        <div className="w-full overflow-hidden flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Google Login Popup Closed' });
            }}
            theme={isDark ? 'filled_black' : 'outline'}
            size="large"
            shape="pill"
            width="350px" // Fixed width for better UI
            text="continue_with"
          />
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
