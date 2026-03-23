import { MessageCircle } from 'lucide-react'
import { generateWhatsAppMessage, openWhatsApp } from '../../lib/whatsappShare'

export default function WhatsAppShareButton({ task, assignedStaffName = null, compact = false }) {
  const handleShare = () => {
    const msg = generateWhatsAppMessage(task, assignedStaffName)
    openWhatsApp(msg)
  }
  if (compact) {
    return (
      <button onClick={handleShare} style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }} aria-label="Share via WhatsApp">
        <MessageCircle size={20} />
      </button>
    )
  }
  return (
    <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, width: '100%', justifyContent: 'center' }}>
      <MessageCircle size={16} /> Share via WhatsApp
    </button>
  )
}
