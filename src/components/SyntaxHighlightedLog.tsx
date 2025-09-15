import React, { useMemo, useState } from 'react'
import { logHighlighter, type HighlightedLine, type LogToken } from '../utils/logSyntaxHighlighter'
import type { AnalysisResult } from '../types'

interface SyntaxHighlightedLogProps {
  logContent: string
  analysis?: AnalysisResult
  showFullLog?: boolean
  currentErrorIndex?: number
  onErrorNavigate?: (index: number) => void
}

const TOKEN_STYLES: Record<LogToken['type'], React.CSSProperties> = {
  timestamp: { color: '#10b981', fontWeight: '500' }, // green
  level: { color: '#f59e0b', fontWeight: '700' }, // amber
  error: { color: '#ef4444', fontWeight: '600' }, // red
  warning: { color: '#f97316', fontWeight: '600' }, // orange
  info: { color: '#3b82f6', fontWeight: '500' }, // blue
  url: { color: '#8b5cf6', textDecoration: 'underline' }, // purple
  file: { color: '#06b6d4', fontStyle: 'italic' }, // cyan
  number: { color: '#ec4899' }, // pink
  string: { color: '#22c55e' }, // green
  stacktrace: { color: '#94a3b8', fontStyle: 'italic' }, // slate
  text: { color: '#f9fafb' } // white
}

const LINE_LEVEL_STYLES: Record<HighlightedLine['level'], React.CSSProperties> = {
  error: { backgroundColor: '#dc262620', borderLeft: '3px solid #ef4444' },
  warning: { backgroundColor: '#f9731620', borderLeft: '3px solid #f97316' },
  info: { backgroundColor: '#3b82f620', borderLeft: '3px solid #3b82f6' },
  debug: { backgroundColor: '#64748b20', borderLeft: '3px solid #64748b' },
  normal: {}
}

export const SyntaxHighlightedLog: React.FC<SyntaxHighlightedLogProps> = ({
  logContent,
  analysis,
  showFullLog = false,
  currentErrorIndex = -1,
  onErrorNavigate
}) => {
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set())

  const highlightedLines = useMemo(() => {
    const lines = logContent.split('\n')
    return lines.map((line, index) => logHighlighter.highlightLine(line, index + 1))
  }, [logContent])

  const displayLines = showFullLog ? highlightedLines : highlightedLines.slice(0, 20)

  const criticalLines = useMemo(() => {
    if (!analysis) return new Set()
    return new Set(analysis.criticalIssues.map(issue => issue.line))
  }, [analysis])

  const toggleLineExpansion = (lineNumber: number) => {
    const newExpanded = new Set(expandedLines)
    if (newExpanded.has(lineNumber)) {
      newExpanded.delete(lineNumber)
    } else {
      newExpanded.add(lineNumber)
    }
    setExpandedLines(newExpanded)
  }

  const isCurrentError = (lineNumber: number) => {
    if (!analysis || currentErrorIndex < 0) return false
    return analysis.criticalIssues[currentErrorIndex]?.line === lineNumber
  }

  const renderToken = (token: LogToken, key: string) => (
    <span
      key={key}
      style={TOKEN_STYLES[token.type]}
    >
      {token.content}
    </span>
  )

  const renderLine = (highlightedLine: HighlightedLine) => {
    const { tokens, lineNumber, level } = highlightedLine
    const isCritical = criticalLines.has(lineNumber)
    const isCurrent = isCurrentError(lineNumber)
    const isExpanded = expandedLines.has(lineNumber)

    const lineStyle: React.CSSProperties = {
      display: 'flex',
      padding: '0.125rem 0.25rem',
      margin: '0 -0.25rem',
      position: 'relative',
      ...LINE_LEVEL_STYLES[level],
      ...(isCritical && {
        backgroundColor: isCurrent ? '#dc262640' : '#dc262620',
        borderLeft: '3px solid #ef4444'
      })
    }

    if (isCurrent) {
      lineStyle.boxShadow = '0 0 0 2px #ef4444'
      lineStyle.borderRadius = '0.25rem'
    }

    const hasLongContent = highlightedLine.originalContent.length > 120

    return (
      <div
        key={lineNumber}
        style={lineStyle}
        data-line={lineNumber}
        id={`line-${lineNumber}`}
      >
        <span
          style={{
            color: '#6b7280',
            marginRight: '1rem',
            minWidth: '3rem',
            textAlign: 'right',
            userSelect: 'none',
            fontWeight: isCritical ? '600' : '400'
          }}
        >
          {lineNumber}
        </span>

        {isCritical && (
          <span
            style={{
              color: '#ef4444',
              marginRight: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            ⚠
          </span>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: hasLongContent && !isExpanded ? '-webkit-box' : 'block',
              WebkitLineClamp: hasLongContent && !isExpanded ? 1 : 'none',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-all'
            }}
          >
            {tokens.map((token, tokenIndex) =>
              renderToken(token, `${lineNumber}-${tokenIndex}`)
            )}
          </div>

          {hasLongContent && (
            <button
              onClick={() => toggleLineExpansion(lineNumber)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.75rem',
                cursor: 'pointer',
                marginTop: '0.25rem',
                padding: '0'
              }}
            >
              {isExpanded ? 'Show less' : 'Show more...'}
            </button>
          )}
        </div>

        {isCritical && onErrorNavigate && (
          <button
            onClick={() => {
              const errorIndex = analysis?.criticalIssues.findIndex(issue => issue.line === lineNumber) ?? -1
              if (errorIndex >= 0) onErrorNavigate(errorIndex)
            }}
            style={{
              background: 'none',
              border: '1px solid #ef4444',
              color: '#ef4444',
              fontSize: '0.75rem',
              borderRadius: '0.25rem',
              padding: '0.125rem 0.5rem',
              marginLeft: '0.5rem',
              cursor: 'pointer'
            }}
          >
            View Issue
          </button>
        )}
      </div>
    )
  }

  return (
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
      {displayLines.map((line) => renderLine(line))}

      {!showFullLog && highlightedLines.length > 20 && (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
          ... {highlightedLines.length - 20} more lines (click "Show Full Log" to see all)
        </div>
      )}
    </div>
  )
}

export default SyntaxHighlightedLog