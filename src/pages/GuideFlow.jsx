import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanText, Eye, Sun, Layers, AlertTriangle, Focus, Ruler, Maximize, Image as ImageIcon, CheckCircle } from 'lucide-react';
import './GuideFlow.css';

const guides = [
  {
    id: 'intro',
    navTitle: 'Scan Guide',
    icon: <ScanText size={40} className="text-purple-600" />,
    iconBg: 'bg-purple-100',
    title: 'How to Scan Endodontic Files',
    desc: "To ensure accurate AI analysis, you'll need to capture three specific views of your instrument.",
    boxType: 'default',
    boxTitle: 'Required Views:',
    boxContent: (
      <ul className="guide-list">
        <li>· Front View (Full length)</li>
        <li>· Tip View (Close-up)</li>
        <li>· Straight View (Alignment)</li>
      </ul>
    ),
    btnText: 'Start Guide',
  },
  {
    id: 'clarity',
    navTitle: 'Guide: Clarity',
    icon: <Eye size={40} className="text-purple-600" />,
    iconBg: 'bg-purple-100',
    title: 'Why a clear image is required',
    desc: 'The AI needs to see minute details like micro-cracks and surface wear on the metal file. A blurry or out-of-focus image will result in inaccurate analysis.',
    boxType: 'default',
    boxContent: 'Ensure the camera lens is clean before scanning.',
    btnText: 'Next Step',
  },
  {
    id: 'lighting',
    navTitle: 'Guide: Lighting',
    icon: <Sun size={40} className="text-amber-500" />,
    iconBg: 'bg-amber-100',
    title: 'Lighting Tips',
    desc: 'Use bright, even lighting. Natural daylight is often best. Avoid using the camera flash if it creates glare on the metal surface.',
    boxType: 'default',
    boxContent: 'Ensure there are no strong shadows cast over the file.',
    btnText: 'Next Step',
  },
  {
    id: 'background',
    navTitle: 'Guide: Background',
    icon: <Layers size={40} className="text-slate-500" />,
    iconBg: 'bg-slate-100',
    title: 'Background Tips',
    desc: 'Place the file on a plain, solid-colored surface. A white or dark background usually provides the best contrast for the metal file.',
    boxType: 'default',
    boxContent: 'Avoid patterned or textured surfaces.',
    btnText: 'Next Step',
  },
  {
    id: 'mistakes',
    navTitle: 'Guide: Mistakes',
    icon: <AlertTriangle size={40} className="text-red-500" />,
    iconBg: 'bg-red-100',
    title: 'Common Mistakes',
    desc: '',
    boxType: 'none',
    boxContent: (
      <ul className="mistakes-list">
        <li><span className="red-dot"></span> Blurry or shaky images</li>
        <li><span className="red-dot"></span> Shadows covering the file</li>
        <li><span className="red-dot"></span> Only part of the file visible</li>
      </ul>
    ),
    btnText: 'Next Step',
  },
  {
    id: 'positioning',
    navTitle: 'Guide: Positioning',
    icon: <Focus size={40} className="text-purple-600" />,
    iconBg: 'bg-purple-100',
    title: 'File Positioning',
    desc: null,
    boxType: 'none',
    boxContent: (
      <div className="text-left text-slate-500 text-lg leading-relaxed flex flex-col gap-3">
        <p>Place the endodontic file flat on the surface.</p>
        <p>Center the file in the camera frame.</p>
        <p>Ensure the entire length of the file, from tip to handle, is visible.</p>
      </div>
    ),
    btnText: 'Next Step',
  },
  {
    id: 'camera_setup',
    navTitle: 'Camera Setup',
    icon: null,
    title: 'Optimize for Accuracy',
    desc: 'Follow these guidelines for the best AI analysis results.',
    boxType: 'none',
    boxContent: (
      <div className="flex flex-col gap-3 w-full text-left">
        <div className="setup-box">
          <Ruler className="text-purple-700 mt-1 flex-shrink-0" size={24} />
          <div>
            <div className="font-bold text-slate-800">Distance</div>
            <div className="text-slate-500">Hold phone 8-12 cm from the file</div>
          </div>
        </div>
        <div className="setup-box">
          <Maximize className="text-purple-700 mt-1 flex-shrink-0" size={24} />
          <div>
            <div className="font-bold text-slate-800">Resolution</div>
            <div className="text-slate-500">Use maximum camera resolution</div>
          </div>
        </div>
        <div className="setup-box">
          <Sun className="text-purple-700 mt-1 flex-shrink-0" size={24} />
          <div>
            <div className="font-bold text-slate-800">Lighting</div>
            <div className="text-slate-500">Bright, uniform lighting, no shadows</div>
          </div>
        </div>
        <div className="setup-box">
          <Layers className="text-purple-700 mt-1 flex-shrink-0" size={24} />
          <div>
            <div className="font-bold text-slate-800">Background</div>
            <div className="text-slate-500">Plain, high-contrast surface</div>
          </div>
        </div>
        <div className="setup-box">
          <ImageIcon className="text-purple-700 mt-1 flex-shrink-0" size={24} />
          <div>
            <div className="font-bold text-slate-800">Filters</div>
            <div className="text-slate-500">No artistic filters, use default mode</div>
          </div>
        </div>
      </div>
    ),
    btnText: 'Proceed to Capture'
  },
  {
    id: 'capture_guide',
    navTitle: '360° Capture Guide',
    icon: null,
    title: 'How to Capture the File',
    desc: 'Rotate the file for each of the 3 segments to ensure complete surface inspection.',
    boxType: 'none',
    boxContent: (
      <div className="mt-8 flex flex-col items-center w-full">
        <div className="spinning-file-container">
          <div className="spinning-file"></div>
        </div>
      </div>
    ),
    btnText: 'Begin 360° Capture'
  },
  {
    id: 'ready_scan',
    navTitle: 'Ready to Scan',
    icon: null,
    title: 'Pre-scan Checklist',
    desc: null,
    boxType: 'none',
    boxContent: (
      <div className="flex flex-col gap-4 w-full text-left mt-6">
        <div className="flex items-center gap-4">
          <CheckCircle className="text-emerald-500 flex-shrink-0" size={28} />
          <span className="text-lg text-slate-700 font-medium">Camera ready</span>
        </div>
        <div className="flex items-center gap-4">
          <CheckCircle className="text-emerald-500 flex-shrink-0" size={28} />
          <span className="text-lg text-slate-700 font-medium">Camera lens clean</span>
        </div>
        <div className="flex items-center gap-4">
          <CheckCircle className="text-emerald-500 flex-shrink-0" size={28} />
          <span className="text-lg text-slate-700 font-medium">Adequate lighting available</span>
        </div>
        <div className="flex items-center gap-4">
          <CheckCircle className="text-emerald-500 flex-shrink-0" size={28} />
          <span className="text-lg text-slate-700 font-medium">Endodontic file placed flat</span>
        </div>
        <div className="flex items-center gap-4">
          <CheckCircle className="text-emerald-500 flex-shrink-0" size={28} />
          <span className="text-lg text-slate-700 font-medium">File fully visible and in focus</span>
        </div>
      </div>
    ),
    btnText: 'Start Scan'
  }
];

