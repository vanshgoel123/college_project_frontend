import React, { useState } from "react";
import { userAPI } from "../../api/user";
import {
    X,
    FileText,
    Download,
    Loader2,
    CheckSquare,
    Square
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReportModal({ isOpen, onClose, onGenerated }) {
    const [loading, setLoading] = useState(false);

    // Default field selections
    const [options, setOptions] = useState({
        title: true,
        authors: true,
        tag: false,
        publishedBy: true,
        publishedDate: true,
        citedBy: false,
    });

    if (!isOpen) return null;

    const toggleOption = (key) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // Call POST /users/report
            const response = await userAPI.generateReport(options);

            // Create blob URL
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;

            // File name
            link.download = `Research_Report_${new Date()
                .toISOString()
                .split("T")[0]}.docx`;

            document.body.appendChild(link);
            link.click();

            window.URL.revokeObjectURL(url);
            link.remove();

            // Success toast
            toast.success("Report downloaded successfully!");

            // Notify Dashboard for "last generated" timestamp
            if (onGenerated) onGenerated();

            onClose();
        } catch (err) {
            console.error(err);
            toast.error(
                err.response?.data?.message ||
                "Failed to generate report. Try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            {/* Modal Container with Fade + Scale Animation */}
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-scale-in">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                {/* Heading */}
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="text-blue-600" /> Generate Report
                </h2>

                <p className="text-sm text-gray-500 mb-6">
                    Select the fields you want to include in your Word document.
                </p>

                {/* Field Options */}
                <div className="space-y-3 mb-8">
                    {Object.keys(options).map((key) => (
                        <button
                            key={key}
                            onClick={() => toggleOption(key)}
                            className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
                                options[key]
                                    ? "bg-blue-50 border-blue-200 text-blue-800"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <span className="capitalize font-medium">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            {options[key] ? (
                                <CheckSquare size={20} className="text-blue-600" />
                            ) : (
                                <Square size={20} className="text-gray-400" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition flex justify-center items-center gap-2 disabled:opacity-70"
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Download size={18} />
                    )}
                    Download .DOCX
                </button>

                {/* Optional Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                        <Loader2 size={32} className="animate-spin text-gray-700" />
                    </div>
                )}
            </div>

            {/* Animations */}
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scale-in {
                    animation: scaleIn 0.25s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
