import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../api/dashboard";
import ScholarSyncModal from "../components/dashboard/ScholarSyncModal";
import ReportModal from "../components/dashboard/ReportModal";
import toast from "react-hot-toast";
import {
    BookOpen, Quote, TrendingUp, Activity, RefreshCw, ExternalLink,
    Mail, LayoutDashboard, FileText, Info
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const [isSyncOpen, setIsSyncOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const [dashboardData, setDashboardData] = useState(null);

    // NEW: Last report timestamp
    const [lastReport, setLastReport] = useState(
        localStorage.getItem("lastReportGenerated")
    );

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await dashboardAPI.getStats();
            setDashboardData(response.data.data);
        } catch (err) {
            console.error("Failed to load dashboard", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncSuccess = (freshData) => {
        setDashboardData(prev => ({
            ...prev,
            userBio: freshData.author,
            userStats: freshData.stats,
            papersCount: freshData.paperCount,
        }));
        setIsSyncOpen(false);
    };

    // Safe metric reader
    const getExternalStat = (key, type = "all") => {
        const table = dashboardData?.userStats?.table;
        if (!table) return 0;
        const item = table.find(obj => obj[key]);
        return item ? item[key][type] : 0;
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

    const hasScholarData = dashboardData?.userBio && Object.keys(dashboardData.userBio).length > 0;

    // NEW: Check if user has papers
    const noPapers = (dashboardData?.papersCount || 0) === 0;

    // Handle disabled click
    const handleDisabledReportClick = () => {
        if (noPapers) {
            toast.error("You must have at least 1 paper to generate a report.");
        }
    };

    // When user successfully downloads a report
    const handleReportGenerated = () => {
        const timestamp = Date.now();
        localStorage.setItem("lastReportGenerated", timestamp);
        setLastReport(timestamp);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Research Analytics</h1>
                    <p className="text-gray-500 text-sm">Welcome back, {user?.fullName?.split(" ")[0]}</p>

                    {/* LAST REPORT TIME */}
                    {lastReport && (
                        <p className="text-xs text-gray-400 mt-1">
                            Last report generated: {new Date(Number(lastReport)).toLocaleString()}
                        </p>
                    )}
                </div>

                <div className="flex gap-3">

                    {/* REPORT BUTTON WITH TOOLTIP */}
                    <div className="relative group">
                        <button
                            onClick={() => {
                                if (noPapers) return handleDisabledReportClick();
                                setIsReportOpen(true);
                            }}
                            disabled={noPapers}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition shadow-lg
                                ${noPapers
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-gray-900 text-white hover:bg-gray-800 shadow-gray-800/20"
                            }`}
                        >
                            <FileText size={18} />
                            Generate Report
                        </button>

                        {/* Tooltip when disabled */}
                        {noPapers && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-xs bg-gray-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition">
                                Add at least one paper to generate a report
                            </div>
                        )}
                    </div>

                    {/* SYNC BUTTON */}
                    <button
                        onClick={() => setIsSyncOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                    >
                        <RefreshCw size={18} />
                        {hasScholarData ? "Update Data" : "Sync Scholar Profile"}
                    </button>
                </div>
            </div>

            {/* EMPTY STATE */}
            {!hasScholarData && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white p-4 rounded-full shadow-sm w-fit mx-auto mb-6">
                            <LayoutDashboard size={32} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Your dashboard is empty</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Sync your Google Scholar profile to automatically import papers, generate citation graphs, and calculate your h-index.
                        </p>

                        <button onClick={() => setIsSyncOpen(true)} className="text-blue-600 font-semibold hover:underline">
                            Start Synchronization →
                        </button>
                    </div>
                </div>
            )}

            {/* FULL DASHBOARD CONTENT */}
            {hasScholarData && (
                <>
                    {/* PROFILE CARD */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                        <img
                            src={dashboardData.userBio.thumbnail}
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-blue-50 object-cover"
                        />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{dashboardData.userBio.name}</h2>
                            <p className="text-gray-600 font-medium mb-2">{dashboardData.userBio.affiliations}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1"><Mail size={14}/> {dashboardData.userBio.email}</div>
                                {dashboardData.userBio.website && (
                                    <a href={dashboardData.userBio.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                        <ExternalLink size={14}/> Google Scholar Profile
                                    </a>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {dashboardData.userBio.interests?.map((interest, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                                        {interest.title}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* METRICS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            label="Total Citations"
                            value={getExternalStat("citations", "all")}
                            subValue={`+${getExternalStat("citations", "since_2020")} since 2020`}
                            icon={<Quote size={20} className="text-blue-600" />}
                            color="blue"
                        />
                        <MetricCard
                            label="Total Papers"
                            value={dashboardData.papersCount || 0}
                            subValue="Stored in Library"
                            icon={<BookOpen size={20} className="text-purple-600" />}
                            color="purple"
                        />
                        <MetricCard
                            label="h-index"
                            value={getExternalStat("h_index", "all")}
                            subValue={`${getExternalStat("h_index", "since_2020")} since 2020`}
                            icon={<Activity size={20} className="text-green-600" />}
                            color="green"
                        />
                        <MetricCard
                            label="i10-index"
                            value={getExternalStat("i10_index", "all")}
                            subValue={`${getExternalStat("i10_index", "since_2020")} since 2020`}
                            icon={<TrendingUp size={20} className="text-orange-600" />}
                            color="orange"
                        />
                    </div>

                    {/* CITATION GRAPH */}
                    {dashboardData.userStats?.graph && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Citation Growth (Yearly)</h3>
                            <ResponsiveContainer width="100%" height="85%">
                                <AreaChart data={dashboardData.userStats.graph}>
                                    <defs>
                                        <linearGradient id="colorCit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="citations" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCit)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </>
            )}

            {/* MODALS */}
            <ScholarSyncModal
                isOpen={isSyncOpen}
                onClose={() => setIsSyncOpen(false)}
                onSuccess={handleSyncSuccess}
            />

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                onGenerated={handleReportGenerated}  // NEW CALLBACK
            />

        </div>
    );
}

// Metric Card
function MetricCard({ label, value, subValue, icon, color }) {
    const colors = {
        blue: "bg-blue-50 text-blue-700",
        purple: "bg-purple-50 text-purple-700",
        green: "bg-green-50 text-green-700",
        orange: "bg-orange-50 text-orange-700",
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
                {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
            </div>
            <div className={`p-3 rounded-lg ${colors[color]}`}>
                {icon}
            </div>
        </div>
    );
}
