import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { Upload, Image as ImageIcon, X, AlertCircle, Activity, ShieldCheck, ShieldAlert, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState({ image1: null, image2: null, image3: null });
  const [previews, setPreviews] = useState({ image1: '', image2: '', image3: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // 'verified' or 'failed'
  const [error, setError] = useState('');

  // Results State
  const [results, setResults] = useState(null);
  const [resultView, setResultView] = useState('upload'); // 'upload', 'verification', 'segments', 'full_report'
  const [previousView, setPreviousView] = useState('upload');

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setImages(prev => ({ ...prev, [key]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (key) => {
    setImages(prev => ({ ...prev, [key]: null }));
    setPreviews(prev => ({ ...prev, [key]: '' }));
    setResults(null); // Clear previous results if modifying images
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!images.image1 || !images.image2 || !images.image3) {
      setError('Please provide all three images (Front, Middle, and Tip segments).');
      return;
    }

    setIsUploading(true);
    setIsVerifying(true);
    setError('');
    setResults(null);
    setVerificationResult(null);
    setResultView('verification'); // Show verification screen first

    const formData = new FormData();
    formData.append('image1', images.image1);
    formData.append('image2', images.image2);
    formData.append('image3', images.image3);
    formData.append('user_id', user?.id);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Artificial delay to show verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsVerifying(false);

      if (response.data.status === 'success') {
        setVerificationResult('verified');
        // Use real backend results and populate segments
        const data = response.data;

        // Ensure individual results exist for voting
        if (!data.segment_results) {
          // Mapping prediction to per-segment results if not provided
          const status = data.prediction === 'safe' ? 'Safe' : (data.prediction === 'borderline' ? 'Medium Wear' : 'Unsafe');
          data.segment_results = [
            { name: '1st Segment', status: status },
            { name: '2nd Segment', status: status },
            { name: '3rd Segment', status: status }
          ];
        }
        setResults(data);
      } else {
        setVerificationResult('failed');
        setError(response.data.message || 'File Not Verified – Please upload valid endodontic file images.');
      }
    } catch (err) {
      console.error(err);
      setIsVerifying(false);
      setVerificationResult('failed');
      setError('Backend connection error – Please ensure the server is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const getCombinedDecision = () => {
    if (!results || !results.segment_results) return null;

    const statuses = results.segment_results.map(s => s.status);
    const unsafeCount = statuses.filter(s => s === 'Unsafe').length;
    const mediumCount = statuses.filter(s => s === 'Medium Wear').length;
    const safeCount = statuses.filter(s => s === 'Safe').length;

    if (unsafeCount === 3) return { status: 'DISPOSE IMMEDIATELY', color: 'text-red-700', msg: '3 Unsafe detected → Dispose immediately.' };
    if (mediumCount === 2 && unsafeCount === 1) return { status: 'HIGH WEAR DETECTED', color: 'text-red-500', msg: '2 Medium + 1 Unsafe → High wear detected.' };
    if (unsafeCount >= 1) return { status: 'DO NOT REUSE', color: 'text-red-600', msg: 'Any Unsafe detected → Do not reuse.' };
    if (safeCount === 1 && mediumCount === 2) return { status: 'LIMITED REUSE', color: 'text-amber-600', msg: '1 Safe + 2 Medium → Limited reuse recommended.' };
    if (safeCount === 2 && mediumCount === 1) return { status: 'REUSE CAREFULLY', color: 'text-amber-500', msg: '2 Safe + 1 Medium → Reuse carefully.' };
    if (safeCount === 3) return { status: 'SAFE TO REUSE', color: 'text-emerald-500', msg: '3 Safe → Safe to reuse.' };

    return { status: 'CAUTION', color: 'text-amber-500', msg: 'Unknown condition pattern. Proceed with extreme caution.' };
  };

  const resetForm = () => {
    setImages({ image1: null, image2: null, image3: null });
    setPreviews({ image1: '', image2: '', image3: '' });
    setResults(null);
    setResultView('upload');
    setPreviousView('upload');
    setError('');
  };

  const handleViewChange = (newView) => {
    setPreviousView(resultView);
    setResultView(newView);
  };

  const goBack = () => {
    if (resultView === 'verification' || resultView === 'segments') {
      setResultView('upload');
    } else if (resultView === 'full_report') {
      setResultView('segments');
    }
  };

  const getStatusColor = (prediction) => {
    switch (prediction) {
      case 'safe': return 'text-emerald-500';
      case 'borderline': return 'text-amber-500';
      case 'not_safe': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (prediction) => {
    switch (prediction) {
      case 'safe': return <ShieldCheck size={32} className="text-emerald-500" />;
      case 'borderline': return <AlertTriangle size={32} className="text-amber-500" />;
      case 'not_safe': return <ShieldAlert size={32} className="text-red-500" />;
      default: return <Activity size={32} />;
    }
  };

  // Helper component for image upload box
  const ImageUploadBox = ({ title, imgKey }) => {
    const inputRef = useRef(null);

    return (
      <div className="upload-box">
        <div className="upload-box-header">
          <span className="upload-box-title">{title}</span>
        </div>

        {previews[imgKey] ? (
          <div className="image-preview-container">
            <img src={previews[imgKey]} alt={`${title} preview`} className="image-preview" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={() => removeImage(imgKey)}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className="upload-placeholder"
            onClick={() => inputRef.current?.click()}
          >
            <ImageIcon size={32} className="placeholder-icon" />
            <span className="placeholder-text">Click to upload</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden-input"
              onChange={(e) => handleImageChange(e, imgKey)}
            />
          </div>
        )}
      </div>
    );
  };

  const decision = getCombinedDecision();

  return (
    <div className="page-container dashboard-container animate-fade-in">
      <header className="dashboard-header mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors border border-slate-700"
          title="Back to Home"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold mb-1">Analyze File Segments</h1>
          <p className="text-slate-400 text-lg">Upload endodontic file segments for detailed AI structural analysis</p>
        </div>
      </header>

      {error && (
        <div className="alert-error mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Column - Input */}
        <div className="input-section glass-panel">
          <h2 className="section-title">File Segments</h2>

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="upload-boxes-grid">
              <ImageUploadBox title="1st Segment" imgKey="image1" />
              <ImageUploadBox title="2nd Segment" imgKey="image2" />
              <ImageUploadBox title="3rd Segment" imgKey="image3" />
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-8"
              disabled={isUploading || !images.image1 || !images.image2 || !images.image3}
            >
              {isUploading ? (
                <>
                  <Activity className="spinner" size={20} />
                  Analyzing Features...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Start AI Analysis
                </>
              )}
            </button>
            <p className="form-hint">Analysis requires processing through both CNN and Roboflow detection modules.</p>
          </form>
        </div>

        {/* Right Column - Results */}
        <div className={`results-section glass-panel ${!results && !isUploading ? 'empty-state' : ''}`}>
          {!results && !isUploading && (
            <div className="empty-results">
              <Activity size={48} className="empty-icon" />
              <h3>Awaiting Analysis</h3>
              <p>Upload images and click analyze to view AI fatigue prediction results.</p>
            </div>
          )}

          {isUploading && (
            <div className="loading-results flex flex-col items-center justify-center h-full">
              <div className="loading-grid grid grid-cols-3 gap-2 mb-6">
                {['image1', 'image2', 'image3'].map((key, idx) => (
                  <div key={key} className="relative rounded-lg overflow-hidden border border-blue-500/30 w-20 h-24">
                    <img src={previews[key]} className="w-full h-full object-cover opacity-60" alt={`Segment ${idx + 1}`} />
                    <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="pulse-ring mb-4"></div>
              <div className="w-full max-w-xs mt-4">
  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
    <div className="h-2 bg-blue-500 animate-pulse w-full"></div>
  </div>
  <p className="text-blue-400 text-sm mt-3 animate-pulse">
    AI is analyzing file structure...
  </p>
</div>
              <span className="text-slate-500 text-xs mt-2 italic">Awaiting API Response...</span>
            </div>
          )}

          {resultView === 'verification' && (
            <div className="verification-step animate-fade-in flex flex-col items-center justify-center p-8 text-center h-full relative">
              <button onClick={goBack} className="absolute top-4 left-4 p-2 hover:bg-slate-800 rounded-full text-slate-400">
                <ArrowLeft size={20} />
              </button>

              {isVerifying ? (
                <>
                  <div className="verification-loader mb-6">
                    <Activity size={48} className="text-blue-500 spinner" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Verifying Instrument</h3>
                  <p className="text-slate-400">AI is analyzing image features to confirm endodontic file authenticity...</p>
                </>
              ) : verificationResult === 'verified' ? (
                <div className="animate-scale-up">
                  <div className="mb-6 flex justify-center">
                    <div className="bg-emerald-500/20 p-4 rounded-full">
                      <ShieldCheck size={64} className="text-emerald-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-500 mb-2">Verification Successful</h3>
                  <p className="text-slate-300 mb-8 max-w-xs mx-auto">The uploaded images contain a valid endodontic file. Proceeding to magnified analysis.</p>
                  <button
                    onClick={() => handleViewChange('segments')}
                    className="btn-primary px-10"
                  >
                    Start Magnified Inspection
                  </button>
                </div>
              ) : (
                <div className="animate-shake">
                  <div className="mb-6 flex justify-center">
                    <div className="bg-red-500/20 p-4 rounded-full">
                      <ShieldAlert size={64} className="text-red-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-red-500 mb-2">File Not Verified</h3>
                  <p className="text-slate-300 mb-8 max-w-xs mx-auto">Please upload valid endodontic file images. Random or blurry images cannot be processed.</p>
                  <button
                    onClick={goBack}
                    className="btn-outline px-10"
                  >
                    Upload Again
                  </button>
                </div>
              )}
            </div>
          )}

          {results && !isVerifying && resultView === 'segments' && (
            <div className="analysis-results animate-fade-in flex flex-col items-center p-4 h-full relative">
              <button onClick={goBack} className="absolute top-4 left-4 p-2 hover:bg-slate-800 rounded-full text-slate-400">
                <ArrowLeft size={20} />
              </button>

              <h3 className="text-2xl font-bold mb-2 text-white text-center">Magnified Segment Analysis</h3>
              <p className="text-slate-400 mb-8 text-sm max-w-lg mx-auto text-center">Individual AI assessment for each segment to check for structural anomalies.</p>
              <h3 className="text-lg font-bold mb-4 text-white">Captured Images</h3>

<div className="grid grid-cols-3 gap-3 mb-6">
  {['image1','image2','image3'].map((key,i)=>(
    <img
      key={i}
      src={previews[key]}
      className="rounded-lg h-24 object-cover"
      alt={`Captured ${i+1}`}
    />
  ))}
</div>
<h3 className="text-lg font-bold mb-4 text-white">
  AI Heatmap Analysis
</h3>
              <div className="grid grid-cols-3 gap-4 w-full mb-8">
                {results.segment_results.map((seg, idx) => (
                  <div key={idx} className="segment-magnified-card relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500/20 to-cyan-500/20 rounded-lg blur-sm group-hover:blur opacity-50 transition"></div>
                    <div className="relative rounded-lg border border-slate-700 overflow-hidden bg-slate-900 border-2 border-slate-600">
                      <img
                        src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${results.heatmaps[idx]}`}
                        alt={`${seg.name} Result`}
                        className="w-full max-w-[220px] h-[140px] object-contain bg-black mx-auto"
                      />
                      <div className="bg-slate-800 p-2 text-center border-t border-slate-700">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">
                          {seg.name}
                        </span>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${seg.status === 'Unsafe' ? 'bg-red-500/20 text-red-500' :
                            seg.status === 'Medium Wear' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-emerald-500/20 text-emerald-500'
                          }`}>
                          {seg.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Combined Recommendation */}
              <div className={`mb-6 p-4 rounded-lg w-full border ${decision.status.includes('DISPOSE') || decision.status.includes('DO NOT') ? 'bg-red-500/10 border-red-500/30' :
                  decision.status.includes('SAFE') ? 'bg-emerald-500/10 border-emerald-500/30' :
                    'bg-amber-500/10 border-amber-500/30'
                }`}>
                <h4 className={`font-black mb-1 flex items-center gap-2 ${decision.color}`}>
                  {decision.status.includes('SAFE') ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                  COMBINED RESULT: {decision.status}
                </h4>
                <p className="text-slate-300 text-sm">{decision.msg}</p>
              </div>

              <button
                onClick={() => handleViewChange('full_report')}
                className="btn-primary w-full mt-auto"
              >
                🔎 View Full Analysis Report
              </button>
            </div>
          )}

        {results && resultView === 'full_report' && (
  <div className="full-report-view animate-fade-in p-6 h-full relative flex flex-col">

    <button
      onClick={goBack}
      className="absolute top-4 left-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 z-10"
    >
      <ArrowLeft size={20} />
    </button>

    <div className="flex items-center justify-between mb-8 px-8">
      <h3 className="text-2xl font-bold text-white">Full Analysis Report</h3>
      <span className="text-slate-500 text-sm">
        Case ID: {results.analysis_id || 'SCAN-' + Math.random().toString(36).substr(2, 9).toUpperCase()}
      </span>
    </div>

    <div className="recommendation-summary mt-8 p-6 rounded-xl bg-white border border-gray-200 text-gray-800 text-center">

      <div className="flex items-center justify-center gap-3 mb-4">
        {getStatusIcon(results.prediction)}

        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Final Recommendation
          </h3>

          <span className={`text-xl font-bold ${decision.color}`}>
            {decision.status}
          </span>
        </div>
      </div>

      <p className="text-gray-600 italic mb-6">
        "{results.recommendation || decision.msg}"
      </p>

      <div className="grid grid-cols-2 gap-6 w-full mt-6">

  {/* Fracture Risk */}
  <div className="p-4 rounded-xl bg-white border border-gray-200 text-center">
    <p className="text-xs text-gray-600 mb-2">Fracture Risk</p>

    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
      <div
        className="bg-red-500 h-2 rounded-full"
        style={{ width: `${results.fatigue_score || 0}%` }}
      />
    </div>

    <p className="text-xl font-bold text-red-500">
      {results.fatigue_score?.toFixed(1)}%
    </p>
  </div>

  {/* Structural Integrity */}
  <div className="p-4 rounded-xl bg-white border border-gray-200 text-center">
    <p className="text-xs text-gray-600 mb-2">Structural Integrity</p>

    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
      <div
        className="bg-emerald-500 h-2 rounded-full"
        style={{ width: `${results.structural_integrity || 0}%` }}
      />
    </div>

    <p className="text-xl font-bold text-emerald-500">
      {results.structural_integrity?.toFixed(1)}%
    </p>
  </div>

</div>

    </div>

    <button
      onClick={resetForm}
      className="btn-outline w-full mt-6"
    >
      Analyze Another File
    </button>

  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
