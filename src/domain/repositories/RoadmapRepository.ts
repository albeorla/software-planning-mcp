import { Roadmap } from '../entities/roadmap/index.js';

/**
 * Repository interface for Roadmap entity
 * Following the Repository Pattern for domain-driven design
 */
export interface IRoadmapRepository {
  /**
   * Save a roadmap
   * @param roadmap The roadmap to save
   */
  save(roadmap: Roadmap): Promise<void>;
  
  /**
   * Find a roadmap by its ID
   * @param id The unique identifier of the roadmap
   * @returns The roadmap if found, null otherwise
   */
  findById(id: string): Promise<Roadmap | null>;
  
  /**
   * Find all roadmaps
   * @returns An array of all roadmaps
   */
  findAll(): Promise<Roadmap[]>;
  
  /**
   * Find roadmaps by owner
   * @param owner The owner to filter by
   * @returns An array of roadmaps with the specified owner
   */
  findByOwner(owner: string): Promise<Roadmap[]>;
  
  /**
   * Find roadmaps by version
   * @param version The version to filter by
   * @returns An array of roadmaps with the specified version
   */
  findByVersion(version: string): Promise<Roadmap[]>;
  
  /**
   * Delete a roadmap
   * @param id The unique identifier of the roadmap to delete
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}