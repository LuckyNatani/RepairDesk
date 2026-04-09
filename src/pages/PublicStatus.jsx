import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Logo from '../components/shared/Logo'
import { CheckCircle2, Clock, MessageSquare, AlertCircle, Phone, Search, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

export default function PublicStatus() {
  const { taskId } = useParams()
  const [phoneDigits, setPhoneDigits] = useState('')
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [verified, setVerified] = useState(false)

  const verifyAndFetch = async (e) => {
    if (e) e.preventDefault()
    if (phoneDigits.length !== 4) {
      setError('Please enter exactly 4 digits.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc('get_public_task_status', {
        p_task_id: taskId,
        p_phone_digits: phoneDigits
      })

      if (rpcError) throw rpcError
      if (!data) {
        setError('Verification failed. Please check the digits and try again.')
      } else {
        setTask(data)
        setVerified(true)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to fetch task details. Secure link may be invalid.')
    } finally {
      setLoading(false)
    }
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
        <Logo className="w-12 h-12 mb-8" />
        <div className="card max-w-md w-full shadow-xl" style={{ padding: '32px 24px' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Track Your Service</h2>
          <p className="text-gray-500 text-sm mb-8 text-center">
            For security, please enter the <strong>last 4 digits</strong> of the phone number registered for this repair.
          </p>

          <form onSubmit={verifyAndFetch} className="space-y-6">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="0000"
                maxLength={4}
                className="input pl-10 text-center text-xl tracking-[0.5em] font-mono"
                value={phoneDigits}
                onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
              disabled={loading || phoneDigits.length !== 4}
            >
              {loading ? 'Verifying...' : (
                <>Track Status <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
        <p className="mt-8 text-gray-400 text-xs text-center">
          TaskPod Secure Repair Tracking<br />
          Contact the shop if you haven't received a tracking ID.
        </p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--green)'
      case 'in_progress': return 'var(--blue)'
      default: return 'var(--gray-400)'
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Public Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" textClassName="hidden" />
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">TaskPod</h1>
            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-semibold">Service Tracking</p>
          </div>
        </div>
        <div className="bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#DCFCE7]">
          <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wide">Live</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-8 space-y-6 pb-24">
        {/* Task Summary Card */}
        <div className="card shadow-sm border-none overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Repair #{task.task_number}</p>
                <h2 className="text-2xl font-bold text-gray-900">{task.service_type_label || 'Device Repair'}</h2>
              </div>
              <div 
                className="px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-sm"
                style={{ backgroundColor: getStatusColor(task.status) }}
              >
                {task.status.replace('_', ' ')}
              </div>
            </div>
            <p className="text-gray-600 text-sm italic">{task.service_description || 'No description available.'}</p>
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Search size={14} />
              <span>Registered to: <strong>{task.customer_name}</strong> at <strong>{task.business_name}</strong></span>
            </div>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Clock size={14} className="text-gray-400" /> Progress Timeline
            </h3>
            <div className="card p-6 space-y-6">
              {task.events?.map((ev, i) => (
                <div key={i} className="relative flex gap-4">
                  {/* Joiner line */}
                  {i < task.events.length - 1 && (
                    <div className="absolute left-[9px] top-[24px] bottom-[-24px] w-[2px] bg-gray-100"></div>
                  )}
                  <div className={`mt-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm flex-shrink-0 z-10 ${i === task.events.length - 1 ? 'bg-teal-500 scale-110 ring-4 ring-teal-50' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className={`text-sm font-bold ${i === task.events.length - 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                      {ev.type === 'created' ? 'Service Ticket Created' : 
                       ev.type === 'assigned' ? 'Assigned to Technician' :
                       ev.type === 'completed' ? 'Repair Completed' :
                       ev.type === 'status_changed' ? 'Status Updated' : ev.type}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {format(new Date(ev.created_at), 'MMM d, h:mm a')}
                    </p>
                    {ev.note && <p className="text-xs text-gray-500 mt-1 italic">"{ev.note}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technician Remarks */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <MessageSquare size={14} className="text-gray-400" /> Service Remarks
            </h3>
            <div className="card p-4 bg-[#F8FAFC] border-none space-y-4">
              {task.remarks?.filter(r => !r.is_system).length > 0 ? (
                task.remarks.filter(r => !r.is_system).map((rem, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-xs text-gray-800 leading-relaxed mb-2 font-medium">"{rem.text}"</p>
                    <div className="flex justify-between items-center opacity-60">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Technician: {rem.author_name}</span>
                      <span className="text-[10px] tabular-nums font-medium">{format(new Date(rem.created_at), 'MMM d')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <MessageSquare size={20} className="text-slate-300" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium italic">No public remarks from the tech yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="text-center pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Powered by <strong>TaskPod</strong> — Multi-tenant Field Service
          </p>
        </div>
      </main>

      {/* Floating Action Bar (Optional) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl rounded-2xl p-3 flex items-center gap-4 z-20">
        <div className="bg-teal-50 p-2 rounded-xl">
          <Phone size={18} className="text-teal-600" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Need Help?</p>
          <p className="text-[13px] font-bold text-gray-900">Contact Repair Shop</p>
        </div>
        <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-colors" title="Reload Status" onClick={() => window.location.reload()}>
          <Clock size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  )
}
