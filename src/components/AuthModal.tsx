import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { X, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let finalEmail = email.trim();
    const isSpecialAdmin = finalEmail.toLowerCase() === 'admin';
    if (isSpecialAdmin) {
      finalEmail = 'admin@otec-reportcards.local';
    }

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, finalEmail, password);
      } else {
        try {
          await signInWithEmailAndPassword(auth, finalEmail, password);
        } catch (err: any) {
          // If admin / admin1234 doesn't exist yet, register it silently
          if (isSpecialAdmin && password === 'admin1234' && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password')) {
            await createUserWithEmailAndPassword(auth, finalEmail, password);
          } else {
            throw err;
          }
        }
      }
      localStorage.removeItem('otec_manually_signed_out');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[1000] p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-3">
              <UserIcon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {isRegister ? 'Create School Account' : 'Sign In to Report Card System'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isRegister 
                ? 'Back up your report cards and sync to secure cloud storage' 
                : 'Enter details to synchronize your data in real-time'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-600">Email Address or Admin Username</label>
                {isRegister && (
                  <button
                    type="button"
                    onClick={() => setEmail('smak.angel.JS@gmail.com')}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all"
                  >
                    Use SMAK email
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. smak.angel.JS@gmail.com or admin"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/10 hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isRegister ? 'Register Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs">
            <span className="text-slate-500">
              {isRegister ? 'Already have an account?' : 'Need a school cloud account?'}
            </span>{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all"
            >
              {isRegister ? 'Sign In' : 'Register now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
