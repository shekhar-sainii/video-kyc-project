import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Html from "./Html";
import Swal from "sweetalert2";

const AIModelManagement = () => {
  const isDark = useSelector((state) => state.theme.mode === "dark");
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);

  useEffect(() => {
    setLoading(true);
    // Dummy Data based on Mockup
    const dummyModels = [
      { id: 1, name: "GPT-4o Vision", provider: "OpenAI", type: "Multimodal", status: "Active", latency: "240ms", accuracy: "99.2%" },
      { id: 2, name: "Claude 3.5 Sonnet", provider: "Anthropic", type: "LLM", status: "Standby", latency: "310ms", accuracy: "98.5%" },
      { id: 3, name: "DocExtract Custom v2", provider: "Internal", type: "OCR/Layout", status: "Active", latency: "110ms", accuracy: "96.8%" },
      { id: 4, name: "Gemini 1.5 Pro", provider: "Google", type: "Multimodal", status: "Offline", latency: "N/A", accuracy: "97.2%" },
    ];

    setTimeout(() => {
      setModels(dummyModels);
      setLoading(false);
    }, 600);
  }, []);

  const onToggleStatus = (model) => {
    Swal.fire({
      title: 'Update Model State?',
      text: `Are you sure you want to change the status of ${model.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      background: isDark ? '#1a2b4b' : '#fff',
      color: isDark ? '#fff' : '#1a2b4b',
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = models.map(m => m.id === model.id ? { ...m, status: m.status === "Active" ? "Standby" : "Active" } : m);
        setModels(updated);
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#1a2b4b]"}`}>
            AI Model Management
          </h1>
          <p className={`${isDark ? "text-slate-400" : "text-gray-500"} text-sm`}>
            Configure LLMs, OCR engines, and processing pipelines.
          </p>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">
          Connect New Model
        </button>
      </div>

      <Html 
        data={models} 
        loading={loading} 
        isDark={isDark} 
        onToggleStatus={onToggleStatus} 
      />
    </div>
  );
};

export default AIModelManagement;