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
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <Camera className="text-blue-600" size={24} />
              Environmental Violation Report
            </h2>
          </div>
          <div className="text-sm text-slate-600">
              Report environmental violations in your area
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="space-y-1.5 mb-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Camera size={10} /> Evidence Photo
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {preview ? (
                  <img src={preview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                ) : (
                  <div className="text-slate-400">
                    <Camera size={24} className="mx-auto mb-2" />
                    <p className="text-xs">Click to upload photo</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5 mb-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <User size={10} /> Your Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Location Input */}
          <div className="space-y-1.5 mb-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={10} /> Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="Enter violation location"
              required
            />
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
    </div>
  );
};

export default ViolationUpload;
