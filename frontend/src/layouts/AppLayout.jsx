import React from "react";
import PublicLayout from './PublicLayout';
import UserLayout from './UserLayout';
import AdminLayout from './AdminLayout';

const AppLayout = ({ layout = 'public', children }) => {
  switch (layout) {
    case 'admin':
      return <AdminLayout>{children}</AdminLayout>;

    case 'main': // USER SIDE (NO SIDEBAR)
      return <UserLayout>{children}</UserLayout>;

    case 'public':
    default:
      return <PublicLayout>{children}</PublicLayout>;
  }
};

export default AppLayout;
