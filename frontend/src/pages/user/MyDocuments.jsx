import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { 
  FiFileText, FiSearch, FiFilter, FiMoreVertical, 
  FiEye, FiTrash2, FiDownload, FiPlus 
} from "react-icons/fi";

const MyDocuments = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy Data for the list view
  const [documents, setDocuments] = useState([
    { id: "1", name: "annual_report_2025.pdf", date: "Mar 15, 2026", size: "4.2 MB", status: "Processed" },
    { id: "2", name: "tax_invoice_march.png", date: "Mar 14, 2026", size: "1.1 MB", status: "Processed" },
    { id: "3", name: "employment_contract.pdf", date: "Mar 12, 2026", size: "2.5 MB", status: "Analyzing" },
    { id: "4", name: "research_notes_v1.docx", date: "Mar 10, 2026", size: "850 KB", status: "Processed" },
    { id: "5", name: "bank_statement_feb.pdf", date: "Mar 05, 2026", size: "3.2 MB", status: "Failed" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#f8fafd]"}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>
              My Documents
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Manage, view, and analyze your uploaded document library.
            </p>
          </div>
          <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <FiPlus size={18} /> Upload New
          </Link>
        </div>

        {/* --- SEARCH & FILTERS --- */}
        <div className={`p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between border mb-6 ${
          isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by filename..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 bg-transparent text-sm focus:outline-none ${isDark ? "text-white placeholder:text-slate-500" : "text-gray-900"}`}
            />
          </div>
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition ${
            isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}>
            <FiFilter /> Filter
          </button>
        </div>

        {/* --- DOCUMENTS TABLE --- */}
        <div className={`rounded-[2rem] border overflow-hidden shadow-sm transition-all ${
          isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"
        }`}>
          {loading ? (
            <div className="p-20 text-center text-blue-500 font-bold animate-pulse text-xs tracking-widest uppercase">
              Loading Library...
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? "border-slate-700 bg-slate-800/40" : "bg-slate-50 border-slate-100"}`}>
                  <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Filename</th>
                  <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Date Uploaded</th>
                  <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Size</th>
                  <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Status</th>
                  <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-50"}`}>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className={`transition-all group ${isDark ? "hover:bg-slate-800/30" : "hover:bg-blue-50/40"}`}>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                          <FiFileText size={20} />
                        </div>
                        <span className={`font-bold ${isDark ? "text-slate-100" : "text-[#1a2b4b]"}`}>{doc.name}</span>
                      </div>
                    </td>
                    <td className={`p-5 text-xs font-medium ${isDark ? "text-slate-400" : "text-gray-500"}`}>{doc.date}</td>
                    <td className={`p-5 text-xs font-medium ${isDark ? "text-slate-400" : "text-gray-500"}`}>{doc.size}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${
                        doc.status === "Processed" 
                        ? (isDark ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-50 text-green-600 border-green-200")
                        : doc.status === "Failed"
                        ? (isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-200")
                        : (isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200")
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Link to={`/analysis/${doc.id}`} className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-blue-400" : "hover:bg-blue-100 text-blue-600"}`}>
                          <FiEye size={18} />
                        </Link>
                        <button className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-100 text-gray-500"}`}>
                          <FiDownload size={18} />
                        </button>
                        <button className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700 text-red-400" : "hover:bg-red-50 text-red-500"}`}>
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                      <div className="group-hover:hidden">
                        <FiMoreVertical className="text-slate-300 ml-auto" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && filteredDocs.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-slate-400 text-sm">No documents found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;