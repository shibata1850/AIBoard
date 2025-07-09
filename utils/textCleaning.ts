export function cleanAnalysisText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleanedText = text
    .replace(/\\n\\n\*\*\d+/g, '')
    .replace(/\\n\\n\*\*/g, '')
    .replace(/\\n\*/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\\\*/g, '*')
    .replace(/\\#/g, '#')
    
    .replace(/\*\*\*+/g, '**')
    .replace(/^\*+\s*/gm, '• ')
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleanedText;
}

export function sanitizeForJSON(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/"/g, '\\"')
    .replace(/\\/g, '\\\\')
    .trim();
}

export function cleanMarkdownArtifacts(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/\\n\\n\*\*\d*/g, '')
    .replace(/\\n\*\*/g, '')
    .replace(/\*\*\d+\./g, '')
    .replace(/^\s*\*\*\s*/gm, '')
    .replace(/\s*\*\*\s*$/gm, '')
    .trim();
}
