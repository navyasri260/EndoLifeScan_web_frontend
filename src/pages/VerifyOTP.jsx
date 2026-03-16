import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Activity, KeyRound, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await api.post('/verify-otp', { email, otp });
      if (response.data.status === 'success') {
        setStatus({ type: 'success', message: 'OTP verified successfully.' });
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 1500);
      } else {
        setStatus({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Invalid or expired OTP. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <Link to="/forgot-password" style={{ display: 'inline-flex', marginBottom: '1.5rem', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} />
          Go back
        </Link>
        
        <div className="auth-header">
          <div className="auth-logo">
            <Activity size={32} color="var(--primary)" />
          </div>
          <h1 className="auth-title">Enter OTP</h1>
          <p className="auth-subtitle">We sent a 6-digit code to <strong>{email}</strong></p>
        </div>

        {status.message && (
          <div className={`auth-alert ${status.type}`}>
            {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="input-label" htmlFor="otp">One-Time Password</label>
            <div className="input-with-icon">
              <KeyRound className="input-icon" size={18} />
              <input
                id="otp"
                type="text"
                maxLength={6}
                className="input-field pl-10"
                placeholder="123456"
                style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.25rem', paddingLeft: '1rem', paddingRight: '1rem' }}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full mt-4" 
            disabled={isLoading || otp.length < 6}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
