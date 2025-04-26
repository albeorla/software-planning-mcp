import { Roadmap } from "../../../../domain/entities/roadmap/Roadmap.js";
import { RoadmapNote } from "../../../../domain/entities/RoadmapNote.js";
import { IRoadmapRepository } from "../../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../../domain/repositories/RoadmapNoteRepository.js";
import { EventDispatcher } from "../../../../domain/events/EventDispatcher.js";
import { RoadmapValidationService, RoadmapPriorityService, RoadmapTimeframeService } from "../../../../domain/services/index.js";

/**
 * Service responsible for dispatching roadmap command operations
 * Handles validation, normalization, and event dispatching
 */
export class RoadmapCommandDispatcher {
  /**
   * The event dispatcher instance
   */
  private readonly eventDispatcher: EventDispatcher;
  
  /**
   * Domain services for roadmap business rules
   */
  private readonly validationService: RoadmapValidationService;
  private readonly priorityService: RoadmapPriorityService;
  private readonly timeframeService: RoadmapTimeframeService;

  /**
   * Creates a new RoadmapCommandDispatcher
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly noteRepository: IRoadmapNoteRepository | null
  ) {
    this.eventDispatcher = EventDispatcher.getInstance();
    this.validationService = new RoadmapValidationService();
    this.priorityService = new RoadmapPriorityService();
    this.timeframeService = new RoadmapTimeframeService();
  }

  /**
   * Validates a roadmap against domain rules
   * @param roadmap The roadmap to validate
   * @throws Error if validation fails
   */
  public validateRoadmap(roadmap: Roadmap): void {
    const validation = this.validationService.validateRoadmap(roadmap);
    if (!validation.valid) {
      throw new Error(
        `Roadmap validation failed: ${validation.errors.join(', ')}`
      );
    }
  }

  /**
   * Normalizes a roadmap to ensure consistency
   * @param roadmap The roadmap to normalize
   * @returns The normalized roadmap
   */
  public normalizeRoadmap(roadmap: Roadmap): Roadmap {
    return this.validationService.normalizeRoadmap(roadmap);
  }

  /**
   * Dispatches domain events
   * @param events The events to dispatch
   */
  public dispatchEvents(events: any[]): void {
    this.eventDispatcher.dispatchAll(events);
  }

  /**
   * Saves a roadmap
   * @param roadmap The roadmap to save
   */
  public async saveRoadmap(roadmap: Roadmap): Promise<void> {
    await this.roadmapRepository.save(roadmap);
  }

  /**
   * Validates, normalizes, and saves a roadmap
   * @param roadmap The roadmap to process
   * @returns The processed roadmap
   */
  public async processAndSaveRoadmap(roadmap: Roadmap): Promise<Roadmap> {
    // Validate the roadmap
    this.validateRoadmap(roadmap);
    
    // Normalize the roadmap
    const normalizedRoadmap = this.normalizeRoadmap(roadmap);
    
    // Save the roadmap
    await this.saveRoadmap(normalizedRoadmap);
    
    return normalizedRoadmap;
  }
}