import React from 'react'
import type { AnalysisResult } from '../types'

interface ErrorNavigationProps {
  analysis: AnalysisResult
  currentIndex: number
  onNavigate: (index: number) => void
  onJumpToLine?: (lineNumber: number) => void
}

export const ErrorNavigation: React.FC<ErrorNavigationProps> = ({
  analysis,
  currentIndex,
  onNavigate,
  onJumpToLine
}) => {
  const totalErrors = analysis.criticalIssues.length

  if (totalErrors === 0) return null

  const handlePrevious = () => {
    const newIndex = currentIndex <= 0 ? totalErrors - 1 : currentIndex - 1
    onNavigate(newIndex)
  }

  const handleNext = () => {
    const newIndex = currentIndex >= totalErrors - 1 ? 0 : currentIndex + 1
    onNavigate(newIndex)
  }

  const handleJumpToError = () => {
    if (currentIndex >= 0 && currentIndex < totalErrors && onJumpToLine) {
      const currentError = analysis.criticalIssues[currentIndex]
      onJumpToLine(currentError.line)
    }
  }

  const currentError = currentIndex >= 0 ? analysis.criticalIssues[currentIndex] : null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        marginBottom: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={handlePrevious}
          disabled={totalErrors <= 1}
          style={{
            background: 'none',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            padding: '0.5rem',
            cursor: totalErrors <= 1 ? 'not-allowed' : 'pointer',
            opacity: totalErrors <= 1 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center'
          }}
          title="Previous error"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>

        <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
          {currentIndex >= 0 ? currentIndex + 1 : 0} of {totalErrors} errors
        </span>

        <button
          onClick={handleNext}
          disabled={totalErrors <= 1}
          style={{
            background: 'none',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            padding: '0.5rem',
            cursor: totalErrors <= 1 ? 'not-allowed' : 'pointer',
            opacity: totalErrors <= 1 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center'
          }}
          title="Next error"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>

      {currentError && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', color: '#374151' }}>
            <span style={{ fontWeight: '600' }}>Line {currentError.line}:</span>{' '}
            <span style={{
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              backgroundColor: '#f3f4f6',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem'
            }}>
              {currentError.content.length > 80
                ? currentError.content.slice(0, 80) + '...'
                : currentError.content
              }
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Confidence: {currentError.confidence}%
          </div>
        </div>
      )}

      {onJumpToLine && (
        <button
          onClick={handleJumpToError}
          disabled={currentIndex < 0}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            cursor: currentIndex < 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex < 0 ? 0.5 : 1
          }}
        >
          Jump to Line
        </button>
      )}
    </div>
  )
}

export default ErrorNavigation