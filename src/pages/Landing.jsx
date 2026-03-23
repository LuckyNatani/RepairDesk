import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Layers, Workflow, BarChart3 } from 'lucide-react';
import Logo from '../components/shared/Logo';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-teal-100 w-full overflow-x-hidden">
      {/* Nav */}
      <div className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full" style={{ maxWidth: '1200px' }}>
          <Logo />
          <div className="flex items-center gap-4 md:gap-8">
            <a href="#features" className="hidden md:block text-sm font-semibold text-gray-500 hover:text-black transition-colors">Features</a>
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm font-bold text-black hover:text-[#00D1B2] transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm bg-black text-white px-6 py-2.5 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/5"
            >
              Get Started
            </button>
          </div>
        </nav>
      </div>

      {/* Hero */}
      <header className="pt-24 md:pt-36 pb-20 md:pb-28 px-6 text-center w-full mx-auto" style={{ maxWidth: '900px' }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-[11px] font-bold mb-10 shadow-sm uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#00D1B2] animate-pulse"></span> TaskPod 2.0 is live
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#002B36] mb-8 leading-[1.05]">
          Work management<br className="hidden md:block" /> for focused teams.
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
          The minimalist platform designed to eliminate clutter. Assign, track, and complete work with absolute clarity.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <button 
            onClick={() => navigate('/login')} 
            className="w-full sm:w-auto px-10 py-4.5 bg-[#002B36] text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#003d4d] transition-all active:scale-95 shadow-2xl shadow-navy/20"
          >
            Start your workspace <ArrowRight size={20} />
          </button>
          <button 
            onClick={() => window.location.href = 'mailto:admin@taskpod.com'} 
            className="w-full sm:w-auto px-10 py-4.5 bg-white text-[#002B36] rounded-full font-bold text-lg border-2 border-slate-100 hover:border-[#00D1B2] hover:bg-[#FAFAFA] transition-all active:scale-95 shadow-sm"
          >
            Request a demo
          </button>
        </div>
      </header>

      {/* App Preview Section */}
      <section className="px-6 pb-24 md:pb-40 w-full mx-auto" style={{ maxWidth: '1100px' }}>
        <div className="w-full aspect-[16/10] bg-white rounded-3xl border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group transition-transform duration-700 hover:translate-y-[-8px]">
          <div className="h-14 border-b border-slate-100 flex items-center gap-2 px-8 bg-slate-50/50">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
            </div>
          </div>
          <div className="flex-1 bg-white p-12 flex flex-col items-center justify-center relative overflow-hidden">
             {/* Abstract grid background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#002B36 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="text-slate-200 flex flex-col items-center gap-8 relative z-10">
              <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
                <Layers size={48} strokeWidth={1.5} className="text-[#00D1B2]" />
              </div>
              <p className="font-bold tracking-[0.3em] text-xs uppercase text-slate-400">Collaborative Workspace</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 md:py-32 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto w-full" style={{ maxWidth: '1200px' }}>
          <div className="mb-20 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-[#002B36] mb-8">Performance-first core.</h2>
            <p className="text-slate-500 text-xl font-medium max-w-2xl leading-relaxed">We stripped away the noise of legacy management tools, leaving only the essential features that drive real-world results.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Layers, title: 'Clean Architecture', desc: 'Organize work into logical pods without the confusing nesting of old enterprise tools.', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Workflow, title: 'Intuitive Workflows', desc: 'Move tasks through states with frictionless precision and automatic field dispatch.', color: 'text-teal-500', bg: 'bg-teal-50' },
              { icon: BarChart3, title: 'Actionable Insights', desc: 'Real-time velocity tracking that focuses on completion quality, not just vanity metrics.', color: 'text-indigo-500', bg: 'bg-indigo-50' }
            ].map((f, i) => (
              <div key={i} className="p-12 rounded-[2.5rem] bg-[#FAFAFA] border border-slate-100 hover:border-[#00D1B2] transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 group">
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110`}>
                  <f.icon className={`w-7 h-7 ${f.color}`} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-[#002B36] mb-5">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-lg">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps / Process */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-6xl mx-auto w-full" style={{ maxWidth: '1200px' }}>
          <div className="text-center mb-28">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#002B36] mb-6">Designed for real work.</h2>
            <p className="text-slate-500 text-xl font-medium">Capture, assign, and track in three simple actions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            {[
              { step: '01', title: 'Define your pod', desc: 'Create a dedicated workspace for your project in under 10 seconds.' },
              { step: '02', title: 'Dispatch instantly', desc: 'Capture tasks and route them to field teams with GPS-precision.' },
              { step: '03', title: 'Measure impact', desc: 'Analyze completion rates and optimize your team velocity in real-time.' }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-3xl bg-white border-2 border-slate-100 flex items-center justify-center font-black text-2xl text-[#002B36] mb-10 shadow-sm group-hover:border-[#00D1B2] transition-colors duration-300">
                  {s.step}
                </div>
                <h3 className="text-2xl font-bold text-[#002B36] mb-5">{s.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-lg">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 md:py-48 px-6 bg-[#002B36] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00D1B2]/10 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-3xl md:text-6xl font-bold tracking-tight leading-[1.15] mb-20 text-white">
            "TaskPod brought sanity to our fleet operation. It's the only tool that actually understands the speed of field work."
          </p>
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#00D1B2] rounded-[2rem] flex items-center justify-center shadow-xl shadow-teal-500/20">
              <span className="text-2xl font-black text-[#002B36]">ER</span>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl mb-1">Elena Rodriguez</div>
              <div className="text-[#00D1B2] text-xs font-bold tracking-[0.2em] uppercase">Operations Director, Studio Nord</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 md:py-48 px-6 text-center bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold mb-10 text-[#002B36] tracking-tighter">Ready to gain total clarity?</h2>
          <p className="text-slate-500 text-xl font-medium mb-12">Join 400+ field teams focused on results.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-14 py-5.5 bg-[#002B36] text-white rounded-full font-bold text-xl hover:bg-[#003d4d] transition-all hover:scale-105 shadow-[0_20px_40px_-10px_rgba(0,43,54,0.3)]"
          >
            Start your workspace free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-12">
          <Logo textClassName="text-2xl font-bold" />
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-[#002B36] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#002B36] transition-colors">GitHub</a>
            <a href="mailto:admin@taskpod.com" className="hover:text-[#002B36] transition-colors">Contact</a>
          </div>
          <div className="text-slate-400 text-sm font-medium">
            © 2026 TaskPod. Built for focus.
          </div>
        </div>
      </footer>
    </div>
  );
}
