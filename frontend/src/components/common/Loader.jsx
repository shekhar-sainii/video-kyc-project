import React from "react";
import { useSelector } from "react-redux";

const Loader = ({ text = "Loading..." }) => {
  const isDark = useSelector(
    (state) => state.theme.mode === "dark"
  );

  return (
    <div
      className={`w-full flex flex-col items-center justify-center gap-4 py-10
        ${isDark ? "text-gray-200" : "text-gray-800"}
      `}
    >
      {/* SPINNER */}
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full border-4 animate-spin
            ${isDark
              ? "border-gray-700 border-t-blue-500"
              : "border-gray-300 border-t-blue-600"}
          `}
        />
      </div>

      {/* TEXT */}
      <p
        className={`text-sm font-medium tracking-wide
          ${isDark ? "text-gray-400" : "text-gray-500"}
        `}
      >
        {text}
      </p>
    </div>
  );
};

export default Loader;
