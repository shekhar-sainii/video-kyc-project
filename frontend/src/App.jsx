import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useTheme from './hooks/useTheme';
import AppRoutes from './routes/AppRoutes';
// import { clearCart } from './features/cart/cartSlice';
// import { useEffect } from 'react';
// import socket from './socket/index';

const App = () => {
  const dispatch = useDispatch();
  
  // useEffect(() => {
  //   if (user?.id) {
  //     socket.connect();
  //     socket.emit('join', user.id);
  //   }

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, [user?.id]);

  useTheme();
  return <AppRoutes />;
};

export default App;
