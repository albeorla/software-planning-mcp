import { RoadmapNote } from '../entities/RoadmapNote.js';

/**
 * Repository interface for RoadmapNote entity
 * Following the Repository Pattern for domain-driven design
 */
export interface IRoadmapNoteRepository {
  /**
   * Save a roadmap note
   * @param note The roadmap note to save
   */
  save(note: RoadmapNote): Promise<void>;
  
  /**
   * Find a roadmap note by its ID
   * @param id The unique identifier of the roadmap note
   * @returns The roadmap note if found, null otherwise
   */
  findById(id: string): Promise<RoadmapNote | null>;
  
  /**
   * Find roadmap notes by category
   * @param category The category to filter by
   * @returns An array of roadmap notes with the specified category
   */
  findByCategory(category: string): Promise<RoadmapNote[]>;
  
  /**
   * Find roadmap notes by priority
   * @param priority The priority level to filter by
   * @returns An array of roadmap notes with the specified priority
   */
  findByPriority(priority: string): Promise<RoadmapNote[]>;
  
  /**
   * Find roadmap notes by timeline
   * @param timeline The timeline to filter by
   * @returns An array of roadmap notes with the specified timeline
   */
  findByTimeline(timeline: string): Promise<RoadmapNote[]>;
  
  /**
   * Find all roadmap notes
   * @returns An array of all roadmap notes
   */
  findAll(): Promise<RoadmapNote[]>;
  
  /**
   * Delete a roadmap note
   * @param id The unique identifier of the roadmap note to delete
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}