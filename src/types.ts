export interface AnalysisResult {
  criticalIssues: Array<{
    line: number
    content: string
    explanation: string
    suggestion: string
    confidence: number
  }>
  summary: string
  processingTime: number
}