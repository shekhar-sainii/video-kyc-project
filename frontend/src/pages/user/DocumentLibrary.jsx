import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { 
  FiSearch, FiFilter, FiTrash2, FiEye, 
  FiDownload, FiMoreVertical, FiFileText, FiPlus,
  FiCheckCircle, FiClock, FiAlertCircle
} from "react-icons/fi";

const DocumentLibrary = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Dummy Data for Library
  const [documents, setDocuments] = useState([
    { id: "DOC-101", name: "Lease_Agreement_March.pdf", type: "Legal", status: "Analyzed", date: "2026-03-15", size: "2.4MB" },
    { id: "DOC-102", name: "Employment_Contract.docx", type: "HR", status: "Processing", date: "2026-03-16", size: "1.1MB" },
    { id: "DOC-103", name: "Product_Specs_V2.pdf", type: "Technical", status: "Analyzed", date: "2026-03-10", size: "5.7MB" },
    { id: "DOC-104", name: "Invoice_9921.pdf", type: "Finance", status: "Failed", date: "2026-03-05", size: "450KB" },
    { id: "DOC-105", name: "Team_Notes.txt", type: "General", status: "Analyzed", date: "2026-03-01", size: "12KB" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter Logic
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#f8fafd]"}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>
              Document Library
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Access and manage your entire repository of analyzed documents.
            </p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <FiPlus size={18} /> New Upload
          </button>
        </div>

        {/* --- SEARCH & FILTERS BAR --- */}
        <div className={`p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between border mb-8 ${
          isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by filename or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 bg-transparent text-sm focus:outline-none ${isDark ? "text-white placeholder:text-slate-500" : "text-gray-900"}`}
            />
          </div>
          
          <div className="flex items-center gap-3">
             <select 
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               className={`px-4 py-2.5 rounded-xl text-xs font-bold border outline-none transition ${
                 isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"
               }`}
             >
               <option value="All">All Status</option>
               <option value="Analyzed">Analyzed</option>
               <option value="Processing">Processing</option>
               <option value="Failed">Failed</option>
             </select>
             <button className={`p-2.5 rounded-xl border transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                <FiFilter />
             </button>
          </div>
        </div>

        {/* --- LIBRARY TABLE --- */}
        <div className={`rounded-[2.5rem] border overflow-hidden shadow-sm transition-all ${
          isDark ? "bg-[#1a2b4b] border-slate-700" : "bg-white border-slate-100"
        }`}>
          {loading ? (
            <div className="p-20 text-center text-blue-500 font-bold animate-pulse text-xs tracking-widest uppercase italic">
              Loading Archive...
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? "border-slate-700 bg-slate-800/40" : "bg-slate-50 border-slate-100"}`}>
                  <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">File Details</th>
                  <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Upload Date</th>
                  <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Category</th>
                  <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400">Status</th>
                  <th className="p-5 font-bold uppercase text-[10px] tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-50"}`}>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className={`transition-all group ${isDark ? "hover:bg-slate-800/30" : "hover:bg-blue-50/40"}`}>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDark ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                          <FiFileText size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-bold ${isDark ? "text-slate-100" : "text-[#1a2b4b]"}`}>{doc.name}</span>
                            <span className="text-[10px] text-slate-500 font-bold tracking-tight">{doc.id} • {doc.size}</span>
                        </div>
                      </div>
                    </td>
                    <td className={`p-5 text-xs font-medium ${isDark ? "text-slate-400" : "text-gray-500"}`}>{doc.date}</td>
                    <td className="p-5">
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                          {doc.type}
                       </span>
                    </td>
                    <td className="p-5">
                      <StatusChip status={doc.status} isDark={isDark} />
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
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
                      <div className="group-hover:hidden flex justify-end">
                        <FiMoreVertical className="text-slate-300" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && filteredDocs.length === 0 && (
            <div className="p-32 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FiSearch size={24} />
              </div>
              <p className="text-slate-400 text-sm font-medium">No documents found matching your criteria.</p>
              <button onClick={() => {setSearchTerm(""); setFilterStatus("All")}} className="mt-4 text-blue-500 text-xs font-bold uppercase tracking-widest hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Internal Helper for Status Badges
const StatusChip = ({ status, isDark }) => {
    const icons = {
        Analyzed: <FiCheckCircle size={12} />,
        Processing: <FiClock size={12} className="animate-spin" />,
        Failed: <FiAlertCircle size={12} />
    };

    const styles = {
        Analyzed: isDark ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-50 text-green-600 border-green-100",
        Processing: isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-100",
        Failed: isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-100"
    };

    return (
        <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${styles[status]}`}>
            {icons[status]} {status}
        </span>
    );
};

export default DocumentLibrary;