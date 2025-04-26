import { IRoadmapRepository } from "../../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../../domain/repositories/RoadmapNoteRepository.js";
import { Roadmap } from "../../../../domain/entities/roadmap/index.js";
import { CompositeCommandServiceBase } from "./CompositeCommandServiceBase.js";

/**
 * Service for initiative operations
 * Part of the split CompositeRoadmapCommandService
 */
export class InitiativeOperationsService extends CompositeCommandServiceBase {
  /**
   * Creates a new InitiativeOperationsService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    roadmapRepository: IRoadmapRepository,
    noteRepository: IRoadmapNoteRepository
  ) {
    super(roadmapRepository, noteRepository);
  }

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
    return this.initiativeCommandService.addInitiative(
      roadmapId,
      timeframeId,
      title,
      description,
      category,
      priority
    );
  }

  /**
   * Updates an initiative in a timeframe
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
    return this.initiativeCommandService.updateInitiative(
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
    return this.initiativeCommandService.removeInitiative(
      roadmapId,
      timeframeId,
      initiativeId
    );
  }

  /**
   * Moves an initiative from one timeframe to another
   * @param roadmapId The ID of the roadmap
   * @param sourceTimeframeId The ID of the source timeframe
   * @param targetTimeframeId The ID of the target timeframe
   * @param initiativeId The ID of the initiative to move
   * @returns The updated roadmap or null if not found
   */
  public async moveInitiative(
    roadmapId: string,
    sourceTimeframeId: string,
    targetTimeframeId: string,
    initiativeId: string
  ): Promise<Roadmap | null> {
    return this.initiativeCommandService.moveInitiative(
      roadmapId,
      sourceTimeframeId,
      targetTimeframeId,
      initiativeId
    );
  }
}