import { useEffect, useRef } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            id="modal-close-btn"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
