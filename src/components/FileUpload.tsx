import { useState, useRef, DragEvent, ChangeEvent } from 'react'

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

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">Upload Console Log</h2>
      
      {/* File Upload Area */}
      <div
        className={`upload-area ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
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
          <p className="text-xl mb-2">Drop your log file here or click to browse</p>
          <p className="text-gray-600">Supports .log, .txt files or paste content below</p>
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
        <label htmlFor="log-content" className="block text-sm font-medium mb-2">
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
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            resize: 'vertical',
            minHeight: '200px'
          }}
        />
      </div>

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