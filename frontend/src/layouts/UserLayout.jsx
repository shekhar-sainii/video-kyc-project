import React from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
// import Header from "../components/layout/Header";

const UserLayout = ({ children }) => {
  const isDark = useSelector(
    (state) => state.theme.mode === "dark"
  );

  return (
    <div
      className={`min-h-screen flex flex-col
        ${isDark ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-900"}
      `}
    >
      <Navbar />
      {/* <Header /> */}

      <main className="flex-1 pt-1">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default UserLayout;
