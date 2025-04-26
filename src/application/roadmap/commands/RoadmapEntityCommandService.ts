import { Roadmap } from "../../../domain/entities/roadmap/index.js";
import { IRoadmapRepository } from "../../../domain/repositories/RoadmapRepository.js";

/**
 * Service responsible for command operations on the Roadmap entity itself
 * Part of the Command Query Responsibility Segregation (CQRS) pattern
 */
export class RoadmapEntityCommandService {
  /**
   * Creates a new RoadmapEntityCommandService
   * @param roadmapRepository The repository for roadmaps
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository
  ) {}

  /**
   * Creates a new roadmap
   * @param title The title of the roadmap
   * @param description The description of the roadmap
   * @param version The version of the roadmap
   * @param owner The owner of the roadmap
   * @param initialTimeframes Optional array of initial timeframes
   * @returns The created roadmap
   */
  public async createRoadmap(
    title: string,
    description: string,
    version: string,
    owner: string,
    initialTimeframes: Array<{
      name: string;
      order: number;
      initiatives?: Array<{
        title: string;
        description: string;
        category: string;
        priority: string;
        items?: Array<{
          title: string;
          description: string;
          status?: string;
          relatedEntities?: string[];
          notes?: string;
        }>;
      }>;
    }> = []
  ): Promise<Roadmap> {
    // Create the roadmap with initial data
    const roadmap = Roadmap.create(title, description, version, owner);

    // The complex nesting of timeframes, initiatives and items
    // is handled by the specialized timeframe command service

    // Save the roadmap
    await this.roadmapRepository.save(roadmap);
    return roadmap;
  }

  /**
   * Updates a roadmap
   * @param id The ID of the roadmap to update
   * @param updates The fields to update
   * @returns The updated roadmap or null if not found
   */
  public async updateRoadmap(
    id: string,
    updates: {
      title?: string;
      description?: string;
      version?: string;
      owner?: string;
    }
  ): Promise<Roadmap | null> {
    const roadmap = await this.roadmapRepository.findById(id);
    if (!roadmap) {
      return null;
    }

    // Create an updated roadmap with the new values
    // Since Roadmap has a private constructor, we need to use its update method
    const updatedRoadmap = roadmap.update({
      title: updates.title,
      description: updates.description,
      version: updates.version,
      owner: updates.owner
    });

    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
  }

  /**
   * Deletes a roadmap
   * @param id The ID of the roadmap to delete
   * @returns True if the roadmap was deleted, false if not found
   */
  public async deleteRoadmap(id: string): Promise<boolean> {
    return await this.roadmapRepository.delete(id);
  }
}