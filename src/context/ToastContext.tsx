import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import Toast from '../components/Toast'

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
    isVisible: boolean
  } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => prev ? { ...prev, isVisible: false } : null)
    // Clear the toast after animation
    setTimeout(() => setToast(null), 300)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  )
}