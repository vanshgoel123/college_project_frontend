import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context & Auth
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Layouts
import Sidebar from "./components/layout/Sidebar";

// Pages
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library'; // <--- Added Library Import

// The "Shell" Layout (Sidebar + Content)
// This wraps pages that need the Sidebar
const AppLayout = ({ children }) => (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 transition-all">
            {children}
        </main>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                {/* Toast Notifications (Top Right) */}
                <Toaster position="top-right" />

                <Routes>
                    {/* --- PUBLIC ROUTES --- */}
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />

                    {/* --- PROTECTED ROUTES (Require Login) --- */}

                    {/* 1. Dashboard */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Dashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* 2. My Library */}
                    <Route path="/library" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Library />
                            </AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* 3. Future Pages (Placeholders so Sidebar links don't crash) */}
                    <Route path="/collections" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <div className="p-10 text-gray-500 text-center">Collections Page (Coming Soon)</div>
                            </AppLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/projects" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <div className="p-10 text-gray-500 text-center">Projects Page (Coming Soon)</div>
                            </AppLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/patents" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <div className="p-10 text-gray-500 text-center">Patents Page (Coming Soon)</div>
                            </AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* --- FALLBACK --- */}
                    {/* Redirect root to Dashboard (which will redirect to Login if not auth) */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* Catch-all: Redirect unknown URLs to Login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;