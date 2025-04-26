import { Roadmap } from "../../../domain/entities/roadmap/index.js";
import { IRoadmapRepository } from "../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../domain/repositories/RoadmapNoteRepository.js";
import { CompositeRoadmapCommandService } from "../commands/CompositeRoadmapCommandService.js";
import { RoadmapQueryService } from "../RoadmapQueryService.js";

/**
 * Facade service for roadmap CRUD operations
 */
export class RoadmapFacade {
  private readonly commandService: CompositeRoadmapCommandService;
  private readonly queryService: RoadmapQueryService;

  /**
   * Creates a new RoadmapFacade
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    roadmapRepository: IRoadmapRepository,
    noteRepository: IRoadmapNoteRepository
  ) {
    this.commandService = new CompositeRoadmapCommandService(roadmapRepository, noteRepository);
    this.queryService = new RoadmapQueryService(roadmapRepository, noteRepository);
  }

  // -------------------------------------------------------------------------
  // Roadmap Query Methods
  // -------------------------------------------------------------------------

  /**
   * Gets a roadmap by ID
   * @param id The ID of the roadmap to get
   * @returns The roadmap, or null if not found
   */
  public async getRoadmap(id: string): Promise<Roadmap | null> {
    return this.queryService.getRoadmap(id);
  }

  /**
   * Gets all roadmaps
   * @returns All roadmaps
   */
  public async getAllRoadmaps(): Promise<Roadmap[]> {
    return this.queryService.getAllRoadmaps();
  }

  /**
   * Gets all roadmaps by owner
   * @param owner The owner of the roadmaps
   * @returns All roadmaps owned by the specified owner
   */
  public async getRoadmapsByOwner(owner: string): Promise<Roadmap[]> {
    return this.queryService.getRoadmapsByOwner(owner);
  }

  // -------------------------------------------------------------------------
  // Roadmap Command Methods
  // -------------------------------------------------------------------------

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
    return this.commandService.createRoadmap(
      title,
      description,
      version,
      owner,
      initialTimeframes
    );
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
    return this.commandService.updateRoadmap(id, updates);
  }

  /**
   * Deletes a roadmap
   * @param id The ID of the roadmap to delete
   * @returns True if the roadmap was deleted, false if not found
   */
  public async deleteRoadmap(id: string): Promise<boolean> {
    return this.commandService.deleteRoadmap(id);
  }
}