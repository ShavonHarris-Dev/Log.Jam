import { useState } from 'react'
import type { AnalysisResult } from '../types'
import { useToast } from '../context/ToastContext'
import { generateShareableUrl } from '../utils/urlSharing'

interface LogAnalysisProps {
  analysis: AnalysisResult
  originalLog: string
}

const LogAnalysis: React.FC<LogAnalysisProps> = ({ analysis, originalLog }) => {
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null)
  const [showFullLog, setShowFullLog] = useState(false)
  const { showToast } = useToast()

  const toggleIssue = (index: number) => {
    setExpandedIssue(expandedIssue === index ? null : index)
  }

  const copyToClipboard = async (text: string, successMessage = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text)
      showToast(successMessage, 'success')
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  const handleShareAnalysis = async () => {
    try {
      const shareUrl = generateShareableUrl(originalLog, analysis)
      await copyToClipboard(shareUrl, 'Share link copied to clipboard!')
    } catch (err) {
      showToast('Failed to create share link', 'error')
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return '#10b981'
    if (confidence >= 70) return '#f59e0b'
    return '#ef4444'
  }

  const logLines = originalLog.split('\n')

  return (
    <div className="mt-8">
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Analysis Summary</h2>
        <p className="text-gray-900 mb-4">{analysis.summary}</p>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: '#6b7280' }}>
          <span>{analysis.criticalIssues.length} critical issues found</span>
          <span>Analysis completed in {analysis.processingTime}ms</span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-6">Critical Issues</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {analysis.criticalIssues.map((issue, index) => (
            <div 
              key={index}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}
            >
              <div
                onClick={() => toggleIssue(index)}
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  backgroundColor: '#f9fafb',
                  borderBottom: expandedIssue === index ? '1px solid #e5e7eb' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Line {issue.line}
                      </span>
                      <span 
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: getConfidenceColor(issue.confidence) + '20',
                          color: getConfidenceColor(issue.confidence)
                        }}
                      >
                        {issue.confidence}% confidence
                      </span>
                    </div>
                    <code 
                      style={{
                        display: 'block',
                        padding: '0.5rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        color: '#dc2626'
                      }}
                    >
                      {issue.content}
                    </code>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      marginLeft: '1rem',
                      transform: expandedIssue === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </div>
              </div>

              {expandedIssue === index && (
                <div style={{ padding: '1rem' }}>
                  <div className="mb-4">
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Explanation</h4>
                    <p className="text-gray-900">{issue.explanation}</p>
                  </div>
                  <div className="mb-4">
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Suggested Fix</h4>
                    <p className="text-gray-900">{issue.suggestion}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(
                      `Line ${issue.line}: ${issue.content}\n\nExplanation: ${issue.explanation}\n\nSuggested Fix: ${issue.suggestion}`,
                      'Issue details copied!'
                    )}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    Copy Issue Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="text-xl font-bold">Original Log</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowFullLog(!showFullLog)}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              {showFullLog ? 'Show Less' : 'Show Full Log'}
            </button>
            <button
              onClick={() => copyToClipboard(originalLog, 'Log copied to clipboard!')}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Copy Log
            </button>
          </div>
        </div>
        
        <div
          style={{
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            maxHeight: showFullLog ? 'none' : '400px',
            overflow: 'auto',
            lineHeight: '1.5'
          }}
        >
          {logLines.slice(0, showFullLog ? logLines.length : 20).map((line, index) => {
            const lineNumber = index + 1
            const isHighlighted = analysis.criticalIssues.some(issue => issue.line === lineNumber)
            
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  backgroundColor: isHighlighted ? '#dc262620' : 'transparent',
                  padding: '0.125rem 0.25rem',
                  margin: '0 -0.25rem'
                }}
              >
                <span
                  style={{
                    color: '#6b7280',
                    marginRight: '1rem',
                    minWidth: '3rem',
                    textAlign: 'right',
                    userSelect: 'none'
                  }}
                >
                  {lineNumber}
                </span>
                <span style={{ color: isHighlighted ? '#fca5a5' : '#f9fafb' }}>
                  {line || ' '}
                </span>
              </div>
            )
          })}
          {!showFullLog && logLines.length > 20 && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
              ... {logLines.length - 20} more lines (click "Show Full Log" to see all)
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Export & Share Analysis</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleShareAnalysis}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            🔗 Share Analysis
          </button>
          <button
            onClick={() => {
              const summary = `# Console Log Analysis Report

## Summary
${analysis.summary}

## Critical Issues Found: ${analysis.criticalIssues.length}

${analysis.criticalIssues.map((issue, i) => 
                `### Issue ${i + 1} (Line ${issue.line})
**Error:** \`${issue.content}\`

**Explanation:** ${issue.explanation}

**Suggested Fix:** ${issue.suggestion}

**Confidence:** ${issue.confidence}%

---

`
              ).join('')}## Processing Time
${analysis.processingTime}ms`
              
              copyToClipboard(summary, 'Markdown report copied!')
            }}
            className="btn btn-primary"
          >
            Copy as Markdown
          </button>
          <button
            onClick={() => {
              const summary = `Console Log Analysis Report

Summary: ${analysis.summary}

Critical Issues Found: ${analysis.criticalIssues.length}

${analysis.criticalIssues.map((issue, i) => 
                `Issue ${i + 1} (Line ${issue.line}):
Error: ${issue.content}
Explanation: ${issue.explanation}
Suggested Fix: ${issue.suggestion}
Confidence: ${issue.confidence}%

`
              ).join('')}Processing Time: ${analysis.processingTime}ms`
              
              copyToClipboard(summary, 'Text report copied!')
            }}
            className="btn btn-secondary"
          >
            Copy as Text
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogAnalysis