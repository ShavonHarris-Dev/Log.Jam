import { useState, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { sampleLogs } from '../data/sampleLogs'

interface FileUploadProps {
  onLogUpload: (content: string) => void
  onAnalyze: () => void
  isLoading: boolean
  hasContent: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onLogUpload, 
  onAnalyze, 
  isLoading, 
  hasContent 
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [textContent, setTextContent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileRead(files[0])
    }
  }

  const handleFileRead = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setTextContent(content)
      onLogUpload(content)
    }
    reader.readAsText(file)
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileRead(files[0])
    }
  }

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setTextContent(content)
    onLogUpload(content)
  }

  const handleClear = () => {
    setTextContent('')
    onLogUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSampleLog = (sampleKey: keyof typeof sampleLogs) => {
    const sample = sampleLogs[sampleKey]
    setTextContent(sample.content)
    onLogUpload(sample.content)
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem', color: '#1f2937' }}>
        Upload Console Log
      </h2>
      
      {/* File Upload Area */}
      <div
        className={`upload-area ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
        tabIndex={0}
        role="button"
        aria-label="Click to upload file or drag and drop files here"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleUploadClick()
          }
        }}
      >
        <div>
          <svg 
            className="mx-auto mb-4" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ margin: '0 auto 1rem', color: '#6b7280' }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
          <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
            Drop your log file here or click to browse
          </p>
          <p style={{ color: '#4b5563' }}>
            Supports .log, .txt files or paste content below
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".log,.txt,.json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Text Area */}
      <div className="mt-6">
        <label htmlFor="log-content" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
          Or paste your console log content:
        </label>
        <textarea
          ref={textareaRef}
          id="log-content"
          value={textContent}
          onChange={handleTextChange}
          placeholder="Paste your console log content here..."
          rows={10}
          style={{
            width: '100%',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            resize: 'vertical',
            minHeight: '200px',
            backgroundColor: '#f9fafb',
            color: '#374151',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.outline = '3px solid #fbbf24'
            e.target.style.outlineOffset = '2px'
          }}
          onBlur={(e) => {
            e.target.style.outline = 'none'
          }}
        />
      </div>

      {/* Sample Logs */}
      {!hasContent && (
        <div className="mt-6">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            Or try a sample log:
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSampleLog('reactError')}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              React Errors
            </button>
            <button
              onClick={() => handleSampleLog('networkError')}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Network Issues
            </button>
            <button
              onClick={() => handleSampleLog('javascriptErrors')}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              JS Runtime Errors
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        {hasContent && (
          <button
            onClick={handleClear}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Clear
          </button>
        )}
        <button
          onClick={onAnalyze}
          disabled={!hasContent || isLoading}
          className="btn btn-primary"
        >
          {isLoading && <div className="loading-spinner" />}
          {isLoading ? 'Analyzing...' : 'Analyze Log'}
        </button>
      </div>
    </div>
  )
}

export default FileUpload