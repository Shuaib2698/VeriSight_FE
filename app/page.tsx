'use client';

import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  UploadCloud, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Cpu,
  Moon,
  Sun,
  Image as ImageIcon,
  Film
} from 'lucide-react';

interface Match {
  title: string;
  link: string;
  thumbnail: string;
}

interface AnalysisResult {
  status: string;
  prediction: 'REAL' | 'FAKE';
  confidence: number;
  matches: Match[];
  metadata_warning?: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    setError(null);
    setResult(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // RESTORED: The function that communicates with the Python backend
  const handleAnalyze = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the backend. Is FastAPI running?');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!file || !result) return;
    setDownloadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('result_data', JSON.stringify(result));

      const response = await fetch('http://localhost:8000/generate-report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('PDF Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VeriSight_Forensic_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  // Theme-based class helpers
  const bgMain = theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const bgHeader = theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm';
  const bgCard = theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-lg';
  const textMuted = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const dropzoneBg = theme === 'dark' ? 'bg-slate-950/40 border-slate-700/80' : 'bg-slate-50 border-slate-300';
  const dropzoneHover = theme === 'dark' ? 'hover:border-slate-500' : 'hover:border-blue-400';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${bgMain}`}>
      {/* Top Navigation */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 ${bgHeader}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className={`text-xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                VeriSight
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                PRO ENGINE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className={`flex items-center gap-2 hidden sm:flex ${textMuted}`}>
              <Cpu className="h-4 w-4 text-emerald-500" />
              <span>Vision Transformer (ViT)</span>
            </div>
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-indigo-500'}`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full space-y-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs mb-2 ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700/60 text-slate-300' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Next-Gen Neural Visual Authenticity Verification
          </div>
          <h1 className={`text-4xl sm:text-5xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Authenticate Media with <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Precision AI</span>
          </h1>
          <p className={`max-w-2xl mx-auto text-base sm:text-lg ${textMuted}`}>
            Inspect files for generative artifacts, neural synthesis patterns, and retrieve source matches from global visual registries.
          </p>
        </div>

        {/* Upload & Inspection Panel */}
        <div className={`border rounded-2xl p-6 sm:p-8 backdrop-blur-sm transition-colors duration-300 ${bgCard}`}>
          
          {/* Future-Proof Video Toggle */}
          <div className="flex justify-center mb-6">
            <div className={`inline-flex rounded-lg p-1 ${theme === 'dark' ? 'bg-slate-950 border border-slate-800' : 'bg-slate-100 border border-slate-200'}`}>
              <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-semibold shadow">
                <ImageIcon className="h-4 w-4" /> Image Scan
              </button>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold cursor-not-allowed ${textMuted}`} title="Video processing pipeline coming soon">
                <Film className="h-4 w-4" /> Video Scan <span className="text-[10px] uppercase tracking-wider ml-1 opacity-60">(Soon)</span>
              </button>
            </div>
          </div>

          {!previewUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-500/5 scale-[0.99]' 
                  : `${dropzoneBg} ${dropzoneHover}`
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <div className={`p-4 rounded-full border shadow-inner ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700 text-blue-400' : 'bg-white border-slate-200 text-blue-500'}`}>
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <p className={`text-base font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Click to browse or drop high-resolution images here
                </p>
                <p className={`text-xs mt-1 ${textMuted}`}>
                  Supports PNG, JPG, JPEG, WEBP up to 25MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Media Preview Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className={`relative rounded-xl overflow-hidden border aspect-square flex items-center justify-center group ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  <img src={previewUrl} alt="Inspect Target" className="max-h-full max-w-full object-contain" />
                  <div className={`absolute top-3 left-3 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-mono border ${theme === 'dark' ? 'bg-slate-900/80 text-slate-300 border-slate-700/60' : 'bg-white/80 text-slate-700 border-slate-200'}`}>
                    {file?.name}
                  </div>
                </div>

                {/* Analysis Actions & Status */}
                <div className="flex flex-col justify-center space-y-4">
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Target Staged for Inspection</h3>
                    <p className={`text-sm mt-1 ${textMuted}`}>
                      File Size: {file ? (file.size / (1024 * 1024)).toFixed(2) : 0} MB
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="flex-1 py-3.5 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      {loading ? (
                        <><RefreshCw className="h-4 w-4 animate-spin" /> Running Neural Classification...</>
                      ) : (
                        <><Search className="h-4 w-4" /> Run Authenticity Scan</>
                      )}
                    </button>

                    <button
                      onClick={handleReset}
                      disabled={loading}
                      className={`p-3.5 rounded-xl border transition text-sm disabled:opacity-50 ${theme === 'dark' ? 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300' : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'}`}
                      title="Upload new media"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Scan Results Panel */}
              {result && (
                <div className={`pt-6 border-t space-y-6 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div
                    className={`p-6 rounded-xl border ${
                      result.prediction === 'FAKE'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {result.prediction === 'FAKE' ? (
                          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-500 border border-rose-500/30">
                            <AlertTriangle className="h-7 w-7" />
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                            <CheckCircle2 className="h-7 w-7" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {result.prediction === 'FAKE' ? 'FAKE (AI Generated / Manipulated)' : 'REAL (Authentic Image)'}
                            </h2>
                          </div>
                          <p className={`text-xs mt-0.5 ${textMuted}`}>
                            Status: Classification inference resolved with high statistical confidence.
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {result.confidence}%
                        </div>
                        <p className={`text-xs font-medium ${textMuted}`}>Confidence Metric</p>
                      </div>
                    </div>

                    {/* Visual Meter */}
                    <div className={`mt-5 w-full rounded-full h-2 overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${result.prediction === 'FAKE' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata Warning Alert */}
                  {result.metadata_warning && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-sm flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-1">EXIF Forensics Alert</span>
                        {result.metadata_warning}
                      </div>
                    </div>
                  )}

                  {/* Reverse Search Visual Matches */}
                  {result.prediction === 'FAKE' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          <Search className="h-4 w-4 text-blue-500" />
                          Source Image Registry (Google Lens)
                        </h4>
                        <span className={`text-xs ${textMuted}`}>Visual Similarity Search</span>
                      </div>

                      {result.matches && result.matches.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {result.matches.map((match, idx) => (
                            <a key={idx} href={match.link} target="_blank" rel="noreferrer" className={`group p-3 rounded-xl border transition flex flex-col gap-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}>
                              <div className={`aspect-video w-full rounded-lg overflow-hidden relative ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`}>
                                <img src={match.thumbnail} alt={match.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                              </div>
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-xs font-medium line-clamp-2 leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                  {match.title}
                                </p>
                                <ExternalLink className="h-3.5 w-3.5 text-slate-500 shrink-0 group-hover:text-blue-500 transition mt-0.5" />
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className={`p-6 rounded-xl border text-center text-xs ${theme === 'dark' ? 'bg-slate-950 border-slate-800/80 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          No duplicate source links detected. This indicates the image may be completely synthesized from a text prompt (e.g. Midjourney, DALL-E) rather than an altered face composite.
                        </div>
                      )}
                    </div>
                  )}

                  {/* CORRECTED PLACEMENT: Download Certificate Action */}
                  <button
                    onClick={handleDownloadReport}
                    disabled={downloadingPdf}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 disabled:opacity-50"
                  >
                    {downloadingPdf ? (
                      <span>Generating Certified PDF...</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download Forensic Certificate (PDF)</span>
                      </>
                    )}
                  </button>

                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}