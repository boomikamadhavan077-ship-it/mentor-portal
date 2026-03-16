import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Mail } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const getFriendlyError = (message: string): string => {
    if (message.toLowerCase().includes('email rate limit exceeded')) {
      return 'Too many sign-up attempts were made recently. Supabase limits confirmation emails to a few per hour on the free plan. Please wait 1 hour and try again, or ask your Supabase admin to disable "Confirm email" in Authentication settings.';
    }
    if (message.toLowerCase().includes('invalid login credentials')) {
      return 'Incorrect email or password. Please try again.';
    }
    if (message.toLowerCase().includes('user already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.toLowerCase().includes('email not confirmed')) {
      return 'Please check your inbox and confirm your email address before signing in.';
    }
    if (message.toLowerCase().includes('password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        if (!fullName.trim()) {
          throw new Error('Full name is required');
        }
        const result = await signUp(email, password, fullName);
        if (result.error) throw result.error;
        if (result.needsConfirmation) {
          setInfo('Account created! Please check your email inbox and click the confirmation link to activate your account.');
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      setError(getFriendlyError(err.message || 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Mentor Portal</h1>
        <p className="text-center text-gray-600 mb-8">
          {isLogin ? 'Sign in to manage your students' : 'Create your mentor account'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {info && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm flex gap-2">
            <Mail className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="mentor@college.edu"
              required
            />
            {!isLogin && (
              <p className="mt-1 text-xs text-gray-500">Only .aids@act.edu.in email addresses are accepted.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setInfo(''); }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}