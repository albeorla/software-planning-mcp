/**
 * Utility functions for working with document templates
 */

/**
 * Parses structured document sections from markdown content based on headings.
 */
export function parseDocumentSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  // Regex to capture level 2 headings (##) and their content until the next level 2 heading or end of file.
  const sectionRegex = /^##\s+([^\n]+)\n([\s\S]*?)(?=\n^##\s+|$)/gm;
  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    const sectionName = match[1].trim();
    const sectionContent = match[2].trim();
    sections[sectionName] = sectionContent;
  }
  return sections;
}

/**
 * Generates a plausible PRD ID based on title words.
 * Example: "Implement User Authentication" -> "PRD-UA-XX"
 */
export function generatePrdId(title: string): string {
  const ignoreWords = new Set(['and', 'the', 'for', 'with', 'a', 'an', 'of', 'to', 'in', 'on']);
  const prefix = title
    .split(/\s+/)
    .filter(word => word.length > 2 && !ignoreWords.has(word.toLowerCase()))
    .slice(0, 2) // Take first two significant words
    .map(word => word[0].toUpperCase())
    .join('');
  // Generate a simple pseudo-random 2-digit number for demo purposes
  const number = Math.floor(Math.random() * 90 + 10);
  return `PRD-${prefix || 'XX'}-${number}`; // Fallback prefix if needed
}

/**
 * Generates a plausible Epic ID.
 */
export function generateEpicId(): string {
  // Generate a simple pseudo-random 2-letter code (AA-ZZ)
  const letter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const letter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `EPIC-${letter1}${letter2}`;
}

/**
 * Generates a plausible Story ID.
 */
export function generateStoryId(): string {
  // Generate a simple pseudo-random 2-letter code (AA-ZZ)
  const letter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const letter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `STORY-${letter1}${letter2}`;
}

/**
 * Generates a plausible Task ID.
 */
export function generateTaskId(): string {
  // Generate a simple pseudo-random 3-digit number
  const number = Math.floor(Math.random() * 900 + 100);
  return `TASK-${number}`;
}

/**
 * Generates a plausible Spike ID.
 */
export function generateSpikeId(): string {
  // Generate a simple pseudo-random 3-digit number
  const number = Math.floor(Math.random() * 900 + 100);
  return `SPIKE-${number}`;
}