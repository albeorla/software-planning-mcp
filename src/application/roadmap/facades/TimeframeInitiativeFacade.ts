import { Roadmap } from "../../../domain/entities/roadmap/index.js";
import { IRoadmapRepository } from "../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../domain/repositories/RoadmapNoteRepository.js";
import { CompositeRoadmapCommandService } from "../commands/CompositeRoadmapCommandService.js";

/**
 * Facade service for timeframe and initiative operations
 */
export class TimeframeInitiativeFacade {
  private readonly commandService: CompositeRoadmapCommandService;

  /**
   * Creates a new TimeframeInitiativeFacade
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    roadmapRepository: IRoadmapRepository,
    noteRepository: IRoadmapNoteRepository
  ) {
    this.commandService = new CompositeRoadmapCommandService(roadmapRepository, noteRepository);
  }

  // -------------------------------------------------------------------------
  // Timeframe Methods
  // -------------------------------------------------------------------------

  /**
   * Adds a timeframe to a roadmap
   * @param roadmapId The ID of the roadmap
   * @param name The name of the timeframe
   * @param order The order of the timeframe
   * @returns The updated roadmap or null if not found
   */
  public async addTimeframe(
    roadmapId: string,
    name: string,
    order: number
  ): Promise<Roadmap | null> {
    return this.commandService.addTimeframe(roadmapId, name, order);
  }

  /**
   * Updates a timeframe
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe to update
   * @param updates The fields to update
   * @returns The updated roadmap or null if not found
   */
  public async updateTimeframe(
    roadmapId: string,
    timeframeId: string,
    updates: {
      name?: string;
      order?: number;
    }
  ): Promise<Roadmap | null> {
    return this.commandService.updateTimeframe(roadmapId, timeframeId, updates);
  }

  /**
   * Removes a timeframe from a roadmap
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe to remove
   * @returns The updated roadmap or null if not found
   */
  public async removeTimeframe(
    roadmapId: string,
    timeframeId: string
  ): Promise<Roadmap | null> {
    return this.commandService.removeTimeframe(roadmapId, timeframeId);
  }

  // -------------------------------------------------------------------------
  // Initiative Methods
  // -------------------------------------------------------------------------

  /**
   * Adds an initiative to a timeframe
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe
   * @param title The title of the initiative
   * @param description The description of the initiative
   * @param category The category of the initiative
   * @param priority The priority of the initiative
   * @returns The updated roadmap or null if not found
   */
  public async addInitiative(
    roadmapId: string,
    timeframeId: string,
    title: string,
    description: string,
    category: string,
    priority: string
  ): Promise<Roadmap | null> {
    return this.commandService.addInitiative(
      roadmapId,
      timeframeId,
      title,
      description,
      category,
      priority
    );
  }

  /**
   * Updates an initiative
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe
   * @param initiativeId The ID of the initiative to update
   * @param updates The fields to update
   * @returns The updated roadmap or null if not found
   */
  public async updateInitiative(
    roadmapId: string,
    timeframeId: string,
    initiativeId: string,
    updates: {
      title?: string;
      description?: string;
      category?: string;
      priority?: string;
    }
  ): Promise<Roadmap | null> {
    return this.commandService.updateInitiative(
      roadmapId,
      timeframeId,
      initiativeId,
      updates
    );
  }

  /**
   * Removes an initiative from a timeframe
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe
   * @param initiativeId The ID of the initiative to remove
   * @returns The updated roadmap or null if not found
   */
  public async removeInitiative(
    roadmapId: string,
    timeframeId: string,
    initiativeId: string
  ): Promise<Roadmap | null> {
    return this.commandService.removeInitiative(
      roadmapId,
      timeframeId,
      initiativeId
    );
  }
}