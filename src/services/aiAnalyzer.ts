import OpenAI from 'openai'
import type { AnalysisResult } from '../types'
import { LogProcessor, type ProcessedLog } from './logProcessor'

export class AIAnalyzer {
  private openai: OpenAI
  private model: string

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env.local file.')
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: import.meta.env.VITE_OPENAI_BASE_URL,
      dangerouslyAllowBrowser: true // Note: In production, use a backend API
    })

    this.model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo'
  }

  async analyzeLog(rawLog: string): Promise<AnalysisResult> {
    const startTime = Date.now()
    
    // Process the log first
    const processedLog = LogProcessor.process(rawLog)
    const criticalLineNumbers = LogProcessor.identifyCriticalLines(processedLog)
    
    // Create the analysis prompt
    const prompt = this.createAnalysisPrompt(processedLog, criticalLineNumbers)
    
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert JavaScript/TypeScript developer and debugging specialist. Analyze console logs and provide actionable insights for developers.

Your task is to:
1. Identify the most critical errors/issues in the log
2. Explain what each issue means in plain English
3. Provide specific, actionable fix suggestions
4. Rate your confidence in each analysis (0-100%)

Return your response as a valid JSON object with this exact structure:
{
  "criticalIssues": [
    {
      "line": number,
      "content": "exact error line",
      "explanation": "what this error means",
      "suggestion": "how to fix it",
      "confidence": number
    }
  ],
  "summary": "brief overall summary of the issues found",
  "processingTime": 0
}

Focus on the most critical 3-5 issues maximum. Be specific and actionable.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from AI')
      }

      // Parse the AI response
      let aiResult
      try {
        aiResult = JSON.parse(content)
      } catch (parseError) {
        console.error('Failed to parse AI response:', content)
        throw new Error('Invalid AI response format')
      }

      // Add processing time
      const processingTime = Date.now() - startTime
      aiResult.processingTime = processingTime

      // Validate and ensure the response matches our interface
      return this.validateAndFormatResult(aiResult, criticalLineNumbers)

    } catch (error) {
      console.error('AI Analysis failed:', error)
      
      // Fallback to rule-based analysis
      return this.fallbackAnalysis(processedLog, criticalLineNumbers, Date.now() - startTime)
    }
  }

  private createAnalysisPrompt(processedLog: ProcessedLog, criticalLines: number[]): string {
    const errorLines = processedLog.logLines
      .filter(line => criticalLines.includes(line.lineNumber))
      .slice(0, 10) // Limit context for token efficiency

    const context = errorLines.map(line => 
      `Line ${line.lineNumber}: ${line.content}`
    ).join('\n')

    return `Analyze this console log and identify the most critical issues:

CRITICAL ERRORS FOUND:
${context}

FULL LOG CONTEXT:
${processedLog.cleanedLog.slice(0, 2000)}

Please analyze these errors and provide actionable debugging guidance.`
  }

  private validateAndFormatResult(aiResult: any, criticalLines: number[]): AnalysisResult {
    // Ensure the result has the correct structure
    const result: AnalysisResult = {
      criticalIssues: [],
      summary: aiResult.summary || 'AI analysis completed',
      processingTime: aiResult.processingTime || 0
    }

    // Validate critical issues
    if (Array.isArray(aiResult.criticalIssues)) {
      result.criticalIssues = aiResult.criticalIssues
        .slice(0, 5) // Max 5 issues
        .map((issue: any) => ({
          line: typeof issue.line === 'number' ? issue.line : 1,
          content: String(issue.content || 'Unknown error'),
          explanation: String(issue.explanation || 'No explanation provided'),
          suggestion: String(issue.suggestion || 'No suggestion provided'),
          confidence: Math.min(100, Math.max(0, Number(issue.confidence) || 50))
        }))
    }

    // If no issues found, create one from critical lines
    if (result.criticalIssues.length === 0 && criticalLines.length > 0) {
      result.criticalIssues.push({
        line: criticalLines[0],
        content: 'Error detected in log',
        explanation: 'An error was detected but could not be analyzed automatically',
        suggestion: 'Review the error line and surrounding context for debugging clues',
        confidence: 30
      })
    }

    return result
  }

  private fallbackAnalysis(processedLog: ProcessedLog, criticalLines: number[], processingTime: number): AnalysisResult {
    const issues = criticalLines.slice(0, 3).map(lineNum => {
      const line = processedLog.logLines.find(l => l.lineNumber === lineNum)
      const content = line?.content || 'Unknown error'
      
      return {
        line: lineNum,
        content,
        explanation: this.getBasicExplanation(content),
        suggestion: this.getBasicSuggestion(content),
        confidence: 60
      }
    })

    return {
      criticalIssues: issues,
      summary: `Found ${issues.length} potential issues in the console log. AI analysis unavailable - using rule-based detection.`,
      processingTime
    }
  }

  private getBasicExplanation(content: string): string {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('typeerror')) {
      return 'A TypeError occurred, typically when trying to use a value as a different type than expected'
    }
    if (lowerContent.includes('referenceerror')) {
      return 'A ReferenceError occurred, usually when trying to access an undefined variable'
    }
    if (lowerContent.includes('404')) {
      return 'A resource was not found (404 error), indicating a broken link or missing file'
    }
    if (lowerContent.includes('cors')) {
      return 'A CORS (Cross-Origin Resource Sharing) error occurred, blocking a cross-origin request'
    }
    if (lowerContent.includes('network')) {
      return 'A network error occurred, possibly due to connectivity issues or server problems'
    }
    
    return 'An error was detected in the console log'
  }

  private getBasicSuggestion(content: string): string {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('typeerror')) {
      return 'Check data types and add null/undefined checks before accessing properties'
    }
    if (lowerContent.includes('referenceerror')) {
      return 'Verify variable names are spelled correctly and variables are properly declared'
    }
    if (lowerContent.includes('404')) {
      return 'Check the URL/path is correct and the resource exists on the server'
    }
    if (lowerContent.includes('cors')) {
      return 'Configure CORS headers on the server or use a proxy for development'
    }
    if (lowerContent.includes('network')) {
      return 'Check network connectivity and server status'
    }
    
    return 'Review the error context and check for common programming mistakes'
  }
}