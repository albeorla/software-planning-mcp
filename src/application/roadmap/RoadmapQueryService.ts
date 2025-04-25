import { Roadmap } from "../../domain/entities/roadmap/index.js";
import { RoadmapNote } from "../../domain/entities/RoadmapNote.js";
import { IRoadmapRepository } from "../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../domain/repositories/RoadmapNoteRepository.js";

/**
 * Service responsible for querying roadmap and roadmap note data
 * Following the Command Query Responsibility Segregation (CQRS) pattern
 */
export class RoadmapQueryService {
  /**
   * Creates a new RoadmapQueryService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly noteRepository: IRoadmapNoteRepository
  ) {}

  // -------------------------------------------------------------------------
  // Roadmap Queries
  // -------------------------------------------------------------------------

  /**
   * Gets a roadmap by ID
   * @param id The ID of the roadmap to get
   * @returns The roadmap, or null if not found
   */
  public async getRoadmap(id: string): Promise<Roadmap | null> {
    return await this.roadmapRepository.findById(id);
  }

  /**
   * Gets all roadmaps
   * @returns All roadmaps
   */
  public async getAllRoadmaps(): Promise<Roadmap[]> {
    return await this.roadmapRepository.findAll();
  }

  /**
   * Gets all roadmaps by owner
   * @param owner The owner of the roadmaps
   * @returns All roadmaps owned by the specified owner
   */
  public async getRoadmapsByOwner(owner: string): Promise<Roadmap[]> {
    return (await this.roadmapRepository.findAll()).filter(
      roadmap => roadmap.owner === owner
    );
  }

  // -------------------------------------------------------------------------
  // Roadmap Note Queries
  // -------------------------------------------------------------------------

  /**
   * Gets a roadmap note by ID
   * @param id The ID of the note to get
   * @returns The note, or null if not found
   */
  public async getRoadmapNote(id: string): Promise<RoadmapNote | null> {
    return await this.noteRepository.findById(id);
  }

  /**
   * Gets all roadmap notes
   * @returns All roadmap notes
   */
  public async getAllRoadmapNotes(): Promise<RoadmapNote[]> {
    return await this.noteRepository.findAll();
  }

  /**
   * Gets all roadmap notes by category
   * @param category The category to filter by
   * @returns All roadmap notes in the specified category
   */
  public async getRoadmapNotesByCategory(category: string): Promise<RoadmapNote[]> {
    return await this.noteRepository.findByCategory(category);
  }

  /**
   * Gets all roadmap notes by priority
   * @param priority The priority to filter by
   * @returns All roadmap notes with the specified priority
   */
  public async getRoadmapNotesByPriority(priority: string): Promise<RoadmapNote[]> {
    return await this.noteRepository.findByPriority(priority);
  }

  /**
   * Gets all roadmap notes by timeline
   * @param timeline The timeline to filter by
   * @returns All roadmap notes with the specified timeline
   */
  public async getRoadmapNotesByTimeline(timeline: string): Promise<RoadmapNote[]> {
    return await this.noteRepository.findByTimeline(timeline);
  }
}