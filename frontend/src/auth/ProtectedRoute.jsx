import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import usePermission from "../hooks/usePermission";
import Loader from "../components/common/Loader";

const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated, isAuthChecked } = useSelector(
    (state) => state.auth
  );

  const hasPermission = usePermission(permission);

  // WAIT until auth is restored
  if (!isAuthChecked) {
    return <Loader text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
