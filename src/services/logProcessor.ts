export interface ProcessedLog {
  originalLog: string
  cleanedLog: string
  logLines: Array<{
    lineNumber: number
    content: string
    timestamp?: string
    logLevel?: 'error' | 'warning' | 'info' | 'debug'
    isError: boolean
  }>
}

export class LogProcessor {
  static process(rawLog: string): ProcessedLog {
    const lines = rawLog.split('\n')
    const logLines = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const lineData = {
        lineNumber: i + 1,
        content: line,
        timestamp: this.extractTimestamp(line),
        logLevel: this.detectLogLevel(line),
        isError: this.isErrorLine(line)
      }

      logLines.push(lineData)
    }

    const cleanedLog = this.removeNoiseFromLog(rawLog)

    return {
      originalLog: rawLog,
      cleanedLog,
      logLines
    }
  }

  private static extractTimestamp(line: string): string | undefined {
    // Match various timestamp formats
    const timestampPatterns = [
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/, // ISO format
      /\d{2}:\d{2}:\d{2}.\d{3}/, // Time only
      /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, // Simple datetime
      /\[\d{2}:\d{2}:\d{2}.\d{3}\]/, // Bracketed time
    ]

    for (const pattern of timestampPatterns) {
      const match = line.match(pattern)
      if (match) return match[0]
    }

    return undefined
  }

  private static detectLogLevel(line: string): 'error' | 'warning' | 'info' | 'debug' | undefined {
    const lowerLine = line.toLowerCase()
    
    if (lowerLine.includes('error') || lowerLine.includes('exception') || lowerLine.includes('fatal')) {
      return 'error'
    }
    if (lowerLine.includes('warning') || lowerLine.includes('warn')) {
      return 'warning'  
    }
    if (lowerLine.includes('info')) {
      return 'info'
    }
    if (lowerLine.includes('debug') || lowerLine.includes('trace')) {
      return 'debug'
    }

    return undefined
  }

  private static isErrorLine(line: string): boolean {
    const errorPatterns = [
      /error/i,
      /exception/i,
      /failed/i,
      /cannot/i,
      /undefined/i,
      /null is not an object/i,
      /typeerror/i,
      /referenceerror/i,
      /syntaxerror/i,
      /rangeerror/i,
      /uncaught/i,
      /unhandled/i,
      /404/,
      /500/,
      /502/,
      /503/,
      /cors/i,
      /network error/i,
      /connection failed/i,
      /timeout/i
    ]

    return errorPatterns.some(pattern => pattern.test(line))
  }

  private static removeNoiseFromLog(log: string): string {
    // Remove common noise patterns
    return log
      .replace(/^\s*at\s+.*\(\<anonymous\>\:.*\)$/gm, '') // Anonymous stack traces
      .replace(/^\s*\[.*?\]\s*/gm, '') // Bracketed prefixes (timestamps, log levels)
      .replace(/webpack:\/\/\//g, '') // Webpack paths
      .replace(/node_modules\//g, '') // Node modules paths
      .replace(/\s{2,}/g, ' ') // Multiple spaces
      .replace(/\n{3,}/g, '\n\n') // Multiple newlines
      .trim()
  }

  static identifyCriticalLines(processedLog: ProcessedLog): number[] {
    return processedLog.logLines
      .filter(line => line.isError || line.logLevel === 'error')
      .map(line => line.lineNumber)
      .slice(0, 5) // Limit to top 5 critical lines
  }
}