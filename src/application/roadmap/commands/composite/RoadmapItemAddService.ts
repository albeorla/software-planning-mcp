import { Roadmap } from "../../../../domain/entities/roadmap/Roadmap.js";
import { RoadmapItem } from "../../../../domain/entities/roadmap/RoadmapItem.js";
import { IRoadmapRepository } from "../../../../domain/repositories/RoadmapRepository.js";
import { RoadmapCommandDispatcher } from "./RoadmapCommandDispatcher.js";

/**
 * Service responsible for handling item addition operations
 */
export class RoadmapItemAddService {
  private readonly commandDispatcher: RoadmapCommandDispatcher;
  
  /**
   * Creates a new RoadmapItemAddService
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository
  ) {
    // Note: Passing null for IRoadmapNoteRepository is safe here
    // since this service doesn't use note repository functions
    this.commandDispatcher = new RoadmapCommandDispatcher(roadmapRepository, null);
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
      status || "planned",
      relatedEntities || [],
      notes || ""
    );

    // Add item with context for event generation
    const updatedInitiative = initiative.addItem(item, {
      roadmapId,
      timeframeId
    });
    
    const updatedTimeframe = timeframe.removeInitiative(initiativeId).addInitiative(updatedInitiative);
    const updatedRoadmap = roadmap.removeTimeframe(timeframeId).addTimeframe(updatedTimeframe);
    
    // Process, validate, normalize and save the roadmap
    const processedRoadmap = await this.commandDispatcher.processAndSaveRoadmap(updatedRoadmap);
    
    // Dispatch events from the initiative (which includes item events)
    const events = updatedInitiative.domainEvents;
    this.commandDispatcher.dispatchEvents(events);
    
    return processedRoadmap;
  }
}