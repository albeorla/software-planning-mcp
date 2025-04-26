import { IRoadmapRepository } from "../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../domain/repositories/RoadmapNoteRepository.js";
import { Roadmap } from "../../../domain/entities/roadmap/index.js";
import { RoadmapNote } from "../../../domain/entities/roadmap/index.js";
import { 
  RoadmapOperationsService,
  InitiativeOperationsService,
  ItemOperationsService,
  NoteOperationsService
} from "./composite/index.js";

/**
 * Composite service that delegates roadmap command operations to specialized services
 * Combines all roadmap-related command operations in a single facade
 * 
 * This class is a facade over multiple specialized service implementations,
 * each responsible for a specific subset of roadmap operations.
 */
export class CompositeRoadmapCommandService {
  private roadmapOperationsService: RoadmapOperationsService;
  private initiativeOperationsService: InitiativeOperationsService;
  private itemOperationsService: ItemOperationsService;
  private noteOperationsService: NoteOperationsService;

  /**
   * Creates a new CompositeRoadmapCommandService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly noteRepository: IRoadmapNoteRepository
  ) {
    this.roadmapOperationsService = new RoadmapOperationsService(roadmapRepository, noteRepository);
    this.initiativeOperationsService = new InitiativeOperationsService(roadmapRepository, noteRepository);
    this.itemOperationsService = new ItemOperationsService(roadmapRepository, noteRepository);
    this.noteOperationsService = new NoteOperationsService(roadmapRepository, noteRepository);
  }

  // === ROADMAP ENTITY OPERATIONS ===

  /**
   * Creates a new roadmap
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
    return this.roadmapOperationsService.createRoadmap(
      title, description, version, owner, initialTimeframes
    );
  }

  /**
   * Updates a roadmap
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
    return this.roadmapOperationsService.updateRoadmap(id, updates);
  }

  /**
   * Deletes a roadmap
   */
  public async deleteRoadmap(id: string): Promise<boolean> {
    return this.roadmapOperationsService.deleteRoadmap(id);
  }

  // === TIMEFRAME OPERATIONS ===

  /**
   * Adds a timeframe to a roadmap
   */
  public async addTimeframe(
    roadmapId: string,
    name: string,
    order: number
  ): Promise<Roadmap | null> {
    return this.roadmapOperationsService.addTimeframe(roadmapId, name, order);
  }

  /**
   * Updates a timeframe in a roadmap
   */
  public async updateTimeframe(
    roadmapId: string,
    timeframeId: string,
    updates: {
      name?: string;
      order?: number;
    }
  ): Promise<Roadmap | null> {
    return this.roadmapOperationsService.updateTimeframe(roadmapId, timeframeId, updates);
  }

  /**
   * Removes a timeframe from a roadmap
   */
  public async removeTimeframe(
    roadmapId: string,
    timeframeId: string
  ): Promise<Roadmap | null> {
    return this.roadmapOperationsService.removeTimeframe(roadmapId, timeframeId);
  }

  // === INITIATIVE OPERATIONS ===

  /**
   * Adds an initiative to a timeframe
   */
  public async addInitiative(
    roadmapId: string,
    timeframeId: string,
    title: string,
    description: string,
    category: string,
    priority: string
  ): Promise<Roadmap | null> {
    return this.initiativeOperationsService.addInitiative(
      roadmapId, timeframeId, title, description, category, priority
    );
  }

  /**
   * Updates an initiative in a timeframe
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
    return this.initiativeOperationsService.updateInitiative(
      roadmapId, timeframeId, initiativeId, updates
    );
  }

  /**
   * Removes an initiative from a timeframe
   */
  public async removeInitiative(
    roadmapId: string,
    timeframeId: string,
    initiativeId: string
  ): Promise<Roadmap | null> {
    return this.initiativeOperationsService.removeInitiative(
      roadmapId, timeframeId, initiativeId
    );
  }

  /**
   * Moves an initiative from one timeframe to another
   */
  public async moveInitiative(
    roadmapId: string,
    sourceTimeframeId: string,
    targetTimeframeId: string,
    initiativeId: string
  ): Promise<Roadmap | null> {
    return this.initiativeOperationsService.moveInitiative(
      roadmapId, sourceTimeframeId, targetTimeframeId, initiativeId
    );
  }

  // === ITEM OPERATIONS ===

  /**
   * Adds an item to an initiative
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
    return this.itemOperationsService.addItem(
      roadmapId, timeframeId, initiativeId, title, 
      description, status, relatedEntities, notes
    );
  }

  /**
   * Updates an item in an initiative
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
    return this.itemOperationsService.updateItem(
      roadmapId, timeframeId, initiativeId, itemId, updates
    );
  }

  /**
   * Removes an item from an initiative
   */
  public async removeItem(
    roadmapId: string,
    timeframeId: string,
    initiativeId: string,
    itemId: string
  ): Promise<Roadmap | null> {
    return this.itemOperationsService.removeItem(
      roadmapId, timeframeId, initiativeId, itemId
    );
  }

  /**
   * Moves an item from one initiative to another
   */
  public async moveItem(
    roadmapId: string,
    sourceTimeframeId: string,
    sourceInitiativeId: string,
    targetTimeframeId: string,
    targetInitiativeId: string,
    itemId: string
  ): Promise<Roadmap | null> {
    return this.itemOperationsService.moveItem(
      roadmapId, sourceTimeframeId, sourceInitiativeId, 
      targetTimeframeId, targetInitiativeId, itemId
    );
  }

  // === NOTE OPERATIONS ===

  /**
   * Creates a new roadmap note
   */
  public async createNote(
    roadmapId: string,
    title: string,
    content: string,
    category: string
  ): Promise<RoadmapNote> {
    return this.noteOperationsService.createNote(
      roadmapId, title, content, category
    );
  }

  /**
   * Updates an existing roadmap note
   */
  public async updateNote(
    noteId: string,
    updates: {
      title?: string;
      content?: string;
      category?: string;
    }
  ): Promise<RoadmapNote | null> {
    return this.noteOperationsService.updateNote(noteId, updates);
  }

  /**
   * Deletes a roadmap note
   */
  public async deleteNote(noteId: string): Promise<boolean> {
    return this.noteOperationsService.deleteNote(noteId);
  }

  /**
   * Links a note to an entity within the roadmap
   */
  public async linkNoteToEntity(
    noteId: string,
    entityType: "timeframe" | "initiative" | "item",
    entityId: string
  ): Promise<RoadmapNote | null> {
    return this.noteOperationsService.linkNoteToEntity(
      noteId, entityType, entityId
    );
  }

  /**
   * Removes a link between a note and an entity
   */
  public async unlinkNoteFromEntity(
    noteId: string,
    entityType: "timeframe" | "initiative" | "item",
    entityId: string
  ): Promise<RoadmapNote | null> {
    return this.noteOperationsService.unlinkNoteFromEntity(
      noteId, entityType, entityId
    );
  }

  // === DEPRECATED METHODS ===

  /**
   * @deprecated Use createNote instead
   */
  public async createRoadmapNote(
    title: string,
    content: string,
    category: string,
    priority: string,
    timeline: string,
    relatedItems: string[] = []
  ): Promise<RoadmapNote> {
    return this.createNote("", title, content, category);
  }

  /**
   * @deprecated Use updateNote instead
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
    return this.updateNote(id, {
      title: updates.title,
      content: updates.content,
      category: updates.category
    });
  }

  /**
   * @deprecated Use deleteNote instead
   */
  public async deleteRoadmapNote(id: string): Promise<boolean> {
    return this.deleteNote(id);
  }
}