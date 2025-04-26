import { RoadmapNote } from "../../../domain/entities/RoadmapNote.js";
import { IRoadmapRepository } from "../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../domain/repositories/RoadmapNoteRepository.js";
import { CompositeRoadmapCommandService } from "../commands/CompositeRoadmapCommandService.js";
import { RoadmapQueryService } from "../RoadmapQueryService.js";

/**
 * Facade service for roadmap note operations
 */
export class RoadmapNoteFacade {
  private readonly commandService: CompositeRoadmapCommandService;
  private readonly queryService: RoadmapQueryService;

  /**
   * Creates a new RoadmapNoteFacade
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    roadmapRepository: IRoadmapRepository,
    noteRepository: IRoadmapNoteRepository
  ) {
    this.commandService = new CompositeRoadmapCommandService(roadmapRepository, noteRepository);
    this.queryService = new RoadmapQueryService(roadmapRepository, noteRepository);
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