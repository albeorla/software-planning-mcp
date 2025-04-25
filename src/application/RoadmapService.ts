import { Roadmap, RoadmapTimeframe, RoadmapInitiative, RoadmapItem } from "../domain/entities/roadmap/index.js";
import { IRoadmapRepository } from "../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../domain/repositories/RoadmapNoteRepository.js";
import { RoadmapNote } from "../domain/entities/RoadmapNote.js";

/**
 * Application service for managing roadmaps and roadmap notes
 * Follows the same patterns as other application services in the system
 */
export class RoadmapApplicationService {
  /**
   * Creates a new RoadmapApplicationService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly noteRepository: IRoadmapNoteRepository
  ) {}

  // -------------------------------------------------------------------------
  // Roadmap Management
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
    // Convert the timeframe data to domain entities
    const timeframes = initialTimeframes.map(tf => {
      // Create initiatives for this timeframe
      const initiatives = (tf.initiatives || []).map(init => {
        // Create items for this initiative
        const items = (init.items || []).map(item => {
          return RoadmapItem.create(
            item.title,
            item.description,
            item.status,
            item.relatedEntities,
            item.notes
          );
        });

        return RoadmapInitiative.create(
          init.title,
          init.description,
          init.category,
          init.priority,
          items
        );
      });

      return RoadmapTimeframe.create(
        tf.name,
        tf.order,
        initiatives
      );
    });

    // Create the roadmap with the timeframes
    const roadmap = Roadmap.create(
      title,
      description,
      version,
      owner,
      timeframes
    );

    // Save to repository
    await this.roadmapRepository.save(roadmap);
    return roadmap;
  }

  /**
   * Gets a roadmap by ID
   * @param id The ID of the roadmap
   * @returns The roadmap or null if not found
   */
  public async getRoadmap(id: string): Promise<Roadmap | null> {
    return this.roadmapRepository.findById(id);
  }

  /**
   * Gets all roadmaps
   * @returns Array of all roadmaps
   */
  public async getAllRoadmaps(): Promise<Roadmap[]> {
    return this.roadmapRepository.findAll();
  }

  /**
   * Gets roadmaps by owner
   * @param owner The owner to filter by
   * @returns Array of matching roadmaps
   */
  public async getRoadmapsByOwner(owner: string): Promise<Roadmap[]> {
    return this.roadmapRepository.findByOwner(owner);
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

    const updatedRoadmap = roadmap.update(updates);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
  }

  /**
   * Deletes a roadmap
   * @param id The ID of the roadmap to delete
   * @returns Boolean indicating if the roadmap was successfully deleted
   */
  public async deleteRoadmap(id: string): Promise<boolean> {
    return this.roadmapRepository.delete(id);
  }

  // -------------------------------------------------------------------------
  // Timeframe Management
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
   * Updates a timeframe within a roadmap
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
  // Initiative Management
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
  // Roadmap Item Management
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
    status: string = "Planned",
    relatedEntities: string[] = [],
    notes: string = ""
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

    const item = RoadmapItem.create(title, description, status, relatedEntities, notes);
    const updatedInitiative = initiative.addItem(item);
    const updatedTimeframe = timeframe.removeInitiative(initiativeId).addInitiative(updatedInitiative);
    const updatedRoadmap = roadmap.removeTimeframe(timeframeId).addTimeframe(updatedTimeframe);
    await this.roadmapRepository.save(updatedRoadmap);
    return updatedRoadmap;
  }

  /**
   * Updates a roadmap item
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
  // Roadmap Note Management
  // -------------------------------------------------------------------------

  /**
   * Creates a new roadmap note
   * @param title The title of the note
   * @param content The detailed content of the note
   * @param category The category (e.g., 'feature', 'architecture', 'tech-debt')
   * @param priority The priority level (e.g., 'high', 'medium', 'low')
   * @param timeline The estimated timeline (e.g., 'Q1 2023', 'future')
   * @param relatedItems Optional array of related item IDs
   * @returns The created roadmap note
   */
  public async createRoadmapNote(
    title: string,
    content: string,
    category: string,
    priority: string,
    timeline: string,
    relatedItems: string[] = []
  ): Promise<RoadmapNote> {
    const note = RoadmapNote.create(
      title,
      content,
      category,
      priority,
      timeline,
      relatedItems
    );
    
    await this.noteRepository.save(note);
    return note;
  }

  /**
   * Updates an existing roadmap note
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
    const existingNote = await this.noteRepository.findById(id);
    if (!existingNote) {
      return null;
    }

    const updatedNote = existingNote.update(updates);
    await this.noteRepository.save(updatedNote);
    return updatedNote;
  }

  /**
   * Gets a roadmap note by ID
   * @param id The ID of the note
   * @returns The roadmap note or null if not found
   */
  public async getRoadmapNote(id: string): Promise<RoadmapNote | null> {
    return this.noteRepository.findById(id);
  }

  /**
   * Gets all roadmap notes
   * @returns Array of all roadmap notes
   */
  public async getAllRoadmapNotes(): Promise<RoadmapNote[]> {
    return this.noteRepository.findAll();
  }

  /**
   * Gets roadmap notes by category
   * @param category The category to filter by
   * @returns Array of matching roadmap notes
   */
  public async getRoadmapNotesByCategory(category: string): Promise<RoadmapNote[]> {
    return this.noteRepository.findByCategory(category);
  }

  /**
   * Gets roadmap notes by priority
   * @param priority The priority to filter by
   * @returns Array of matching roadmap notes
   */
  public async getRoadmapNotesByPriority(priority: string): Promise<RoadmapNote[]> {
    return this.noteRepository.findByPriority(priority);
  }

  /**
   * Gets roadmap notes by timeline
   * @param timeline The timeline to filter by
   * @returns Array of matching roadmap notes
   */
  public async getRoadmapNotesByTimeline(timeline: string): Promise<RoadmapNote[]> {
    return this.noteRepository.findByTimeline(timeline);
  }

  /**
   * Deletes a roadmap note
   * @param id The ID of the note to delete
   * @returns Boolean indicating if the note was successfully deleted
   */
  public async deleteRoadmapNote(id: string): Promise<boolean> {
    return this.noteRepository.delete(id);
  }
}