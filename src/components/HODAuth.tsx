import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Eye, EyeOff, GraduationCap } from 'lucide-react';

interface HODAuthProps {
  onLogin: () => void;
  onBack: () => void;
}

export default function HODAuth({ onLogin, onBack }: HODAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !data.user) {
      setError('Invalid HOD credentials. Please check your email and password.');
      setLoading(false);
      return;
    }

    // Check this user is actually a HOD (not a mentor)
    const { data: mentorRow } = await supabase
      .from('mentors')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (mentorRow) {
      await supabase.auth.signOut();
      setError('This email is registered as a mentor, not HOD.');
      setLoading(false);
      return;
    }

    // Save HOD profile to hod_profiles table
    await supabase.from('hod_profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name || 'HOD',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    sessionStorage.setItem('hod_authenticated', 'true');
    sessionStorage.setItem('hod_email', email.trim().toLowerCase());
    onLogin();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-8 pt-10 pb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">HOD Portal</h1>
            <p className="text-purple-200 text-sm">Head of Department — Secure Access</p>
          </div>
          <div className="px-8 py-8">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Sign in to your HOD account</h2>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HOD Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="hod@college.edu"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-3 rounded-xl font-semibold hover:from-purple-800 hover:to-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
              >
                {loading ? 'Verifying…' : 'Sign In as HOD'}
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <button onClick={onBack} className="text-sm text-gray-500 hover:text-purple-700 font-medium transition">
                ← Back to Mentor Portal
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Authorised personnel only · Mentor Portal System</p>
      </div>
    </div>
  );
}