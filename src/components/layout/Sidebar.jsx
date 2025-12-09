import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard, BookOpen, Folders, Briefcase, FileBadge,
    LogOut, Settings, Shield
} from "lucide-react";

export default function Sidebar() {
    const { user, logout } = useAuth();

    // Standard links for Professors/Regular Users
    const userNavItems = [
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "My Library", path: "/library", icon: <BookOpen size={20} /> },
        { name: "Collections", path: "/collections", icon: <Folders size={20} /> },
        { name: "Projects", path: "/projects", icon: <Briefcase size={20} /> },
        { name: "Patents", path: "/patents", icon: <FileBadge size={20} /> },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col justify-between shadow-sm z-20">

            {/* Top Section */}
            <div>
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
           <span className="text-xl font-bold text-gray-800 tracking-tight">
             <span className="text-orange-600">C</span><span className="text-blue-600">H</span><span className="text-green-600">A</span><span className="text-red-600">C</span><span className="text-black">H</span><span className="text-black">A</span>
           </span>
                </div>

                <nav className="p-4 space-y-1">

                    {/* CONDITIONAL RENDERING: Only show user links if NOT admin */}
                    {!user?.isAdmin && userNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`
                            }
                        >
                            {item.icon}
                            {item.name}
                        </NavLink>
                    ))}

                    {/* Admin Link (Only for Admin) */}
                    {user?.isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    isActive ? "bg-purple-50 text-purple-600" : "text-gray-600 hover:bg-gray-50"
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
            <div className="p-4 border-t border-gray-100 space-y-1">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                        }`
                    }
                >
                    <Settings size={20} />
                    Settings
                </NavLink>

                <div className="my-2 border-t border-gray-100"></div>

                <div className="flex items-center gap-3 px-2 py-2">
                    <img
                        src={user?.avatar || "https://via.placeholder.com/40"}
                        alt="User"
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}