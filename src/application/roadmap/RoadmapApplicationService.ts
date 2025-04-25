import { Roadmap } from "../../domain/entities/roadmap/index.js";
import { RoadmapNote } from "../../domain/entities/RoadmapNote.js";
import { IRoadmapRepository } from "../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../domain/repositories/RoadmapNoteRepository.js";
import { RoadmapCommandService } from "./RoadmapCommandService.js";
import { RoadmapQueryService } from "./RoadmapQueryService.js";

/**
 * Facade service that combines query and command services for roadmap operations
 * Maintains backward compatibility with the original RoadmapService
 */
export class RoadmapApplicationService {
  private readonly commandService: RoadmapCommandService;
  private readonly queryService: RoadmapQueryService;

  /**
   * Creates a new RoadmapApplicationService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    roadmapRepository: IRoadmapRepository,
    noteRepository: IRoadmapNoteRepository
  ) {
    this.commandService = new RoadmapCommandService(roadmapRepository, noteRepository);
    this.queryService = new RoadmapQueryService(roadmapRepository, noteRepository);
  }

  // -------------------------------------------------------------------------
  // Roadmap Query Methods
  // -------------------------------------------------------------------------

  /**
   * Gets a roadmap by ID
   * @param id The ID of the roadmap to get
   * @returns The roadmap, or null if not found
   */
  public async getRoadmap(id: string): Promise<Roadmap | null> {
    return this.queryService.getRoadmap(id);
  }

  /**
   * Gets all roadmaps
   * @returns All roadmaps
   */
  public async getAllRoadmaps(): Promise<Roadmap[]> {
    return this.queryService.getAllRoadmaps();
  }

  /**
   * Gets all roadmaps by owner
   * @param owner The owner of the roadmaps
   * @returns All roadmaps owned by the specified owner
   */
  public async getRoadmapsByOwner(owner: string): Promise<Roadmap[]> {
    return this.queryService.getRoadmapsByOwner(owner);
  }

  // -------------------------------------------------------------------------
  // Roadmap Command Methods
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
    return this.commandService.createRoadmap(
      title,
      description,
      version,
      owner,
      initialTimeframes
    );
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
    return this.commandService.updateRoadmap(id, updates);
  }

  /**
   * Deletes a roadmap
   * @param id The ID of the roadmap to delete
   * @returns True if the roadmap was deleted, false if not found
   */
  public async deleteRoadmap(id: string): Promise<boolean> {
    return this.commandService.deleteRoadmap(id);
  }

  // -------------------------------------------------------------------------
  // Timeframe Methods
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
    return this.commandService.addTimeframe(roadmapId, name, order);
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
    return this.commandService.updateTimeframe(roadmapId, timeframeId, updates);
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
    return this.commandService.removeTimeframe(roadmapId, timeframeId);
  }

  // -------------------------------------------------------------------------
  // Initiative Methods
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
    return this.commandService.addInitiative(
      roadmapId,
      timeframeId,
      title,
      description,
      category,
      priority
    );
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
    return this.commandService.updateInitiative(
      roadmapId,
      timeframeId,
      initiativeId,
      updates
    );
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
    return this.commandService.removeInitiative(
      roadmapId,
      timeframeId,
      initiativeId
    );
  }

  // -------------------------------------------------------------------------
  // Item Methods
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

  // -------------------------------------------------------------------------
  // Roadmap Note Query Methods
  // -------------------------------------------------------------------------

  /**
   * Gets a roadmap note by ID
   * @param id The ID of the note to get
   * @returns The note, or null if not found
   */
  public async getRoadmapNote(id: string): Promise<RoadmapNote | null> {
    return this.queryService.getRoadmapNote(id);
  }

  /**
   * Gets all roadmap notes
   * @returns All roadmap notes
   */
  public async getAllRoadmapNotes(): Promise<RoadmapNote[]> {
    return this.queryService.getAllRoadmapNotes();
  }

  /**
   * Gets all roadmap notes by category
   * @param category The category to filter by
   * @returns All roadmap notes in the specified category
   */
  public async getRoadmapNotesByCategory(category: string): Promise<RoadmapNote[]> {
    return this.queryService.getRoadmapNotesByCategory(category);
  }

  /**
   * Gets all roadmap notes by priority
   * @param priority The priority to filter by
   * @returns All roadmap notes with the specified priority
   */
  public async getRoadmapNotesByPriority(priority: string): Promise<RoadmapNote[]> {
    return this.queryService.getRoadmapNotesByPriority(priority);
  }

  /**
   * Gets all roadmap notes by timeline
   * @param timeline The timeline to filter by
   * @returns All roadmap notes with the specified timeline
   */
  public async getRoadmapNotesByTimeline(timeline: string): Promise<RoadmapNote[]> {
    return this.queryService.getRoadmapNotesByTimeline(timeline);
  }

  // -------------------------------------------------------------------------
  // Roadmap Note Command Methods
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
    return this.commandService.createRoadmapNote(
      title,
      content,
      category,
      priority,
      timeline,
      relatedItems
    );
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
    return this.commandService.updateRoadmapNote(id, updates);
  }

  /**
   * Deletes a roadmap note
   * @param id The ID of the note to delete
   * @returns True if the note was deleted, false if not found
   */
  public async deleteRoadmapNote(id: string): Promise<boolean> {
    return this.commandService.deleteRoadmapNote(id);
  }
}