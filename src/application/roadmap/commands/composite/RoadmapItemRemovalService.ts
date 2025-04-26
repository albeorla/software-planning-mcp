import { Roadmap } from "../../../../domain/entities/roadmap/Roadmap.js";
import { IRoadmapRepository } from "../../../../domain/repositories/RoadmapRepository.js";
import { RoadmapCommandDispatcher } from "./RoadmapCommandDispatcher.js";

/**
 * Service responsible for handling item removal operations
 */
export class RoadmapItemRemovalService {
  private readonly commandDispatcher: RoadmapCommandDispatcher;
  
  /**
   * Creates a new RoadmapItemRemovalService
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository
  ) {
    // Note: Passing null for IRoadmapNoteRepository is safe here
    // since this service doesn't use note repository functions
    this.commandDispatcher = new RoadmapCommandDispatcher(roadmapRepository, null);
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
    
    // Process, validate, normalize and save the roadmap
    return await this.commandDispatcher.processAndSaveRoadmap(updatedRoadmap);
  }
}