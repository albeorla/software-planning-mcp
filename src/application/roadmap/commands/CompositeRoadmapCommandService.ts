import { IRoadmapRepository } from "../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../domain/repositories/RoadmapNoteRepository.js";
import { Roadmap } from "../../../domain/entities/Roadmap.js";
import { RoadmapNote } from "../../../domain/entities/RoadmapNote.js";
import { RoadmapEntityCommandService } from "./RoadmapEntityCommandService.js";
import { TimeframeCommandService } from "./TimeframeCommandService.js";
import { InitiativeCommandService } from "./InitiativeCommandService.js";
import { ItemCommandService } from "./ItemCommandService.js";
import { RoadmapNoteCommandService } from "./RoadmapNoteCommandService.js";

/**
 * Composite service that delegates roadmap command operations to specialized services
 * Combines all roadmap-related command operations in a single facade
 */
export class CompositeRoadmapCommandService {
  private roadmapEntityCommandService: RoadmapEntityCommandService;
  private timeframeCommandService: TimeframeCommandService;
  private initiativeCommandService: InitiativeCommandService;
  private itemCommandService: ItemCommandService;
  private roadmapNoteCommandService: RoadmapNoteCommandService;

  /**
   * Creates a new CompositeRoadmapCommandService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly noteRepository: IRoadmapNoteRepository
  ) {
    this.roadmapEntityCommandService = new RoadmapEntityCommandService(roadmapRepository);
    this.timeframeCommandService = new TimeframeCommandService(roadmapRepository);
    this.initiativeCommandService = new InitiativeCommandService(roadmapRepository);
    this.itemCommandService = new ItemCommandService(roadmapRepository);
    this.roadmapNoteCommandService = new RoadmapNoteCommandService(noteRepository);
  }

  // Roadmap Entity Operations

  /**
   * Creates a new roadmap
   * @param title The title of the roadmap
   * @param description The description of the roadmap
   * @param version The version of the roadmap
   * @param owner The owner of the roadmap
   * @param initialTimeframes Optional initial timeframes
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
    return this.roadmapEntityCommandService.createRoadmap(
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
    return this.roadmapEntityCommandService.updateRoadmap(id, updates);
  }

  /**
   * Deletes a roadmap
   * @param id The ID of the roadmap to delete
   * @returns True if the roadmap was deleted, false if not found
   */
  public async deleteRoadmap(id: string): Promise<boolean> {
    return this.roadmapEntityCommandService.deleteRoadmap(id);
  }

  // Timeframe Operations

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
    return this.timeframeCommandService.addTimeframe(roadmapId, name, order);
  }

  /**
   * Updates a timeframe in a roadmap
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
    return this.timeframeCommandService.updateTimeframe(roadmapId, timeframeId, updates);
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
    return this.timeframeCommandService.removeTimeframe(roadmapId, timeframeId);
  }

  // Initiative Operations

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
    return this.initiativeCommandService.addInitiative(
      roadmapId,
      timeframeId,
      title,
      description,
      category,
      priority
    );
  }

  /**
   * Updates an initiative in a timeframe
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
    return this.initiativeCommandService.updateInitiative(
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
    return this.initiativeCommandService.removeInitiative(
      roadmapId,
      timeframeId,
      initiativeId
    );
  }

  // Item Operations

  /**
   * Adds an item to an initiative
   * @param roadmapId The ID of the roadmap
   * @param timeframeId The ID of the timeframe
   * @param initiativeId The ID of the initiative
   * @param title The title of the item
   * @param description The description of the item
   * @param status The status of the item
   * @param relatedEntities Related entity IDs
   * @param notes Notes for the item
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

  // Roadmap Note Operations

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
    return this.roadmapNoteCommandService.createRoadmapNote(
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
    return this.roadmapNoteCommandService.updateRoadmapNote(id, updates);
  }

  /**
   * Deletes a roadmap note
   * @param id The ID of the note to delete
   * @returns True if the note was deleted, false if not found
   */
  public async deleteRoadmapNote(id: string): Promise<boolean> {
    return this.roadmapNoteCommandService.deleteRoadmapNote(id);
  }
}