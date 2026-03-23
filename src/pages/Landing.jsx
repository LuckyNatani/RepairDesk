import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Layers, Workflow, BarChart3 } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-slate-200">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-semibold tracking-tight text-lg">
          <div className="w-6 h-6 bg-slate-900 rounded-sm flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          </div>
          TaskPod
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="hidden md:block text-sm text-slate-500 hover:text-slate-900 transition-colors">Features</a>
          <a href="#pricing" className="hidden md:block text-sm text-slate-500 hover:text-slate-900 transition-colors">Pricing</a>
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-medium hover:text-slate-600 transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-24 md:pt-32 pb-20 md:pb-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> TaskPod 2.0 is live
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-slate-900 mb-6 leading-[1.05]">
          Task management for<br className="hidden md:block" /> the focused team.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          A minimalist platform designed to eliminate clutter and noise. Assign, track, and complete work with absolute clarity.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-md font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]"
          >
            Start your workspace <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => window.location.href = 'mailto:admin@taskpod.com'} 
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-700 rounded-md font-medium border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
          >
            Request a demo
          </button>
        </div>
      </header>

      {/* Product Image / Mockup placeholder */}
      <section className="px-6 pb-24 md:pb-32 max-w-5xl mx-auto">
        <div className="w-full aspect-[16/10] md:aspect-video bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="h-10 border-b border-slate-100 flex items-center gap-1.5 px-4 bg-slate-50/50">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          </div>
          <div className="flex-1 bg-white p-8 flex items-center justify-center">
            <div className="text-slate-300 flex flex-col items-center gap-4">
              <Layers size={48} strokeWidth={1} />
              <p className="font-medium tracking-wide text-sm uppercase">App Interface</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">Everything you need.<br/>Nothing you don't.</h2>
              <p className="text-slate-500 text-lg max-w-xl font-light">We stripped away the complexity of traditional project management tools, leaving only what drives results.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Layers, title: 'Clean Architecture', desc: 'Organize work into logical pods without confusing hierarchies.' },
              { icon: Workflow, title: 'Intuitive Workflows', desc: 'Move tasks from idea to completion with frictionless state management.' },
              { icon: BarChart3, title: 'Actionable Insights', desc: 'Real-time analytics that focus on actual velocity, not vanity metrics.' }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-xl bg-[#FAFAFA] border border-slate-100 hover:border-slate-200 transition-colors">
                <f.icon className="w-6 h-6 text-slate-700 mb-6" strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-4">How TaskPod works</h2>
            <p className="text-slate-500 text-lg font-light">A workflow designed for human beings.</p>
          </div>
          
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-4 md:before:mx-auto before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {[
              { step: '01', title: 'Create your pod', desc: 'Set up a dedicated space for your team or project in seconds.' },
              { step: '02', title: 'Capture tasks immediately', desc: 'Use our quick-capture shortcut to log work before you forget.' },
              { step: '03', title: 'Focus and execute', desc: 'Our minimalist board view keeps everyone aligned without distractions.' }
            ].map((s, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 mx-auto relative z-10">
                  {s.step}
                </div>
                <div className="w-[calc(100%-48px)] md:w-[calc(50%-2.5rem)] p-6 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-500 font-light">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight leading-snug mb-10 text-slate-100">
            "TaskPod finally brought calm to our chaotic workflow. We spend less time managing tasks and more time actually doing the work."
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex shrink-0"></div>
            <div className="text-left">
              <div className="font-medium text-sm">Elena Rodriguez</div>
              <div className="text-slate-400 text-xs font-light">Operations Director, Studio Nord</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-lg font-light">No hidden fees. No artificial limits.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Starter</h3>
              <div className="mb-6"><span className="text-4xl font-bold tracking-tight text-slate-900">$0</span> <span className="text-slate-500 text-sm">/ forever</span></div>
              <p className="text-slate-500 text-sm mb-8 font-light leading-relaxed">Perfect for individuals and small teams just getting started.</p>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 5 team members', 'Unlimited tasks', 'Basic analytics', 'Community support'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <Check size={16} className="text-slate-400 shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/login')} 
                className="w-full mt-auto py-2.5 bg-[#FAFAFA] text-slate-900 rounded-md font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Start for free
              </button>
            </div>
            
            {/* Pro */}
            <div className="p-8 rounded-2xl bg-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-8 px-3 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-b-md">Popular</div>
              <h3 className="text-lg font-medium text-white mb-2">Professional</h3>
              <div className="mb-6"><span className="text-4xl font-bold tracking-tight text-white">$12</span> <span className="text-slate-400 text-sm">/ user / month</span></div>
              <p className="text-slate-400 text-sm mb-8 font-light leading-relaxed">For growing teams that need advanced capabilities and control.</p>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited team members', 'Advanced permissions', 'Custom workflows', 'Priority 24/7 support'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check size={16} className="text-slate-500 shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <button 
                className="w-full mt-auto py-2.5 bg-white text-slate-900 rounded-md font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 font-semibold tracking-tight text-lg mb-4 text-slate-900">
              <div className="w-5 h-5 bg-slate-900 rounded-sm flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </div>
              TaskPod
            </div>
            <p className="text-slate-500 text-sm max-w-xs font-light">
              Designed with precision. Built for focus.<br />
              Task management for high-performance teams.
            </p>
          </div>
          
          <div className="flex gap-12 md:gap-16 flex-wrap">
            <div>
              <h4 className="font-medium text-slate-900 mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-light">
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-light">
                <li><a href="#" className="hover:text-slate-900 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Blog</a></li>
                <li><a href="mailto:admin@taskpod.com" className="hover:text-slate-900 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-4 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-light">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-light">
          <p>© 2026 TaskPod. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600">Twitter</a>
            <a href="#" className="hover:text-slate-600">GitHub</a>
            <a href="#" className="hover:text-slate-600">Dribbble</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
