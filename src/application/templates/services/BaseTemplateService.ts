import { parseDocumentSections } from '../UtilityFunctions.js';

/**
 * Base class for template services with common functionality
 */
export abstract class BaseTemplateService {
  /**
   * Parses document sections for storage/indexing
   * @param content The document content
   * @returns Parsed sections
   */
  protected parseSections(content: string): Record<string, string> {
    return parseDocumentSections(content);
  }
  
  /**
   * Generates a random numeric ID within a range
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns Random number within the range
   */
  protected generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}