'use client';
import { useState } from 'react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null); // Reset previous results
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Send to FastAPI backend
      const response = await fetch('http://localhost:8000/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-12 bg-gray-900 text-white font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-blue-400">VeriSight</h1>
          <p className="mt-4 text-gray-400 text-lg">AI Media Authenticity Engine</p>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-10 text-center bg-gray-800">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          {selectedFile && (
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          )}
        </div>

        {/* Results Dashboard */}
        {result && (
          <div className={`p-6 rounded-xl border ${result.prediction === 'FAKE' ? 'bg-red-900/20 border-red-500' : 'bg-green-900/20 border-green-500'}`}>
            <h2 className="text-3xl font-bold mb-2">
              Result: {result.prediction}
            </h2>
            <p className="text-xl opacity-80 mb-6">Confidence: {result.confidence}%</p>

            {/* Render Google Lens Matches if Fake */}
            {result.prediction === 'FAKE' && result.matches.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Potential Source Images (Google Lens)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {result.matches.map((match: any, idx: number) => (
                    <a key={idx} href={match.link} target="_blank" rel="noreferrer" className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                      <img src={match.thumbnail} alt="Source match" className="w-full h-32 object-cover rounded mb-3" />
                      <p className="text-sm truncate text-gray-300">{match.title}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}