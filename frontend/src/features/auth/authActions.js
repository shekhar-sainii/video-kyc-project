import { authStart, authSuccess, authFailure } from './authSlice';
import authService from './authService';

export const loginWithGoogle = (googleToken) => async (dispatch) => {
  try {
    dispatch(authStart());

    const res = await authService.googleLogin(googleToken);

    const { user, role, token } = res.data;

    localStorage.setItem('token', token);

    dispatch(
      authSuccess({
        user,
        role,
      })
    );
  } catch (err) {
    dispatch(authFailure('Google login failed'));
  }
};
