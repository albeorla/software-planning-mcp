import { PRD } from "../entities/PRD.js";

/**
 * Repository interface for Product Requirements Document (PRD) entities
 */
export interface PRDRepository {
  /**
   * Save a PRD to the repository
   * @param prd The PRD to save
   */
  save(prd: PRD): Promise<void>;
  
  /**
   * Find a PRD by its ID
   * @param id The PRD ID
   * @returns The PRD if found, null otherwise
   */
  findById(id: string): Promise<PRD | null>;
  
  /**
   * List all PRDs in the repository
   * @returns Array of PRDs
   */
  findAll(): Promise<PRD[]>;
  
  /**
   * Delete a PRD from the repository
   * @param id The ID of the PRD to delete
   */
  delete(id: string): Promise<void>;
}