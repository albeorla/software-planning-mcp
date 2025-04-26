import { Roadmap, RoadmapInitiative } from "../../../domain/entities/roadmap/index.js";
import { EventDispatcher } from "../../../domain/events/EventDispatcher.js";
import { IRoadmapRepository } from "../../../domain/repositories/RoadmapRepository.js";
import { Category, Priority } from "../../../domain/value-objects/index.js";

/**
 * Service responsible for command operations on Initiatives within Roadmaps
 * Part of the Command Query Responsibility Segregation (CQRS) pattern
 */
export class InitiativeCommandService {
  /**
   * Creates a new InitiativeCommandService
   * @param roadmapRepository The repository for roadmaps
   */
  private readonly eventDispatcher: EventDispatcher;
  
  constructor(
    private readonly roadmapRepository: IRoadmapRepository
  ) {
    this.eventDispatcher = EventDispatcher.getInstance();
  }

  /**
   * Moves an initiative from one timeframe to another
   * @param roadmapId The ID of the roadmap
   * @param sourceTimeframeId The source timeframe ID
   * @param targetTimeframeId The target timeframe ID
   * @param initiativeId The ID of the initiative to move
   * @returns The updated roadmap or null if not found
   */
  public async moveInitiative(
    roadmapId: string,
    sourceTimeframeId: string,
    targetTimeframeId: string,
    initiativeId: string
  ): Promise<Roadmap | null> {
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const sourceTimeframe = roadmap.getTimeframe(sourceTimeframeId);
    if (!sourceTimeframe) {
      throw new Error(`Source timeframe with ID ${sourceTimeframeId} not found in roadmap ${roadmapId}`);
    }

    const targetTimeframe = roadmap.getTimeframe(targetTimeframeId);
    if (!targetTimeframe) {
      throw new Error(`Target timeframe with ID ${targetTimeframeId} not found in roadmap ${roadmapId}`);
    }

    const initiative = sourceTimeframe.getInitiative(initiativeId);
    if (!initiative) {
      throw new Error(`Initiative with ID ${initiativeId} not found in timeframe ${sourceTimeframeId}`);
    }

    // Remove from source timeframe
    const updatedSourceTimeframe = sourceTimeframe.removeInitiative(initiativeId);
    
    // Add to target timeframe
    const updatedTargetTimeframe = targetTimeframe.addInitiative(initiative);
    
    // Update roadmap with both timeframe changes
    let updatedRoadmap = roadmap;
    updatedRoadmap = updatedRoadmap.removeTimeframe(sourceTimeframeId).addTimeframe(updatedSourceTimeframe);
    updatedRoadmap = updatedRoadmap.removeTimeframe(targetTimeframeId).addTimeframe(updatedTargetTimeframe);
    
    await this.roadmapRepository.save(updatedRoadmap);
    
    // Dispatch events generated during this operation
    this.eventDispatcher.dispatchAll(updatedRoadmap.pullEvents());
    
    return updatedRoadmap;
  }

  /**
   * Adds an initiative to a timeframe
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe
   * @param title The title of the initiative
   * @param description The description of the initiative
   * @param category The category of the initiative (or category string)
   * @param priority The priority of the initiative (or priority string)
   * @returns The updated roadmap or null if not found
   */
  public async addInitiative(
    roadmapId: string,
    timeframeId: string,
    title: string,
    description: string,
    category: Category | string,
    priority: Priority | string
  ): Promise<Roadmap | null> {
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const timeframe = roadmap.getTimeframe(timeframeId);
    if (!timeframe) {
      throw new Error(`Timeframe with ID ${timeframeId} not found in roadmap ${roadmapId}`);
    }

    // Category and Priority will be converted in the factory method if needed
    const initiative = RoadmapInitiative.create(title, description, category, priority);
    const updatedTimeframe = timeframe.addInitiative(initiative);
    const updatedRoadmap = roadmap.removeTimeframe(timeframeId).addTimeframe(updatedTimeframe);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
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
      category?: Category | string;
      priority?: Priority | string;
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

    const updatedInitiative = initiative.update(updates);
    const updatedTimeframe = timeframe.removeInitiative(initiativeId).addInitiative(updatedInitiative);
    const updatedRoadmap = roadmap.removeTimeframe(timeframeId).addTimeframe(updatedTimeframe);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
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
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const timeframe = roadmap.getTimeframe(timeframeId);
    if (!timeframe) {
      throw new Error(`Timeframe with ID ${timeframeId} not found in roadmap ${roadmapId}`);
    }

    const updatedTimeframe = timeframe.removeInitiative(initiativeId);
    const updatedRoadmap = roadmap.removeTimeframe(timeframeId).addTimeframe(updatedTimeframe);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
  }
}