const GuideFlow = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const currentGuide = guides[step];

  const handleNext = () => {
    if (step < guides.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/scan');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="guide-page-container w-full min-h-screen bg-white flex flex-col items-center">
      {/* Navbar overlay for guide */}
      <div className="guide-nav w-full max-w-lg flex items-center p-4 pt-6">
        <button onClick={handleBack} className="guide-back-btn p-2 hover:bg-slate-100 rounded-full transition-colors mr-3">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <span className="guide-nav-title text-xl font-medium text-slate-800">{currentGuide.navTitle}</span>
      </div>

      <div className="guide-content flex-grow flex flex-col items-center w-full max-w-md px-6 pt-10 pb-24 text-center">
        
        {currentGuide.icon && (
          <div className={`guide-icon-wrapper ${currentGuide.iconBg} w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-sm flex-shrink-0`}>
            {currentGuide.icon}
          </div>
        )}

        <h2 className="guide-title text-2xl font-bold text-slate-800 mb-6">{currentGuide.title}</h2>
        
        {currentGuide.desc && (
          <p className="guide-desc text-slate-500 text-lg leading-relaxed mb-8">
            {currentGuide.desc}
          </p>
        )}

        {currentGuide.boxType === 'default' && currentGuide.boxContent && (
          <div className="guide-box bg-slate-50 border border-blue-200 rounded-xl p-5 text-left w-full shadow-sm text-slate-600 text-md leading-relaxed">
            {currentGuide.boxTitle && <h4 className="font-semibold text-slate-800 mb-2">{currentGuide.boxTitle}</h4>}
            {currentGuide.boxContent}
          </div>
        )}

        {currentGuide.boxType === 'none' && currentGuide.boxContent}

      </div>

      <div className="guide-footer fixed bottom-0 left-0 w-full p-6 flex justify-center bg-white">
        <button 
          onClick={handleNext}
          className="guide-primary-btn"
        >
          {currentGuide.btnText}
        </button>
      </div>
    </div>
  );
};

export default GuideFlow;
