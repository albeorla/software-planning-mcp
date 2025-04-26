import { IRoadmapRepository } from "../../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../../domain/repositories/RoadmapNoteRepository.js";
import { Roadmap } from "../../../../domain/entities/roadmap/index.js";
import { CompositeCommandServiceBase } from "./CompositeCommandServiceBase.js";

/**
 * Service for roadmap item operations
 * Part of the split CompositeRoadmapCommandService
 */
export class ItemOperationsService extends CompositeCommandServiceBase {
  /**
   * Creates a new ItemOperationsService
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
   * Adds an item to an initiative
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe
   * @param initiativeId The ID of the initiative
   * @param title The title of the item
   * @param description The description of the item
   * @param status The status of the item
   * @param relatedEntities The related entities of the item
   * @param notes The notes for the item
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
    return this.itemCommandService.addItem(
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
   * Updates an item in an initiative
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
    return this.itemCommandService.updateItem(
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
    return this.itemCommandService.removeItem(
      roadmapId,
      timeframeId,
      initiativeId,
      itemId
    );
  }

  /**
   * Moves an item from one initiative to another
   * @param roadmapId The ID of the roadmap
   * @param sourceTimeframeId The ID of the source timeframe
   * @param sourceInitiativeId The ID of the source initiative
   * @param targetTimeframeId The ID of the target timeframe
   * @param targetInitiativeId The ID of the target initiative
   * @param itemId The ID of the item to move
   * @returns The updated roadmap or null if not found
   */
  public async moveItem(
    roadmapId: string,
    sourceTimeframeId: string,
    sourceInitiativeId: string,
    targetTimeframeId: string,
    targetInitiativeId: string,
    itemId: string
  ): Promise<Roadmap | null> {
    return this.itemCommandService.moveItem(
      roadmapId,
      sourceTimeframeId,
      sourceInitiativeId,
      targetTimeframeId,
      targetInitiativeId,
      itemId
    );
  }
}