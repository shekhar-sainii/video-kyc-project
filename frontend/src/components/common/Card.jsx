import React from "react";
export const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-700 
      bg-white dark:bg-gray-800 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "" }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};
