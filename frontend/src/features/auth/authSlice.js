import { createSlice } from '@reduxjs/toolkit';
import { clearTokens } from '../../utils/token';

const initialState = {
  isAuthenticated: false,
  user: null,
  role: null,
  isAuthChecked: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isAuthChecked = true;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.isAuthChecked = true;
      clearTokens();
    },
    authChecked(state) {
      state.isAuthChecked = true;
    },
  },
});

export const { loginSuccess, logout, authChecked } = authSlice.actions;
export default authSlice.reducer;
