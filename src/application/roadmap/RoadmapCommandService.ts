import { Roadmap, RoadmapInitiative, RoadmapItem, RoadmapTimeframe } from "../../domain/entities/roadmap/index.js";
import { RoadmapNote } from "../../domain/entities/RoadmapNote.js";
import { IRoadmapRepository } from "../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../domain/repositories/RoadmapNoteRepository.js";

/**
 * Service responsible for all command operations (create, update, delete) for roadmaps and roadmap notes
 * Following the Command Query Responsibility Segregation (CQRS) pattern
 */
export class RoadmapCommandService {
  /**
   * Creates a new RoadmapCommandService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly noteRepository: IRoadmapNoteRepository
  ) {}

  // -------------------------------------------------------------------------
  // Roadmap Commands
  // -------------------------------------------------------------------------

  /**
   * Creates a new roadmap
   * @param title The title of the roadmap
   * @param description The description of the roadmap
   * @param version The version of the roadmap
   * @param owner The owner of the roadmap
   * @param initialTimeframes Optional array of initial timeframes
   * @returns The created roadmap
   */
  public async createRoadmap(
    title: string,
    description: string,
    version: string,
    owner: string,
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
    }> = []
  ): Promise<Roadmap> {
    // Create the roadmap with initial data
    const roadmap = Roadmap.create(title, description, version, owner);

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
          
          // Variable to track the final state of the initiative after adding items
          let finalInitiative = initiative;

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
            
            // Update the final initiative with all items added
            finalInitiative = updatedInitiative;
          }
          
          // Add the initiative to the timeframe
          const updatedTimeframe = newTimeframe.addInitiative(finalInitiative);
          
          // Replace the timeframe in the roadmap
          updatedRoadmap = updatedRoadmap.removeTimeframe(newTimeframe.id).addTimeframe(updatedTimeframe);
        }
      }
    }

    // Save the roadmap
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
  }

  /**
   * Updates a roadmap
   * @param id The ID of the roadmap to update
   * @param updates The fields to update
   * @returns The updated roadmap or null if not found
   */
  public async updateRoadmap(
    id: string,
    updates: {
      title?: string;
      description?: string;
      version?: string;
      owner?: string;
    }
  ): Promise<Roadmap | null> {
    const roadmap = await this.roadmapRepository.findById(id);
    if (!roadmap) {
      return null;
    }

    // Create an updated roadmap with the new values
    // Since Roadmap has a private constructor, we need to use its update method
    const updatedRoadmap = roadmap.update({
      title: updates.title,
      description: updates.description,
      version: updates.version,
      owner: updates.owner
    });

    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
  }

  /**
   * Deletes a roadmap
   * @param id The ID of the roadmap to delete
   * @returns True if the roadmap was deleted, false if not found
   */
  public async deleteRoadmap(id: string): Promise<boolean> {
    return await this.roadmapRepository.delete(id);
  }

  // -------------------------------------------------------------------------
  // Timeframe Commands
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

  // -------------------------------------------------------------------------
  // Initiative Commands
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
    const roadmap = await this.roadmapRepository.findById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const timeframe = roadmap.getTimeframe(timeframeId);
    if (!timeframe) {
      throw new Error(`Timeframe with ID ${timeframeId} not found in roadmap ${roadmapId}`);
    }

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
      category?: string;
      priority?: string;
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

  // -------------------------------------------------------------------------
  // Item Commands
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Roadmap Note Commands
  // -------------------------------------------------------------------------

  /**
   * Creates a new roadmap note
   * @param title The title of the note
   * @param content The content of the note
   * @param category The category of the note
   * @param priority The priority of the note
   * @param timeline The timeline of the note
   * @param relatedItems Related item IDs
   * @returns The created note
   */
  public async createRoadmapNote(
    title: string,
    content: string,
    category: string,
    priority: string,
    timeline: string,
    relatedItems: string[] = []
  ): Promise<RoadmapNote> {
    const note = RoadmapNote.create(title, content, category, priority, timeline, relatedItems);
    await this.noteRepository.save(note);
    return note;
  }

  /**
   * Updates a roadmap note
   * @param id The ID of the note to update
   * @param updates The fields to update
   * @returns The updated note or null if not found
   */
  public async updateRoadmapNote(
    id: string,
    updates: {
      title?: string;
      content?: string;
      category?: string;
      priority?: string;
      timeline?: string;
      relatedItems?: string[];
    }
  ): Promise<RoadmapNote | null> {
    const note = await this.noteRepository.findById(id);
    if (!note) {
      return null;
    }

    const updatedNote = note.update(updates);
    await this.noteRepository.save(updatedNote);
    return updatedNote;
  }

  /**
   * Deletes a roadmap note
   * @param id The ID of the note to delete
   * @returns True if the note was deleted, false if not found
   */
  public async deleteRoadmapNote(id: string): Promise<boolean> {
    return await this.noteRepository.delete(id);
  }
}