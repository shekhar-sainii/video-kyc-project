import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
} from "react-icons/fi";

const Header = () => {
  const theme = useSelector((state) => state.theme.mode);
  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-50 border-b ${
        isDark
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-200 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">

        {/* 🔹 Logo */}
        <Link to="/" className="text-2xl font-bold">
          Shop<span className="text-green-600">X</span>
        </Link>

        {/* 🔹 Search */}
        <div className="flex-1 hidden md:flex">
          <div className="relative w-full max-w-xl">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, brands and more..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  : "bg-gray-50 border-gray-300 text-black placeholder-gray-500"
              }`}
            />
          </div>
        </div>

        {/* 🔹 Actions */}
        <div className="flex items-center gap-5">

          {/* Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-1 text-sm font-medium"
          >
            <FiUser size={20} />
            <span className="hidden sm:block">Account</span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-1 text-sm font-medium"
          >
            <FiShoppingCart size={22} />
            <span className="hidden sm:block">Cart</span>

            {/* Badge */}
            <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-1">
              2
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
