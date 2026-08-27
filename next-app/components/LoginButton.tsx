'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { LogOut, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user?.image ? (
            <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
              {session.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{session.user?.name}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 text-sm font-medium bg-white/50 dark:bg-gray-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 hover:text-red-600 dark:text-gray-300 px-4 py-2 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Handle Login
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password");
        } else {
          router.refresh();
        }
      } else {
        // Handle Register
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText);
        }

        // Auto login after register
        const loginRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        
        if (!loginRes?.error) {
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="text-red-500 text-sm font-medium text-center bg-red-100 p-2 rounded-lg">{error}</div>}
        
        {!isLogin && (
          <div className="relative">
            <UserIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Username"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/80 dark:bg-gray-700/80 border-none shadow-inner p-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>
        )}
        
        <div className="relative">
          <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/80 dark:bg-gray-700/80 border-none shadow-inner p-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          />
        </div>

        <div className="relative">
          <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/80 dark:bg-gray-700/80 border-none shadow-inner p-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
        </button>
      </form>

      <button 
        onClick={() => { setIsLogin(!isLogin); setError(''); }}
        className="w-full mt-4 text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
