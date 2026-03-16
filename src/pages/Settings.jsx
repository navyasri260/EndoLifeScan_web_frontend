import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Lock, ArrowRight, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.put('/change-password', {
        email: user.email,
        current_password: currentPassword,
        new_password: newPassword
      });
      
      if (response.data.status === 'success') {
        setStatus({ type: 'success', message: 'Password updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatus({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update password.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-slate-400">Manage your profile and security preferences</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="glass-panel p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-blue-500/20">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <h2 className="text-xl font-semibold">{user?.full_name}</h2>
                <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
                
                <div className="mt-6 w-full pt-6 border-t border-slate-700/50 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Shield size={16} className="text-emerald-500" />
                    <span>Account secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content Area */}
          <div className="md:col-span-2">
            <div className="glass-panel p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Lock size={20} />
                </div>
                <h3 className="text-xl font-semibold">Change Password</h3>
              </div>

              {status.message && (
                <div className={`flex items-center gap-2 p-4 rounded-lg mb-6 text-sm font-medium border ${
                  status.type === 'error' 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                  <span>{status.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="input-field"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary mt-6 content-start" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
