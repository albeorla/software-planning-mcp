import { Roadmap } from "../../../domain/entities/roadmap/index.js";
import { IRoadmapRepository } from "../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../domain/repositories/RoadmapNoteRepository.js";
import { CompositeRoadmapCommandService } from "../commands/CompositeRoadmapCommandService.js";

/**
 * Facade service for roadmap item operations
 */
export class RoadmapItemFacade {
  private readonly commandService: CompositeRoadmapCommandService;

  /**
   * Creates a new RoadmapItemFacade
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    roadmapRepository: IRoadmapRepository,
    noteRepository: IRoadmapNoteRepository
  ) {
    this.commandService = new CompositeRoadmapCommandService(roadmapRepository, noteRepository);
  }

  /**
   * Adds an item to an initiative
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe
   * @param initiativeId The ID of the initiative
   * @param title The title of the item
   * @param description The description of the item
   * @param status The status of the item
   * @param relatedEntities Related entity IDs
   * @param notes Additional notes
   * @returns The updated roadmap or null if not found
   */
  public async addItem(
    roadmapId: string,
    timeframeId: string,
    initiativeId: string,
    title: string,
    description: string,
    status?: string,
    relatedEntities?: string[],
    notes?: string
  ): Promise<Roadmap | null> {
    return this.commandService.addItem(
      roadmapId,
      timeframeId,
      initiativeId,
      title,
      description,
      status,
      relatedEntities,
      notes
    );
  }

  /**
   * Updates an item
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe
   * @param initiativeId The ID of the initiative
   * @param itemId The ID of the item to update
   * @param updates The fields to update
   * @returns The updated roadmap or null if not found
   */
  public async updateItem(
    roadmapId: string,
    timeframeId: string,
    initiativeId: string,
    itemId: string,
    updates: {
      title?: string;
      description?: string;
      status?: string;
      relatedEntities?: string[];
      notes?: string;
    }
  ): Promise<Roadmap | null> {
    return this.commandService.updateItem(
      roadmapId,
      timeframeId,
      initiativeId,
      itemId,
      updates
    );
  }

  /**
   * Removes an item from an initiative
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe
   * @param initiativeId The ID of the initiative
   * @param itemId The ID of the item to remove
   * @returns The updated roadmap or null if not found
   */
  public async removeItem(
    roadmapId: string,
    timeframeId: string,
    initiativeId: string,
    itemId: string
  ): Promise<Roadmap | null> {
    return this.commandService.removeItem(
      roadmapId,
      timeframeId,
      initiativeId,
      itemId
    );
  }
}