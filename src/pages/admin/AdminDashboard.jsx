import React, { useEffect, useState } from "react";
import { adminAPI } from "../../api/admin";
import {
    Users, FileText, BookOpen, BarChart2, Calendar,
    ArrowRight, Search, Loader2, Filter, GraduationCap
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Custom Date Range State
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [rangeStats, setRangeStats] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Graph Data State (Dynamic: Default or Filtered)
    const [graphData, setGraphData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                adminAPI.getDashboardStats(),
                adminAPI.getAllUsers()
            ]);

            setStats(statsRes.data.data);
            // Initialize graph with default data from stats
            setGraphData(statsRes.data.data.yearwiseAnalytics || []);

            setUsers(usersRes.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    // Helper to transform raw paper list from 'from_To' into year-wise graph data
    const processGraphData = (papers, fromYear, toYear) => {
        const counts = {};
        // Initialize all years in range with 0
        for (let i = parseInt(fromYear); i <= parseInt(toYear); i++) {
            counts[i] = 0;
        }

        // Count papers per year
        papers.forEach(p => {
            if (p.publishedDate) {
                const year = new Date(p.publishedDate).getFullYear();
                if (counts[year] !== undefined) {
                    counts[year]++;
                }
            }
        });

        // Convert to array for Recharts
        return Object.keys(counts).map(year => ({
            year: year.toString(),
            count: counts[year]
        }));
    };

    const handleRangeAnalysis = async (e) => {
        e.preventDefault();
        if(!dateRange.from || !dateRange.to) return toast.error("Enter start and end years");

        setAnalyzing(true);
        try {
            const response = await adminAPI.getAnalyticsFromTo(dateRange.from, dateRange.to);
            const data = response.data.data;

            setRangeStats(data);

            // Update Graph with new filtered data
            if (data.listOfPapers) {
                const newGraphData = processGraphData(data.listOfPapers, dateRange.from, dateRange.to);
                setGraphData(newGraphData);
            }

            toast.success("Analysis Complete");
        } catch (err) {
            toast.error(err.response?.data?.message || "Analysis Failed");
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!stats) return <div className="p-20 text-center text-red-500">Error loading data.</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-10 max-w-7xl mx-auto">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
                <p className="text-gray-500 mt-1">System-wide analytics and faculty directory.</p>
            </div>

            {/* 1. Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Faculty" value={stats.totalUsers} icon={<Users className="text-blue-600"/>} color="blue" />
                <StatCard label="Total Publications" value={stats.total} icon={<FileText className="text-purple-600"/>} color="purple" />
                <StatCard label="Journals" value={stats.journal} icon={<BookOpen className="text-green-600"/>} color="green" />
                <StatCard label="Conferences" value={stats.conference} icon={<GraduationCap className="text-orange-600"/>} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 2. Growth Chart (Dynamic) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">
                            {rangeStats ? "Filtered Growth Analysis" : "Publication Growth"}
                        </h3>
                        <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
              {rangeStats ? `From ${dateRange.from} to ${dateRange.to}` : stats.range}
            </span>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip
                                    cursor={{fill: '#f9fafb'}}
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Reset Button */}
                    {rangeStats && (
                        <button
                            onClick={() => {
                                setRangeStats(null);
                                setGraphData(stats.yearwiseAnalytics); // Reset graph to default
                                setDateRange({from: "", to: ""});
                            }}
                            className="text-xs text-blue-600 hover:underline mt-4 block text-center w-full"
                        >
                            Reset to Global View
                        </button>
                    )}
                </div>

                {/* 3. Range Analyzer Tool */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Filter size={18} /> Impact Analysis
                    </h3>
                    <form onSubmit={handleRangeAnalysis} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">From Year</label>
                                <input
                                    type="number" placeholder="2020"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">To Year</label>
                                <input
                                    type="number" placeholder="2024"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={analyzing} className="w-full bg-gray-900 text-white py-2.5 rounded-xl hover:bg-gray-800 transition font-medium flex justify-center items-center gap-2 disabled:opacity-70">
                            {analyzing ? <Loader2 size={16} className="animate-spin" /> : "Analyze Data"}
                        </button>
                    </form>

                    {rangeStats && (
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-4 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Papers Published</span>
                                <span className="font-bold text-xl text-gray-900">{rangeStats.count}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Total Citations</span>
                                <span className="font-bold text-xl text-green-600">{rangeStats.totalCitations}</span>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-2">
                                Based on {rangeStats.listOfPapers?.length || 0} records found.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Faculty Directory Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Faculty Directory</h3>
                    <span className="bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-600">
            {users.length} Members
          </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Department</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">No faculty members found.</td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50/80 transition group">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <img
                                            src={u.avatar || "https://via.placeholder.com/32"}
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                            alt=""
                                        />
                                        {u.fullName}
                                    </td>
                                    <td className="px-6 py-4">{u.email}</td>
                                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium uppercase">
                        {u.department || "N/A"}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">{u.designation || "N/A"}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/user/${u._id}`)}
                                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            View Profile <ArrowRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    const colors = {
        blue: "bg-blue-50",
        purple: "bg-purple-50",
        green: "bg-green-50",
        orange: "bg-orange-50",
    };
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:-translate-y-1">
            <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
            </div>
        </div>
    );
}