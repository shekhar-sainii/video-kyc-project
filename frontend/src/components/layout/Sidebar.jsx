import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { adminMenu } from "../../config/adminMenu";
import { filterMenuByRole } from "../../utils/menuUtils";

import {
  MdChevronLeft,
  MdChevronRight,
  MdExpandMore,
  MdExpandLess,
  MdClose,
} from 'react-icons/md';

const Sidebar = ({
  collapsed = false,
  setCollapsed = () => {},
  mobileOpen = false,
  setMobileOpen = () => {},
}) => {
  const role = useSelector((state) => state.auth.role);
  const theme = useSelector((state) => state.theme.mode);
  const isDark = theme === "dark";

  const location = useLocation();
  const menu = role ? filterMenuByRole(adminMenu, role) : adminMenu;
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r transition-all duration-300 ease-in-out lg:sticky
          ${collapsed ? "lg:w-20" : "lg:w-72"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isDark
            ? "bg-[#1a2b4b] border-gray-700 text-gray-200"
            : "bg-white border-gray-100 text-[#1a2b4b] shadow-sm"}
        `}
      >
      {/* --- 1. BRAND LOGO SECTION (Fixed) --- */}
      <div className="flex items-center justify-between px-4 py-5 sm:px-6 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
            F
            </div>
            <div className="flex flex-col">
              <h1 className={`text-xl font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#1a2b4b]'}`}>
                FinVerify
              </h1>
              <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500 mt-1">AI Admin</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(false)}
            className={`p-2 rounded-lg transition-all lg:hidden ${
              isDark ? "bg-gray-800 text-gray-300 hover:text-white" : "bg-slate-100 text-slate-600"
            }`}
            aria-label="Close menu"
          >
            <MdClose size={20} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden p-2 rounded-lg transition-all lg:block ${
              isDark ? "bg-gray-800 text-gray-400 hover:text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            } ${collapsed ? "mx-auto" : ""}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* --- 2. SCROLLABLE MENU LIST --- */}
      <nav className="flex-1 overflow-y-auto px-3 sm:px-4 space-y-1 custom-sidebar-scroll">
        {menu.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children?.length;
          const isItemActive = isActive(item.path);

          return (
            <div key={item.label} className="mb-1">
              {item.path ? (
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold
                    transition-all duration-200 group
                    ${isItemActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : isDark
                          ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                          : 'text-gray-600 hover:bg-blue-50/50 hover:text-blue-600'}
                  `}
                >
                  <Icon size={20} className={collapsed ? 'mx-auto' : ''} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ) : (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold
                    transition-all duration-200 group
                    ${isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-blue-50/50 hover:text-blue-600'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <Icon size={20} className={collapsed ? 'mx-auto' : ''} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && (openMenus[item.label] ? <MdExpandLess /> : <MdExpandMore />)}
                </button>
              )}

              {hasChildren && openMenus[item.label] && !collapsed && (
                <ul className="ml-9 mt-1 space-y-1 border-l border-blue-500/10">
                  {item.children.map((child) => (
                    <li key={child.path}>
                      <Link
                        to={child.path}
                        className={`block px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive(child.path) ? 'text-blue-500 bg-blue-500/5' : 'text-gray-500 hover:text-blue-500'
                        }`}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* --- 3. USER CONTEXT AREA (Fixed at bottom) --- */}
      <div className={`p-4 mt-auto border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'p-3 rounded-xl ' + (isDark ? 'bg-gray-800/40' : 'bg-gray-50')}`}>
          <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
            AD
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Administrator</p>
              <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-gray-700'}`}>System Manager</p>
            </div>
          )}
        </div>
      </div>

      {/* Styles for clean scrollbar */}
      <style jsx>{`
        .custom-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .custom-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
      `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
