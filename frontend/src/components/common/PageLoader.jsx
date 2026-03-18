import React from "react";
import { useSelector } from "react-redux";

const PageLoader = ({ text = "Please wait..." }) => {
  const isDark = useSelector(
    (state) => state.theme.mode === "dark"
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center
        ${isDark ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"}
      `}
    >
      <div
        className={`w-14 h-14 rounded-full border-4 animate-spin mb-4
          ${isDark
            ? "border-gray-700 border-t-blue-500"
            : "border-gray-300 border-t-blue-600"}
        `}
      />
      <p className="text-sm font-medium opacity-70">
        {text}
      </p>
    </div>
  );
};

export default PageLoader;
