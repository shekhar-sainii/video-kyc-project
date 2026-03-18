import React from 'react';
import useTheme from './hooks/useTheme';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  
  useTheme();
  return <AppRoutes />;
};

export default App;
