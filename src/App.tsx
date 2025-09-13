import { useState } from 'react'
import FileUpload from './components/FileUpload'
import LogAnalysis from './components/LogAnalysis'
import type { AnalysisResult } from './types'

function App() {
  const [logContent, setLogContent] = useState<string>('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      // TODO: Replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // Mock analysis result for now
      const mockAnalysis: AnalysisResult = {
        criticalIssues: [
          {
            line: 15,
            content: "TypeError: Cannot read property 'id' of undefined",
            explanation: "Attempting to access the 'id' property on an undefined object, likely due to an API response not containing expected data.",
            suggestion: "Add null/undefined checks before accessing object properties. Use optional chaining (?.) or verify API response structure.",
            confidence: 95
          },
          {
            line: 23,
            content: "Failed to load resource: the server responded with a status of 404 (Not Found)",
            explanation: "A network request is failing because the requested resource doesn't exist on the server.",
            suggestion: "Check the API endpoint URL and ensure the resource exists. Verify the request path and server configuration.",
            confidence: 90
          }
        ],
        summary: "Found 2 critical issues: 1 JavaScript runtime error and 1 network failure. The TypeError suggests missing data validation, while the 404 error indicates a broken API endpoint.",
        processingTime: 1850
      }

      setAnalysis(mockAnalysis)
    } catch (err) {
      setError('Failed to analyze log. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI Console Log Analyzer
          </h1>
          <p className="text-xl text-gray-600" style={{ maxWidth: '48rem', margin: '0 auto' }}>
            Upload your console logs and get instant AI-powered insights to debug faster
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

export default App
