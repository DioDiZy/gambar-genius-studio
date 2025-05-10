
/**
 * Utility functions for story text processing
 */

/**
 * Split a story text into separate paragraphs based on a separator
 * @param text The story text to split
 * @param separator The separator to use for splitting (default: "\n\n")
 * @returns Array of paragraph strings
 */
export const handleParagraphSplit = (text: string, separator: string = "\n\n"): string[] => {
  // Handle both types of line breaks and split by empty lines
  if (!text.trim()) return [];
  
  // Use the custom separator if it exists, otherwise default to double newline
  const paragraphSeparator = separator || "\n\n";
  const paragraphs = text.split(paragraphSeparator)
    .map(p => p.trim())
    .filter(p => p.length > 0);
    
  return paragraphs;
};
