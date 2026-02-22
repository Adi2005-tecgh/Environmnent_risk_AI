import React, { useState } from 'react';
import { Camera, Send, CheckCircle2, AlertCircle, Loader2, MapPin, User, FileText } from 'lucide-react';
import { reportViolation } from '../api/api';

const ViolationUpload = () => {
    const [formData, setFormData] = useState({ name: '', location: '', description: '' });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError("Image evidence is required for verification"); return; }
        setLoading(true); setError(null);
        const submissionData = new FormData();
        submissionData.append('image', file);
        submissionData.append('name', formData.name);
        submissionData.append('location', formData.location);
        submissionData.append('description', formData.description);
        try {
            const response = await reportViolation(submissionData);
            setResult(response.data);
            setFormData({ name: '', location: '', description: '' });
            setFile(null); setPreview(null);
        } catch (err) {
            setError(err.response?.data?.error || "Submission protocol failed");
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg">
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Citizen Oversight</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Submit Incident for Global verification</p>
                </div>
            </div>

            {result ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tight">Report Received</h3>
                    <p className="text-xs text-emerald-600 mt-2 font-black uppercase tracking-widest">Case ID: {result.complaint_id}</p>
                    <p className="text-[10px] text-emerald-600/60 mt-4 max-w-[240px] mx-auto leading-relaxed">
                        Your report has been queued for AI-driven verification and local node authority review.
                    </p>
                    <button onClick={() => setResult(null)} className="mt-8 px-8 py-3 bg-white border border-emerald-200 text-emerald-700 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-colors shadow-sm">
                        Submit Another Report
                    </button>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Evidence Upload Area */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Evidence Asset</label>
                            <div className={`relative border-2 border-dashed rounded-xl text-center transition-all cursor-pointer overflow-hidden group h-32 flex items-center justify-center ${preview ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-white'
                                }`}>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {preview ? (
                                    <img src={preview} alt="Evidence Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 mb-2 group-hover:scale-110 transition-transform">
                                            <Camera size={20} className="text-blue-600" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Upload Evidence</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">PNG, JPG up to 10MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <User size={10} /> Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    placeholder="Enter full name..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <MapPin size={10} /> Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    placeholder="Specific area..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Long Description */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <FileText size={10} /> Incident Details
                            </label>
                            <textarea
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                                placeholder="Describe the environmental breach in detail..."
                                required
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                                <AlertCircle size={14} className="text-rose-500" />
                                <p className="text-[9px] text-rose-500 font-bold uppercase trekking-tighter">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-slate-900 to-blue-900 text-white font-black rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-md"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Submit Environmental Report</>}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ViolationUpload;
