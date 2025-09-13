import type { AnalysisResult } from '../types'

export interface SharedAnalysis {
  logContent: string
  analysis: AnalysisResult
  timestamp: number
}

// Compress data for URL sharing
export const compressAnalysisForUrl = (logContent: string, analysis: AnalysisResult): string => {
  const data: SharedAnalysis = {
    logContent,
    analysis,
    timestamp: Date.now()
  }
  
  try {
    // Convert to JSON and compress using base64
    const jsonString = JSON.stringify(data)
    const compressed = btoa(encodeURIComponent(jsonString))
    
    // If the URL gets too long, truncate the log content
    if (compressed.length > 8000) {
      const truncatedData: SharedAnalysis = {
        ...data,
        logContent: logContent.slice(0, 2000) + '\n\n... (log truncated for sharing)'
      }
      const truncatedJson = JSON.stringify(truncatedData)
      return btoa(encodeURIComponent(truncatedJson))
    }
    
    return compressed
  } catch (error) {
    console.error('Failed to compress analysis:', error)
    throw new Error('Failed to create shareable link')
  }
}

// Decompress data from URL
export const decompressAnalysisFromUrl = (compressed: string): SharedAnalysis | null => {
  try {
    const jsonString = decodeURIComponent(atob(compressed))
    const data = JSON.parse(jsonString) as SharedAnalysis
    
    // Validate the data structure
    if (!data.logContent || !data.analysis || !data.timestamp) {
      throw new Error('Invalid data structure')
    }
    
    // Check if the link is too old (7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    if (data.timestamp < sevenDaysAgo) {
      throw new Error('Shared link has expired')
    }
    
    return data
  } catch (error) {
    console.error('Failed to decompress analysis:', error)
    return null
  }
}

// Generate shareable URL
export const generateShareableUrl = (logContent: string, analysis: AnalysisResult): string => {
  const compressed = compressAnalysisForUrl(logContent, analysis)
  const currentUrl = new URL(window.location.href)
  currentUrl.searchParams.set('shared', compressed)
  return currentUrl.toString()
}

// Check if current URL has shared data
export const getSharedDataFromUrl = (): SharedAnalysis | null => {
  const urlParams = new URLSearchParams(window.location.search)
  const sharedData = urlParams.get('shared')
  
  if (!sharedData) return null
  
  return decompressAnalysisFromUrl(sharedData)
}

// Clear shared data from URL
export const clearSharedDataFromUrl = (): void => {
  const url = new URL(window.location.href)
  url.searchParams.delete('shared')
  window.history.replaceState({}, '', url.toString())
}