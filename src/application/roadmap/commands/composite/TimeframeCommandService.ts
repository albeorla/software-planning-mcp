import { Roadmap, RoadmapInitiative, RoadmapItem, RoadmapTimeframe } from "../../../../domain/entities/roadmap/index.js";
import { IRoadmapRepository } from "../../../../domain/repositories/RoadmapRepository.js";

/**
 * Service responsible for command operations on Timeframes within Roadmaps
 * Part of the Command Query Responsibility Segregation (CQRS) pattern
 */
export class TimeframeCommandService {
  /**
   * Creates a new TimeframeCommandService
   * @param roadmapRepository The repository for roadmaps
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository
  ) {}

  /**
   * Adds timeframes and their nested content during roadmap creation
   * @param roadmap The base roadmap
   * @param initialTimeframes Timeframes with optional initiatives and items
   * @returns The updated roadmap with all timeframes and their content
   */
  public async addInitialTimeframes(
    roadmap: Roadmap,
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
    }>
  ): Promise<Roadmap> {
    // Add all timeframes
    let updatedRoadmap = roadmap;
    for (const timeframeData of initialTimeframes) {
      const timeframe = RoadmapTimeframe.create(
        timeframeData.name,
        timeframeData.order
      );
      updatedRoadmap = updatedRoadmap.addTimeframe(timeframe);

      // Get the newly added timeframe
      const newTimeframe = updatedRoadmap.getTimeframe(
        updatedRoadmap.timeframes[updatedRoadmap.timeframes.length - 1].id
      );
      
      // Add initiatives to the timeframe if provided
      if (timeframeData.initiatives && newTimeframe) {
        for (const initiativeData of timeframeData.initiatives) {
          const initiative = RoadmapInitiative.create(
            initiativeData.title,
            initiativeData.description,
            initiativeData.category,
            initiativeData.priority
          );

          // Add items to the initiative if provided
          if (initiativeData.items) {
            let updatedInitiative = initiative;
            for (const itemData of initiativeData.items) {
              const item = RoadmapItem.create(
                itemData.title,
                itemData.description,
                itemData.status || "planned",
                itemData.relatedEntities || [],
                itemData.notes || ""
              );
              updatedInitiative = updatedInitiative.addItem(item);
            }
            
            // Update the final state of the initiative
            const finalInitiative = updatedInitiative;
            
            // Add the initiative to the timeframe
            const updatedTimeframe = newTimeframe.addInitiative(finalInitiative);
            
            // Replace the timeframe in the roadmap
            updatedRoadmap = updatedRoadmap.removeTimeframe(newTimeframe.id).addTimeframe(updatedTimeframe);
          } else {
            // Add the initiative to the timeframe without items
            const updatedTimeframe = newTimeframe.addInitiative(initiative);
            
            // Replace the timeframe in the roadmap
            updatedRoadmap = updatedRoadmap.removeTimeframe(newTimeframe.id).addTimeframe(updatedTimeframe);
          }
        }
      }
    }

    // Save the updated roadmap
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
  }

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
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const timeframe = RoadmapTimeframe.create(name, order);
    const updatedRoadmap = roadmap.addTimeframe(timeframe);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
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
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const timeframe = roadmap.getTimeframe(timeframeId);
    if (!timeframe) {
      throw new Error(`Timeframe with ID ${timeframeId} not found in roadmap ${roadmapId}`);
    }

    const updatedTimeframe = timeframe.update(updates);
    const updatedRoadmap = roadmap.removeTimeframe(timeframeId).addTimeframe(updatedTimeframe);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
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
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const updatedRoadmap = roadmap.removeTimeframe(timeframeId);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
  }
}