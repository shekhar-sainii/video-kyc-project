import React from "react";
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar */}
      {/* <Sidebar /> */}

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        <Navbar />
        <main style={{ padding: 20 }}>
          {children}
        </main>
      </div>

    </div>
  );
};

export default MainLayout;
