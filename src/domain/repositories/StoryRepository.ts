import { Story } from "../entities/Story.js";

/**
 * Repository interface for Story entities
 */
export interface StoryRepository {
  /**
   * Save a Story to the repository
   * @param story The Story to save
   */
  save(story: Story): Promise<void>;
  
  /**
   * Find a Story by its ID
   * @param id The Story ID
   * @returns The Story if found, null otherwise
   */
  findById(id: string): Promise<Story | null>;
  
  /**
   * List all Stories in the repository
   * @returns Array of Stories
   */
  findAll(): Promise<Story[]>;
  
  /**
   * Find Stories related to an Epic
   * @param epicId The Epic ID
   * @returns Array of Stories
   */
  findByEpicId(epicId: string): Promise<Story[]>;
  
  /**
   * Delete a Story from the repository
   * @param id The ID of the Story to delete
   */
  delete(id: string): Promise<void>;
}