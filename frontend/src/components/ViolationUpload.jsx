import React, { useState } from 'react';
import { Upload, Camera, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { reportViolation } from '../api/api';

const ViolationUpload = () => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: ''
    });
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
        if (!file) {
            setError("Please select an image to upload.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        const submissionData = new FormData();
        submissionData.append('image', file);
        submissionData.append('name', formData.name);
        submissionData.append('location', formData.location);
        submissionData.append('description', formData.description);

        try {
            const response = await reportViolation(submissionData);
            setResult(response.data);
            // Reset form on success
            setFormData({ name: '', location: '', description: '' });
            setFile(null);
            setPreview(null);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
            <div className="flex items-center space-x-4 mb-8">
                <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
                    <AlertCircle size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Report Violation</h2>
                    <p className="text-slate-400 font-medium text-sm">Real-time citizen monitoring system</p>
                </div>
            </div>

            {result ? (
                <div className="animate-in fade-in zoom-in duration-300">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center mb-6">
                        <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-emerald-800 uppercase tracking-tight">Report Submitted Successfully</h3>
                        <p className="text-emerald-600 text-sm mt-1">Complaint ID: <span className="font-mono font-bold font-sm uppercase">{result.complaint_id}</span></p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Diagnostic Result</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Violation Type</p>
                                <p className="text-sm font-black text-slate-800">{result.classification.violation_type}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Severity</p>
                                <p className={`text-sm font-black ${result.classification.severity === 'High' ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {result.classification.severity}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Confidence</p>
                                <p className="text-sm font-black text-slate-800">{Math.round(result.classification.confidence * 100)}%</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setResult(null)}
                            className="mt-6 w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors text-xs uppercase tracking-widest"
                        >
                            Raise Another Complaint
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div
                            className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer overflow-hidden ${preview ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            {preview ? (
                                <div className="relative z-0">
                                    <img src={preview} alt="Violation" className="mx-auto h-48 w-full object-cover rounded-2xl shadow-md" />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-full shadow text-emerald-600">
                                        <CheckCircle2 size={20} />
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <Camera size={32} />
                                    </div>
                                    <p className="text-sm font-black text-slate-600 uppercase tracking-tighter">Upload Evidence</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">PNG, JPG or GIF up to 10MB</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reporter Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Details</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                    placeholder="Street / Landark"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Incident Description</label>
                            <textarea
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium resize-none"
                                placeholder="Describe the environmental hazard..."
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center space-x-2 text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 italic text-xs">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gov-blue text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Send size={20} />
                                <span>Submit Violation Report</span>
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ViolationUpload;
