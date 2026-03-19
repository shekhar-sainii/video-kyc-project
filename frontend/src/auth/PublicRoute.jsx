import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../components/common/Loader";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAuthChecked, role } = useSelector((state) => state.auth);

  if (!isAuthChecked) {
    return <Loader text="Checking authentication..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={role === "admin" ? "/admin" : "/"} replace />;
  }

  return children;
};

export default PublicRoute;
