import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import Logo from '../components/shared/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [failCount, setFailCount] = useState(0)
  const [locked, setLocked] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const disabled = !email.trim() || !password.trim() || loading || locked

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (disabled) return
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Invalid email or password. Please try again.')
      const newCount = failCount + 1
      setFailCount(newCount)
      if (newCount >= 5) {
        setLocked(true)
        setTimeout(() => { setLocked(false); setFailCount(0) }, 30000)
      }
    }
  }

  const handleForgot = async () => {
    if (!email.trim()) { setError('Enter your email first to reset password.'); return }
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
    setForgotSent(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-10">
          <Logo className="w-16 h-16 mb-4" textClassName="text-3xl font-extrabold tracking-tighter" />
          <p className="text-slate-500 font-medium text-center">Enter your credentials to access your dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Welcome Back</h2>

          {locked && (
            <div className="bg-red-50 text-red-600 rounded-lg p-4 text-sm font-medium mb-6 animate-shake">
              Too many failed attempts. Please wait 30 seconds.
            </div>
          )}
          {error && !locked && (
            <div className="bg-red-50 text-red-600 rounded-lg p-4 text-sm font-medium mb-6">
              {error}
            </div>
          )}
          {forgotSent && (
            <div className="bg-teal-50 text-teal-700 rounded-lg p-4 text-sm font-medium mb-6">
              Password reset link sent! Check your email.
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none font-medium" 
                type="email" 
                autoComplete="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="name@company.com" 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={handleForgot}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none font-medium pr-12" 
                  type={showPw ? 'text' : 'password'} 
                  autoComplete="current-password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(v => !v)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-[#002B36] text-white font-bold rounded-xl hover:bg-[#003d4d] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-2" 
              disabled={disabled}
            >
              {loading ? 'Authenticating...' : <><LogIn size={20} /> Sign In</>}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
            <p className="text-slate-400 text-sm font-medium">Don't have an account?</p>
            <button 
              onClick={() => window.location.href = 'mailto:admin@taskpod.com'} 
              className="px-6 py-2.5 bg-white text-slate-700 font-bold rounded-lg border border-slate-200 hover:border-teal-500 hover:text-teal-600 transition-all text-sm shadow-sm"
            >
              Request Access
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
