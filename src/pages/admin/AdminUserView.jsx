import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../../api/admin";
import { ArrowLeft, FileText, Briefcase, FileBadge, Loader2, BookOpen, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUserView() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(userId) fetchDetails();
    }, [userId]);

    const fetchDetails = async () => {
        try {
            const response = await adminAPI.getUserDetails(userId);
            // The controller returns separated paper arrays (journalPapers, conferencePapers, etc.)
            // We merge them here to display a unified "Recent Publications" list
            const resData = response.data.data;
            const allPapers = [
                ...(resData.journalPapers || []),
                ...(resData.conferencePapers || []),
                ...(resData.bookChapterPapers || [])
            ].sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)); // Sort by date descending

            setData({ ...resData, papers: allPapers });
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch user details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-400 flex justify-center"><Loader2 className="animate-spin"/></div>;
    if (!data) return <div className="p-20 text-center text-red-500">User not found.</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-10 max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Faculty Profile</h1>
                    <p className="text-gray-500 text-sm">Viewing detailed records.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DetailCard
                    label="Total Papers"
                    value={data.total}
                    sub={`Journals: ${data.journals} • Conf: ${data.conferences}`}
                    icon={<BookOpen className="text-blue-600"/>}
                />
                <DetailCard
                    label="Active Projects"
                    value={data.projectsCount}
                    icon={<Briefcase className="text-purple-600"/>}
                />
                <DetailCard
                    label="Filed Patents"
                    value={data.patentsCount}
                    icon={<FileBadge className="text-orange-600"/>}
                />
            </div>

            {/* Recent Papers */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Publications</h3>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {data.papers.length === 0 ? (
                        <p className="p-6 text-gray-400 text-center">No publications found.</p>
                    ) : (
                        data.papers.slice(0, 5).map((paper) => (
                            <div key={paper._id} className="p-5 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 leading-snug">{paper.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{paper.publishedBy}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-gray-100 text-xs font-medium rounded text-gray-600 whitespace-nowrap">
                     {new Date(paper.publishedDate).getFullYear()}
                   </span>
                                </div>
                            </div>
                        ))
                    )}
                    {data.papers.length > 5 && (
                        <div className="p-3 bg-gray-50 text-center text-xs text-gray-500">
                            Showing 5 of {data.papers.length} papers
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Projects List */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Projects</h3>
                    <div className="space-y-3">
                        {data.projects.length === 0 ? <p className="text-gray-400 text-sm">No projects.</p> :
                            data.projects.map(p => (
                                <div key={p._id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <h4 className="font-medium text-gray-900">{p.name}</h4>
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded mt-2 inline-block">{p.status}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Patents List */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Patents</h3>
                    <div className="space-y-3">
                        {data.patents.length === 0 ? <p className="text-gray-400 text-sm">No patents.</p> :
                            data.patents.map(p => (
                                <div key={p._id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <h4 className="font-medium text-gray-900">{p.title}</h4>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded">{p.status}</span>
                                        <span>App #: {p.applicationNumber}</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

        </div>
    );
}

function DetailCard({ label, value, sub, icon }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
                {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-gray-600">{icon}</div>
        </div>
    );
}