/**
 * Converts server-side **bold** markers to HTML <strong> tags.
 * Used for NLP query answers that come back with markdown-style emphasis.
 */
export function boldMarkdownToHtml(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
