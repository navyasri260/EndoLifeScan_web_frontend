import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email) {
    setStatus({ type: 'error', message: 'Please enter your email address.' });
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    setStatus({ type: 'error', message: 'Please enter a valid email address.' });
    return;
  }

  setIsLoading(true);
  setStatus({ type: '', message: '' });
    try {
      const response = await api.post('/forgot-password', { email });
      if (response.data.status === 'success') {
        setStatus({ type: 'success', message: 'OTP sent successfully to your email.' });
        // Proceed to OTP after short delay
        setTimeout(() => {
          navigate('/verify-otp', { state: { email } });
        }, 1500);
      } else {
        setStatus({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send OTP. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <Link to="/login" className="back-link mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors" style={{ display: 'inline-flex', marginBottom: '1.5rem', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} />
          Back to login
        </Link>
        
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/favicon.png" className="auth-logo" />
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your email and we'll send you a recovery OTP</p>
        </div>

        {status.message && (
          <div className={`auth-alert ${status.type}`}>
            {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                className="input-field pl-10"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full mt-4" 
            disabled={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
