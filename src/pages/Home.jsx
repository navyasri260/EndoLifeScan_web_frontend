import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Scan, ShieldCheck, AlertTriangle } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-container home-container animate-fade-in relative">
      <h1 className="welcome-text">Welcome, {user?.full_name || 'User'}</h1>

      <button 
        className="new-scan-card shadow-lg hover:shadow-xl transition-all mb-8 w-full text-left"
        onClick={() => navigate('/guide')}
      >
        <div className="scan-icon-container">
          <Scan size={32} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">New Scan</h2>
          <p className="text-slate-600 font-medium">Analyze an endodontic file</p>
        </div>
      </button>

      <h3 className="section-title mb-4 font-bold text-slate-800 text-xl">AI Analysis Features</h3>

      <div className="features-list">
        <div className="feature-card glass-panel flex p-4 items-center gap-4">

          <div>
            <h4 className="font-bold text-slate-800">360° Segmented Capture</h4>
            <p className="text-sm text-slate-500">Ensures complete surface inspection via 3 segments</p>
          </div>
        </div>

        <div className="feature-card glass-panel flex p-4 items-center">
          <ShieldCheck className="text-blue-600 flex-shrink-0" size={28} />
          <div>
            <h4 className="font-bold text-slate-800">Safety-Focused Analysis</h4>
            <p className="text-sm text-slate-500">Detects wear, cracks, tip damage, and deformation</p>
          </div>
        </div>

        <div className="feature-card glass-panel flex p-4 items-center gap-4">
          <AlertTriangle className="text-purple-600 flex-shrink-0" size={28} />
          <div>
            <h4 className="font-bold text-slate-800">Breakage Probability</h4>
            <p className="text-sm text-slate-500">AI-based risk estimation for safer reuse decisions</p>
          </div>
        </div>
      </div>

      <div className="warning-card mt-8 flex p-4 gap-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={24} />
        <p className="text-amber-700 font-medium text-sm leading-relaxed">
          Decision Support ONLY: AI analysis supports clinical judgment and does not replace professional decision-making.
        </p>
      </div>
    </div>
  );
};

export default Home;
