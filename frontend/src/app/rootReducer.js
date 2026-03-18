import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'
import themeReducer from '../features/theme/themeSlice';



/**
 * Dummy reducer
 * (will be removed when real reducers are added)
 */
const dummyReducer = (state = {}) => state;

const rootReducer = combineReducers({
  // auth: authReducer,
  // user: userReducer,
  _app: dummyReducer,
  auth: authReducer,
  theme: themeReducer,
});

export default rootReducer;
