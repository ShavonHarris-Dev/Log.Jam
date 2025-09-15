export interface LogToken {
  type: 'timestamp' | 'level' | 'error' | 'warning' | 'info' | 'url' | 'file' | 'number' | 'string' | 'stacktrace' | 'text'
  content: string
  start: number
  end: number
}

export interface HighlightedLine {
  tokens: LogToken[]
  originalContent: string
  lineNumber: number
  level: 'error' | 'warning' | 'info' | 'debug' | 'normal'
}

const LOG_PATTERNS = {
  // Timestamps - various formats
  timestamp: [
    /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?/g, // ISO format
    /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/g, // US format
    /\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}/g, // EU format
    /\[\d{2}:\d{2}:\d{2}\]/g // [HH:MM:SS]
  ],

  // Log levels
  level: /\b(ERROR|WARN|WARNING|INFO|DEBUG|TRACE|FATAL|SEVERE)\b/gi,

  // URLs
  url: /https?:\/\/[^\s]+/g,

  // File paths and references
  file: /(?:[a-zA-Z]:)?(?:\/|\\)[^\s:]+\.(?:js|ts|jsx|tsx|py|java|cpp|c|h|go|rs|php|rb|css|html|json|xml|log)/g,

  // Stack trace patterns
  stacktrace: /^\s*at\s+.*$/gm,

  // Error keywords
  error: /\b(error|exception|failed|failure|undefined|null|cannot|invalid|missing|not found|denied|forbidden|timeout|refused)\b/gi,

  // Warning keywords
  warning: /\b(warn|warning|deprecated|obsolete|slow|performance|memory)\b/gi,

  // Numbers
  number: /\b\d+(?:\.\d+)?\b/g,

  // Quoted strings
  string: /"[^"]*"|'[^']*'|`[^`]*`/g,

  // Common log prefixes
  prefix: /^\[(.*?)\]/g
}

export class LogSyntaxHighlighter {

  highlightLine(content: string, lineNumber: number): HighlightedLine {
    const tokens: LogToken[] = []
    const used: boolean[] = new Array(content.length).fill(false)

    // Determine line level
    const level = this.determineLineLevel(content)

    // Apply patterns in priority order
    this.applyPattern(content, LOG_PATTERNS.timestamp, 'timestamp', tokens, used)
    this.applyPattern(content, LOG_PATTERNS.level, 'level', tokens, used)
    this.applyPattern(content, LOG_PATTERNS.url, 'url', tokens, used)
    this.applyPattern(content, LOG_PATTERNS.file, 'file', tokens, used)
    this.applyPattern(content, LOG_PATTERNS.stacktrace, 'stacktrace', tokens, used)
    this.applyPattern(content, LOG_PATTERNS.string, 'string', tokens, used)
    this.applyPattern(content, LOG_PATTERNS.number, 'number', tokens, used)
    this.applyPattern(content, LOG_PATTERNS.error, 'error', tokens, used)
    this.applyPattern(content, LOG_PATTERNS.warning, 'warning', tokens, used)

    // Fill remaining text
    this.fillRemainingText(content, tokens, used)

    // Sort tokens by position
    tokens.sort((a, b) => a.start - b.start)

    return {
      tokens,
      originalContent: content,
      lineNumber,
      level
    }
  }

  private determineLineLevel(content: string): 'error' | 'warning' | 'info' | 'debug' | 'normal' {
    if (/(error|exception|failed|failure|fatal|severe|critical)/i.test(content)) {
      return 'error'
    }
    if (/(warn|warning|deprecated)/i.test(content)) {
      return 'warning'
    }
    if (/(info|log)/i.test(content)) {
      return 'info'
    }
    if (/(debug|trace)/i.test(content)) {
      return 'debug'
    }

    return 'normal'
  }

  private applyPattern(
    content: string,
    patterns: RegExp | RegExp[],
    type: LogToken['type'],
    tokens: LogToken[],
    used: boolean[]
  ) {
    const patternsArray = Array.isArray(patterns) ? patterns : [patterns]

    for (const pattern of patternsArray) {
      pattern.lastIndex = 0 // Reset regex
      let match

      while ((match = pattern.exec(content)) !== null) {
        const start = match.index
        const end = start + match[0].length

        // Check if this region is already used
        if (this.isRegionUsed(used, start, end)) {
          continue
        }

        tokens.push({
          type,
          content: match[0],
          start,
          end
        })

        // Mark region as used
        for (let i = start; i < end; i++) {
          used[i] = true
        }

        // Break if not global to prevent infinite loop
        if (!pattern.global) break
      }
    }
  }

  private fillRemainingText(content: string, tokens: LogToken[], used: boolean[]) {
    let start = 0

    for (let i = 0; i <= content.length; i++) {
      if (i === content.length || used[i]) {
        if (start < i) {
          const textContent = content.slice(start, i).trim()
          if (textContent) {
            tokens.push({
              type: 'text',
              content: content.slice(start, i),
              start,
              end: i
            })
          }
        }

        // Find next unused position
        while (i < content.length && used[i]) {
          i++
        }
        start = i
      }
    }
  }

  private isRegionUsed(used: boolean[], start: number, end: number): boolean {
    for (let i = start; i < end; i++) {
      if (used[i]) return true
    }
    return false
  }
}

export const logHighlighter = new LogSyntaxHighlighter()