import { useState, useCallback } from 'react'

let _showSnackbar = null

export function useSnackbar() {
  const [snack, setSnack] = useState({ open: false, message: '', type: 'info' })

  const show = useCallback((message, type = 'info') => {
    setSnack({ open: true, message, type })
    const duration = type === 'error' ? 4000 : type === 'success' ? 2500 : 3000
    setTimeout(() => setSnack(s => ({ ...s, open: false })), duration)
  }, [])

  const dismiss = useCallback(() => setSnack(s => ({ ...s, open: false })), [])

  return { snack, show, dismiss,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info'),
    warning: (msg) => show(msg, 'warning'),
  }
}
