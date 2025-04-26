import { Roadmap, RoadmapItem } from "../../../domain/entities/roadmap/index.js";
import { EventDispatcher } from "../../../domain/events/EventDispatcher.js";
import { IRoadmapRepository } from "../../../domain/repositories/RoadmapRepository.js";
import { Status } from "../../../domain/value-objects/index.js";

/**
 * Service responsible for command operations on Items within Initiatives
 * Part of the Command Query Responsibility Segregation (CQRS) pattern
 */
export class ItemCommandService {
  /**
   * Creates a new ItemCommandService
   * @param roadmapRepository The repository for roadmaps
   */
  private readonly eventDispatcher: EventDispatcher;
  
  constructor(
    private readonly roadmapRepository: IRoadmapRepository
  ) {
    this.eventDispatcher = EventDispatcher.getInstance();
  }

  /**
   * Moves an item from one initiative to another
   * @param roadmapId The ID of the roadmap
   * @param sourceTimeframeId The source timeframe ID
   * @param sourceInitiativeId The source initiative ID
   * @param targetTimeframeId The target timeframe ID
   * @param targetInitiativeId The target initiative ID
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
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    // Get source path
    const sourceTimeframe = roadmap.getTimeframe(sourceTimeframeId);
    if (!sourceTimeframe) {
      throw new Error(`Source timeframe with ID ${sourceTimeframeId} not found in roadmap ${roadmapId}`);
    }

    const sourceInitiative = sourceTimeframe.getInitiative(sourceInitiativeId);
    if (!sourceInitiative) {
      throw new Error(`Source initiative with ID ${sourceInitiativeId} not found in timeframe ${sourceTimeframeId}`);
    }

    // Get target path
    const targetTimeframe = roadmap.getTimeframe(targetTimeframeId);
    if (!targetTimeframe) {
      throw new Error(`Target timeframe with ID ${targetTimeframeId} not found in roadmap ${roadmapId}`);
    }

    const targetInitiative = targetTimeframe.getInitiative(targetInitiativeId);
    if (!targetInitiative) {
      throw new Error(`Target initiative with ID ${targetInitiativeId} not found in timeframe ${targetTimeframeId}`);
    }

    // Get the item from source
    const item = sourceInitiative.getItem(itemId);
    if (!item) {
      throw new Error(`Item with ID ${itemId} not found in initiative ${sourceInitiativeId}`);
    }

    // Remove from source
    const updatedSourceInitiative = sourceInitiative.removeItem(itemId);
    const updatedSourceTimeframe = sourceTimeframe
      .removeInitiative(sourceInitiativeId)
      .addInitiative(updatedSourceInitiative);

    // Add to target
    const updatedTargetInitiative = targetInitiative.addItem(item);
    const updatedTargetTimeframe = targetTimeframe
      .removeInitiative(targetInitiativeId)
      .addInitiative(updatedTargetInitiative);

    // Update roadmap with all changes
    let updatedRoadmap = roadmap;
    updatedRoadmap = updatedRoadmap
      .removeTimeframe(sourceTimeframeId)
      .addTimeframe(updatedSourceTimeframe);
    
    // If target is different from source, update it too
    if (sourceTimeframeId !== targetTimeframeId) {
      updatedRoadmap = updatedRoadmap
        .removeTimeframe(targetTimeframeId)
        .addTimeframe(updatedTargetTimeframe);
    }

    await this.roadmapRepository.save(updatedRoadmap);
    
    // Dispatch any events generated during this operation
    this.eventDispatcher.dispatchAll(updatedRoadmap.pullEvents());
    
    return updatedRoadmap;
  }

  /**
   * Adds an item to an initiative
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe
   * @param initiativeId The ID of the initiative
   * @param title The title of the item
   * @param description The description of the item
   * @param status The status of the item (or status string)
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
    status?: Status | string,
    relatedEntities?: string[],
    notes?: string
  ): Promise<Roadmap | null> {
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const timeframe = roadmap.getTimeframe(timeframeId);
    if (!timeframe) {
      throw new Error(`Timeframe with ID ${timeframeId} not found in roadmap ${roadmapId}`);
    }

    const initiative = timeframe.getInitiative(initiativeId);
    if (!initiative) {
      throw new Error(`Initiative with ID ${initiativeId} not found in timeframe ${timeframeId}`);
    }

    const item = RoadmapItem.create(
      title,
      description,
      status || Status.PLANNED,
      relatedEntities || [],
      notes || ""
    );

    const updatedInitiative = initiative.addItem(item);
    const updatedTimeframe = timeframe.removeInitiative(initiativeId).addInitiative(updatedInitiative);
    const updatedRoadmap = roadmap.removeTimeframe(timeframeId).addTimeframe(updatedTimeframe);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
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
      status?: Status | string;
      relatedEntities?: string[];
      notes?: string;
    }
  ): Promise<Roadmap | null> {
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const timeframe = roadmap.getTimeframe(timeframeId);
    if (!timeframe) {
      throw new Error(`Timeframe with ID ${timeframeId} not found in roadmap ${roadmapId}`);
    }

    const initiative = timeframe.getInitiative(initiativeId);
    if (!initiative) {
      throw new Error(`Initiative with ID ${initiativeId} not found in timeframe ${timeframeId}`);
    }

    const item = initiative.getItem(itemId);
    if (!item) {
      throw new Error(`Item with ID ${itemId} not found in initiative ${initiativeId}`);
    }

    const updatedItem = item.update(updates);
    const updatedInitiative = initiative.removeItem(itemId).addItem(updatedItem);
    const updatedTimeframe = timeframe.removeInitiative(initiativeId).addInitiative(updatedInitiative);
    const updatedRoadmap = roadmap.removeTimeframe(timeframeId).addTimeframe(updatedTimeframe);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
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
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const timeframe = roadmap.getTimeframe(timeframeId);
    if (!timeframe) {
      throw new Error(`Timeframe with ID ${timeframeId} not found in roadmap ${roadmapId}`);
    }

    const initiative = timeframe.getInitiative(initiativeId);
    if (!initiative) {
      throw new Error(`Initiative with ID ${initiativeId} not found in timeframe ${timeframeId}`);
    }

    const updatedInitiative = initiative.removeItem(itemId);
    const updatedTimeframe = timeframe.removeInitiative(initiativeId).addInitiative(updatedInitiative);
    const updatedRoadmap = roadmap.removeTimeframe(timeframeId).addTimeframe(updatedTimeframe);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
  }
}