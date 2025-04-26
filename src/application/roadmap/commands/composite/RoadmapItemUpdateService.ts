import { Roadmap } from "../../../../domain/entities/roadmap/Roadmap.js";
import { IRoadmapRepository } from "../../../../domain/repositories/RoadmapRepository.js";
import { RoadmapCommandDispatcher } from "./RoadmapCommandDispatcher.js";

/**
 * Service responsible for handling item update operations
 */
export class RoadmapItemUpdateService {
  private readonly commandDispatcher: RoadmapCommandDispatcher;
  
  /**
   * Creates a new RoadmapItemUpdateService
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository
  ) {
    // Note: Passing null for IRoadmapNoteRepository is safe here
    // since this service doesn't use note repository functions
    this.commandDispatcher = new RoadmapCommandDispatcher(roadmapRepository, null);
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

    // Update item with context info for event generation
    const updatedItem = item.update(updates, {
      roadmapId,
      timeframeId,
      initiativeId
    });
    
    // Add the updated item to the initiative with context info
    const updatedInitiative = initiative.removeItem(itemId).addItem(updatedItem, {
      roadmapId,
      timeframeId
    });
    
    const updatedTimeframe = timeframe.removeInitiative(initiativeId).addInitiative(updatedInitiative);
    const updatedRoadmap = roadmap.removeTimeframe(timeframeId).addTimeframe(updatedTimeframe);
    
    // Process the updated roadmap
    const processedRoadmap = await this.commandDispatcher.processAndSaveRoadmap(updatedRoadmap);
    
    // Dispatch any domain events
    const itemEvents = updatedItem.domainEvents;
    const initiativeEvents = updatedInitiative.domainEvents;
    
    // Combine and dispatch all events
    this.commandDispatcher.dispatchEvents([...itemEvents, ...initiativeEvents]);
    
    return processedRoadmap;
  }
}