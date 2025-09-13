import { useState, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import LogAnalysis from './components/LogAnalysis'
import type { AnalysisResult } from './types'
import { AIAnalyzer } from './services/aiAnalyzer'
import { ToastProvider, useToast } from './context/ToastContext'
import { getSharedDataFromUrl, clearSharedDataFromUrl } from './utils/urlSharing'

function AppContent() {
  const [logContent, setLogContent] = useState<string>('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  // Check for shared data on component mount
  useEffect(() => {
    const sharedData = getSharedDataFromUrl()
    if (sharedData) {
      setLogContent(sharedData.logContent)
      setAnalysis(sharedData.analysis)
      showToast('Shared analysis loaded!', 'info')
      
      // Clean up URL
      clearSharedDataFromUrl()
    }
  }, [showToast])

  const handleLogUpload = (content: string) => {
    setLogContent(content)
    setAnalysis(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!logContent.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const analyzer = new AIAnalyzer()
      const result = await analyzer.analyzeLog(logContent)
      setAnalysis(result)
    } catch (err) {
      console.error('Analysis failed:', err)
      
      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          setError('OpenAI API key not configured. Please add your API key to the .env.local file.')
        } else if (err.message.includes('quota') || err.message.includes('billing')) {
          setError('OpenAI API quota exceeded. Please check your billing settings.')
        } else {
          setError(`Analysis failed: ${err.message}`)
        }
      } else {
        setError('Failed to analyze log. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <header className="text-center mb-12">
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
            fontWeight: '800', 
            lineHeight: '1.1',
            marginBottom: '2rem',
            color: '#ffffff'
          }}>
            One click log analysis devs <span style={{
              color: '#10b981'
            }}>love</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#f1f5f9', 
            maxWidth: '48rem', 
            margin: '0 auto 3rem',
            lineHeight: '1.6'
          }}>
            Upload your console logs and get instant AI-powered insights to debug 80% faster
          </p>
        </header>

        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <FileUpload 
            onLogUpload={handleLogUpload}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            hasContent={!!logContent.trim()}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {analysis && (
            <LogAnalysis 
              analysis={analysis}
              originalLog={logContent}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App
