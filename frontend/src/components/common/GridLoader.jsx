import React from "react";
const GridLoader = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-72 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
        />
      ))}
    </div>
  );
};

export default GridLoader;