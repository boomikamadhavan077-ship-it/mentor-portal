import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, MailCheck, Shield } from 'lucide-react';

interface AuthProps {
  onHODLogin: () => void;
}

export default function Auth({ onHODLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { signIn, signUp } = useAuth();

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const extractCooldownSeconds = (message: string): number => {
    const match = message.match(/after (\d+) seconds/);
    return match ? parseInt(match[1]) + 2 : 60;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        if (!fullName.trim()) {
          throw new Error('Full name is required');
        }
        if (!email.endsWith('.aids@act.edu.in')) {
          throw new Error('Only .aids@act.edu.in email addresses are accepted');
        }
        const { error, needsConfirmation } = await signUp(email, password, fullName);
        if (error) throw error;
        if (needsConfirmation) {
          setConfirmationSent(true);
          return;
        }
      }
    } catch (err: any) {
      const message = err.message || 'An error occurred';
      if (message.includes('after') && message.includes('seconds')) {
        const secs = extractCooldownSeconds(message);
        startCooldown(secs);
        setError(`Please wait ${secs} seconds before trying again.`);
      } else if (message.includes('already registered') || message.includes('already been registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <MailCheck className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Check your email</h2>
          <p className="text-gray-600 mb-2">A confirmation link has been sent to</p>
          <p className="font-semibold text-blue-600 mb-6">{email}</p>
          <p className="text-sm text-gray-500 mb-8">
            Click the link in the email to activate your account. Check your spam folder if you don't see it.
          </p>
          <button
            onClick={() => {
              setConfirmationSent(false);
              setIsLogin(true);
              setEmail('');
              setPassword('');
              setFullName('');
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
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
              <p className="text-xs text-gray-500 mt-1">Only .aids@act.edu.in email addresses are accepted.</p>
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
            disabled={loading || cooldown > 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Please wait...'
              : cooldown > 0
              ? `Wait ${cooldown}s...`
              : isLogin
              ? 'Sign In'
              : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setCooldown(0); }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onHODLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-sm"
          >
            <Shield className="w-5 h-5" />
            Login as HOD (Head of Department)
          </button>
        </div>
      </div>
    </div>
  );
}