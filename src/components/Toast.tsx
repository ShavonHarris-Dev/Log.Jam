import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  if (!isVisible) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10b981',
          color: 'white',
          icon: '✅'
        }
      case 'error':
        return {
          backgroundColor: '#ef4444',
          color: 'white',
          icon: '❌'
        }
      case 'info':
        return {
          backgroundColor: '#3b82f6',
          color: 'white',
          icon: 'ℹ️'
        }
      default:
        return {
          backgroundColor: '#6b7280',
          color: 'white',
          icon: '📋'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        minWidth: '200px',
        animation: isVisible ? 'slideIn 0.3s ease-out' : 'slideOut 0.3s ease-in',
        fontSize: '0.875rem',
        fontWeight: '500'
      }}
      onClick={onClose}
      role="alert"
    >
      <span>{styles.icon}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '4px',
          fontSize: '1rem',
          opacity: 0.7
        }}
        aria-label="Close notification"
      >
        ×
      </button>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default Toast