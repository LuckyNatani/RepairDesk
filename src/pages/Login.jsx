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
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[440px]">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <Logo className="w-14 h-14 mb-5" textClassName="text-3xl font-bold tracking-tight" />
          <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-[300px]">
            Welcome back to TaskPod. Enter your credentials to access your workspace.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] p-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-[#002B36] mb-8">Sign In</h2>

          {locked && (
            <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm font-bold mb-6">
              Security Lock: Too many attempts. Try again in 30s.
            </div>
          )}
          {error && !locked && (
            <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm font-bold mb-6">
              {error}
            </div>
          )}
          {forgotSent && (
            <div className="bg-[#E6FBFA] text-[#00D1B2] rounded-xl p-4 text-sm font-bold mb-6">
              Reset link sent! Please check your inbox.
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2.5">Email Address</label>
              <input 
                className="w-full px-5 py-4 bg-[#FAFAFA] border border-slate-100 rounded-2xl focus:border-[#00D1B2] focus:ring-4 focus:ring-[#00D1B2]/5 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-300" 
                type="email" 
                autoComplete="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="name@company.com" 
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Password</label>
                <button 
                  type="button" 
                  onClick={handleForgot}
                  className="text-xs font-bold text-[#00D1B2] hover:text-[#00bda1] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input 
                  className="w-full px-5 py-4 bg-[#FAFAFA] border border-slate-100 rounded-2xl focus:border-[#00D1B2] focus:ring-4 focus:ring-[#00D1B2]/5 transition-all outline-none font-medium pr-14 text-slate-900 placeholder:text-slate-300" 
                  type={showPw ? 'text' : 'password'} 
                  autoComplete="current-password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(v => !v)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4.5 bg-[#002B36] text-white font-bold rounded-2xl hover:bg-[#003d4d] transition-all shadow-xl shadow-navy/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3 mt-4" 
              disabled={disabled}
            >
              {loading ? 'Verifying...' : <><LogIn size={20} /> Sign In</>}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center gap-5">
            <p className="text-slate-400 text-sm font-medium">Don't have an account yet?</p>
            <button 
              onClick={() => window.location.href = 'mailto:admin@taskpod.com'} 
              className="w-full py-3.5 bg-white text-[#002B36] font-bold rounded-2xl border-2 border-slate-50 hover:border-[#00D1B2] hover:bg-[#FAFAFA] transition-all text-sm shadow-sm"
            >
              Request Access
            </button>
          </div>
        </div>
        
        <p className="mt-12 text-center text-slate-300 text-xs font-medium uppercase tracking-[0.2em]">
          © 2026 TaskPod Systems
        </p>
      </div>
    </div>
  )
}
