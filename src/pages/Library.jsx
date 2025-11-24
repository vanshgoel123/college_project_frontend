import React, { useEffect, useState } from "react";
import { paperAPI } from "../api/paper";
import useDebounce from "../hooks/useDebounce";
import {
    Search, X, FileText, Users, Book, LayoutGrid,
    ExternalLink, Star, Trash2, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

export default function Library() {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState("all");
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // --- EFFECT: Handle Data Fetching ---
    useEffect(() => {
        if (debouncedSearch) {
            performSearch();
        } else {
            fetchByTab();
        }
    }, [debouncedSearch, activeTab]);

    // --- API CALLS ---
    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await paperAPI.search(debouncedSearch);
            const result = response.data.data;
            const list = Array.isArray(result) ? result : (result.search || []);
            setPapers(list);
        } catch (err) {
            setPapers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchByTab = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === "all") response = await paperAPI.getAllPapers();
            else if (activeTab === "journal") response = await paperAPI.getJournals();
            else if (activeTab === "conference") response = await paperAPI.getConferences();
            else response = await paperAPI.getBookChapters();

            setPapers(response.data.data || []);
        } catch (err) {
            setPapers([]);
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---
    const handleDelete = async (id) => {
        if(!window.confirm("Delete this paper?")) return;
        try {
            await paperAPI.deletePaper(id);
            setPapers(papers.filter(p => p._id !== id));
            toast.success("Deleted");
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    // ⚡️ FIXED: Logic to update UI instantly
    const handleStar = async (id) => {
        // 1. Optimistic Update: Find the paper and flip its 'isStarred' boolean immediately
        const updatedPapers = papers.map((p) =>
            p._id === id ? { ...p, isStarred: !p.isStarred } : p
        );
        setPapers(updatedPapers);

        // Check what the new state is to show the right toast
        const isNowStarred = updatedPapers.find(p => p._id === id)?.isStarred;

        try {
            // 2. Call Backend
            await paperAPI.toggleStar(id);
            toast.success(isNowStarred ? "Added to favorites" : "Removed from favorites");
        } catch (err) {
            // 3. Rollback if backend fails
            setPapers(papers); // Revert to old state
            toast.error("Action failed");
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10 max-w-7xl mx-auto">

            {/* 1. HEADER & SEARCH */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Library</h1>
                    <p className="text-gray-500 mt-1">Manage, search, and organize your research.</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {loading && debouncedSearch ? (
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        ) : (
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        )}
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                        placeholder="Search database..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* 2. TABS */}
            {!debouncedSearch && (
                <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-xl w-fit backdrop-blur-sm">
                    <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} label="All Papers" icon={<LayoutGrid size={16}/>} />
                    <TabButton active={activeTab === "journal"} onClick={() => setActiveTab("journal")} label="Journals" icon={<FileText size={16}/>} />
                    <TabButton active={activeTab === "conference"} onClick={() => setActiveTab("conference")} label="Conferences" icon={<Users size={16}/>} />
                    <TabButton active={activeTab === "book"} onClick={() => setActiveTab("book")} label="Chapters" icon={<Book size={16}/>} />
                </div>
            )}

            {/* 3. SEARCH STATUS */}
            {debouncedSearch && (
                <div className="text-sm text-gray-500 font-medium px-1">
                    Showing results for <span className="text-gray-900">"{debouncedSearch}"</span>
                </div>
            )}

            {/* 4. LIST */}
            {loading && !papers.length ? (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Fetching papers...</p>
                </div>
            ) : papers.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No papers found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {papers.map((paper) => (
                        <PaperCard
                            key={paper._id}
                            paper={paper}
                            onDelete={handleDelete}
                            onStar={handleStar}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, label, icon }) {
    return (
        <button
            onClick={onClick}
            className={`
        flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${active
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
            }
      `}
        >
            {icon}
            {label}
        </button>
    );
}

function PaperCard({ paper, onDelete, onStar }) {
    return (
        <div className="group relative bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col sm:flex-row gap-4">

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                    {paper.classifiedAs && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md uppercase tracking-wider
               ${paper.classifiedAs === 'journal' ? 'bg-purple-50 text-purple-700' :
                            paper.classifiedAs === 'conference' ? 'bg-blue-50 text-blue-700' :
                                'bg-orange-50 text-orange-700'
                        }`}>
               {paper.classifiedAs}
             </span>
                    )}
                    {paper.tag?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">#{t}</span>
                    ))}
                </div>

                <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                    {paper.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 truncate">
                    <span className="font-medium text-gray-900">Authors:</span> {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        {paper.publishedBy || "Unknown Publisher"}
                    </div>
                    <span>{new Date(paper.publishedDate).getFullYear()}</span>
                    {paper.citedBy !== undefined && (
                        <span className="text-green-700 bg-green-50 px-2 py-1 rounded">Cited by: {paper.citedBy}</span>
                    )}
                </div>
            </div>

            <div className="flex sm:flex-col items-center justify-center gap-2 border-t sm:border-t-0 sm:border-l sm:pl-4 border-gray-100 pt-3 sm:pt-0">
                <a
                    href={paper.link || paper.manualUpload}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Open Link"
                >
                    <ExternalLink size={18} />
                </a>

                {/* ⚡️ FIXED: Button now reacts to 'paper.isStarred' */}
                <button
                    onClick={() => onStar(paper._id)}
                    className={`p-2 rounded-lg transition-colors ${
                        paper.isStarred
                            ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                            : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                    }`}
                    title={paper.isStarred ? "Remove Star" : "Add Star"}
                >
                    {/* Fill the star if active */}
                    <Star size={18} fill={paper.isStarred ? "currentColor" : "none"} />
                </button>

                <button
                    onClick={() => onDelete(paper._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}