/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import { Snackbar, Alert } from '@mui/material'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('success') // 'success' | 'error' | 'info' | 'warning'

  const show = useCallback((msg, type = 'success') => {
    setMessage(msg)
    setSeverity(type)
    setOpen(true)
  }, [])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ mb: 8 }}>
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx.show
}
