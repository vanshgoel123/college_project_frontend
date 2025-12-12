import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
    LayoutDashboard, BookOpen, Folders, Briefcase, FileBadge,
    LogOut, Settings, Shield, Moon, Sun
} from "lucide-react";

export default function Sidebar() {
    const { user, logout } = useAuth();


    const navItems = [
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "My Library", path: "/library", icon: <BookOpen size={20} /> },
        { name: "Collections", path: "/collections", icon: <Folders size={20} /> },
        { name: "Projects", path: "/projects", icon: <Briefcase size={20} /> },
        { name: "Patents", path: "/patents", icon: <FileBadge size={20} /> },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col justify-between shadow-sm z-20 transition-colors duration-200">

            {/* Top Section */}
            <div>
                <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
           <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
             <span className="text-blue-600 dark:text-blue-400">Research</span>OS
           </span>
                </div>

                <nav className="p-4 space-y-1">
                    {/* USER LINKS: Hide if Admin */}
                    {!user?.isAdmin && navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                }`
                            }
                        >
                            {item.icon}
                            {item.name}
                        </NavLink>
                    ))}

                    {/* ADMIN LINK: Show only if Admin */}
                    {user?.isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`
                            }
                        >
                            <Shield size={20} />
                            Admin Panel
                        </NavLink>
                    )}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1">

                

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`
                    }
                >
                    <Settings size={20} />
                    Settings
                </NavLink>

                <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>

                <div className="flex items-center gap-3 px-2 py-2">
                    <img
                        src={user?.avatar || "https://via.placeholder.com/40"}
                        alt="User"
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition p-1"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}