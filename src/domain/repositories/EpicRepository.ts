import { Epic } from "../entities/Epic.js";

/**
 * Repository interface for Epic entities
 */
export interface EpicRepository {
  /**
   * Save an Epic to the repository
   * @param epic The Epic to save
   */
  save(epic: Epic): Promise<void>;
  
  /**
   * Find an Epic by its ID
   * @param id The Epic ID
   * @returns The Epic if found, null otherwise
   */
  findById(id: string): Promise<Epic | null>;
  
  /**
   * List all Epics in the repository
   * @returns Array of Epics
   */
  findAll(): Promise<Epic[]>;
  
  /**
   * Find Epics related to a PRD
   * @param prdId The PRD ID
   * @returns Array of Epics
   */
  findByPrdId(prdId: string): Promise<Epic[]>;
  
  /**
   * Delete an Epic from the repository
   * @param id The ID of the Epic to delete
   */
  delete(id: string): Promise<void>;
}