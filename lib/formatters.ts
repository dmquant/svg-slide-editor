/**
 * Formats SVG code with proper indentation
 */
export function formatSvgCode(svgCode: string): string {
  try {
    // Parse the SVG code
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, 'image/svg+xml');
    
    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid SVG: ' + parserError.textContent);
    }
    
    // Format the code with proper indentation
    return formatXml(new XMLSerializer().serializeToString(doc));
  } catch (error) {
    console.error('Error formatting SVG code:', error);
    return svgCode; // Return original code if formatting fails
  }
}

/**
 * Formats XML with proper indentation
 */
export function formatXml(xml: string, indent = '  '): string {
  let formatted = '';
  let indentLevel = 0;
  let inTag = false;
  let inContent = false;
  let inQuotes = false;
  let currentChar: string;
  let previousChar: string | null = null;
  
  // Function to add a line break and indent
  const newLine = () => {
    formatted += '\n' + indent.repeat(indentLevel);
  };
  
  // Process each character in the XML
  for (let i = 0; i < xml.length; i++) {
    currentChar = xml.charAt(i);
    
    // Handle quotes
    if (currentChar === '"' && previousChar !== '\\') {
      inQuotes = !inQuotes;
    }
    
    // Skip formatting if in quotes
    if (inQuotes) {
      formatted += currentChar;
      previousChar = currentChar;
      continue;
    }
    
    // Handle tags and content
    switch (currentChar) {
      case '<':
        if (i > 0 && xml.charAt(i - 1) !== '>') {
          newLine();
        }
        if (xml.charAt(i + 1) === '/') {
          indentLevel--;
          if (formatted.charAt(formatted.length - 1) !== '\n') {
            newLine();
          }
        }
        inTag = true;
        inContent = false;
        formatted += currentChar;
        break;
      case '>':
        inTag = false;
        formatted += currentChar;
        if (xml.charAt(i + 1) !== '<' && xml.charAt(i + 1) !== undefined) {
          inContent = true;
        } else if (xml.charAt(i + 1) === '<' && xml.charAt(i + 2) !== '/') {
          indentLevel++;
          newLine();
        }
        break;
      case ' ':
        if (inTag && previousChar === ' ') {
          // Skip multiple spaces in tags
          break;
        }
        formatted += currentChar;
        break;
      default:
        formatted += currentChar;
    }
    
    previousChar = currentChar;
  }
  
  return formatted;
}

/**
 * Formats a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Truncates text with ellipsis if it exceeds the specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
} 