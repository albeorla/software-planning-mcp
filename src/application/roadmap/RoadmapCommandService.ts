import { Roadmap, RoadmapInitiative, RoadmapItem, RoadmapTimeframe } from "../../domain/entities/roadmap/index.js";
import { IRoadmapRepository } from "../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../domain/repositories/RoadmapNoteRepository.js";
import { RoadmapCreated } from "../../domain/events/RoadmapEvents.js";
import { 
  RoadmapCommandDispatcher, 
  RoadmapItemRemovalService, 
  RoadmapItemUpdateService,
  RoadmapItemAddService,
  TimeframeCommandService,
  InitiativeCommandService
} from "./commands/composite/index.js";

/**
 * Service responsible for all command operations (create, update, delete) for roadmaps and roadmap notes
 * Following the Command Query Responsibility Segregation (CQRS) pattern
 */
export class RoadmapCommandService {
  /**
   * Command dispatcher for handling validation, normalization, and events
   */
  private readonly commandDispatcher: RoadmapCommandDispatcher;
  
  /**
   * Service for item removal operations
   */
  private readonly itemRemovalService: RoadmapItemRemovalService;
  
  /**
   * Service for item update operations
   */
  private readonly itemUpdateService: RoadmapItemUpdateService;
  
  /**
   * Service for item addition operations
   */
  private readonly itemAddService: RoadmapItemAddService;

  /**
   * Service for timeframe operations
   */
  private readonly timeframeService: TimeframeCommandService;

  /**
   * Service for initiative operations
   */
  private readonly initiativeService: InitiativeCommandService;

  /**
   * Creates a new RoadmapCommandService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly noteRepository: IRoadmapNoteRepository
  ) {
    this.commandDispatcher = new RoadmapCommandDispatcher(roadmapRepository, noteRepository);
    this.itemRemovalService = new RoadmapItemRemovalService(roadmapRepository);
    this.itemUpdateService = new RoadmapItemUpdateService(roadmapRepository);
    this.itemAddService = new RoadmapItemAddService(roadmapRepository);
    this.timeframeService = new TimeframeCommandService(roadmapRepository);
    this.initiativeService = new InitiativeCommandService(roadmapRepository);
  }

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

    // Use timeframe service to add initial timeframes and their content
    let updatedRoadmap = await this.timeframeService.addInitialTimeframes(roadmap, initialTimeframes);

    // Process, validate, normalize and save the roadmap
    const normalizedRoadmap = await this.commandDispatcher.processAndSaveRoadmap(updatedRoadmap);
    
    // Dispatch a RoadmapCreated event
    const event = new RoadmapCreated(
      normalizedRoadmap.id,
      normalizedRoadmap.title,
      normalizedRoadmap.version
    );
    this.commandDispatcher.dispatchEvents([event]);
    
    return normalizedRoadmap;
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

    // Process, validate, normalize and save the roadmap
    return await this.commandDispatcher.processAndSaveRoadmap(updatedRoadmap);
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
    return this.timeframeService.addTimeframe(roadmapId, name, order);
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
    return this.timeframeService.updateTimeframe(roadmapId, timeframeId, updates);
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
    return this.timeframeService.removeTimeframe(roadmapId, timeframeId);
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
    return this.initiativeService.addInitiative(
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
    return this.initiativeService.updateInitiative(roadmapId, timeframeId, initiativeId, updates);
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
    return this.initiativeService.removeInitiative(roadmapId, timeframeId, initiativeId);
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
    return this.itemAddService.addItem(
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
    return this.itemUpdateService.updateItem(
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
    return this.itemRemovalService.removeItem(roadmapId, timeframeId, initiativeId, itemId);
  }

  // -------------------------------------------------------------------------
  // Note: Roadmap Note Commands have been moved to a separate service
  // -------------------------------------------------------------------------
}