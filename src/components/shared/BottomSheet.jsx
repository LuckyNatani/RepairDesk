import { useEffect } from 'react'

export default function BottomSheet({ open, onClose, children, title = null }) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  return (
    <>
      <div className="bottom-sheet-backdrop" onClick={onClose} />
      <div className="bottom-sheet">
        <div className="bottom-sheet-handle" />
        {title && (
          <div style={{ padding: '4px 20px 12px', borderBottom: '1px solid #F0F0F0' }}>
            <p style={{ margin: 0, fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--grey-900)' }}>{title}</p>
          </div>
        )}
        <div style={{ padding: '16px 20px' }}>
          {children}
        </div>
      </div>
    </>
  )
}
