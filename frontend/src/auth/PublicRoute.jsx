import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import BeautifulLoader from "../components/common/BeautifulLoader";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAuthChecked, role } = useSelector((state) => state.auth);

  if (!isAuthChecked) {
    return <BeautifulLoader text="Checking authentication..." />;
  }


  if (isAuthenticated) {
    return <Navigate to={role === "admin" ? "/admin" : "/"} replace />;
  }

  return children;
};

export default PublicRoute;
