import { IRoadmapRepository } from "../../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../../domain/repositories/RoadmapNoteRepository.js";
import { RoadmapEntityCommandService } from "../RoadmapEntityCommandService.js";
import { TimeframeCommandService } from "../TimeframeCommandService.js";
import { InitiativeCommandService } from "../InitiativeCommandService.js";
import { ItemCommandService } from "../ItemCommandService.js";
import { RoadmapNoteCommandService } from "./RoadmapNoteCommandService.js";

/**
 * Base class for roadmap command services that contains common initialization
 * and service references. This reduces duplication across service implementations.
 */
export abstract class CompositeCommandServiceBase {
  // Specialized command services
  protected readonly roadmapEntityCommandService: RoadmapEntityCommandService;
  protected readonly timeframeCommandService: TimeframeCommandService;
  protected readonly initiativeCommandService: InitiativeCommandService;
  protected readonly itemCommandService: ItemCommandService;
  protected readonly roadmapNoteCommandService: RoadmapNoteCommandService;

  /**
   * Creates a new CompositeCommandServiceBase
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    protected readonly roadmapRepository: IRoadmapRepository,
    protected readonly noteRepository: IRoadmapNoteRepository
  ) {
    this.roadmapEntityCommandService = new RoadmapEntityCommandService(roadmapRepository);
    this.timeframeCommandService = new TimeframeCommandService(roadmapRepository);
    this.initiativeCommandService = new InitiativeCommandService(roadmapRepository);
    this.itemCommandService = new ItemCommandService(roadmapRepository);
    this.roadmapNoteCommandService = new RoadmapNoteCommandService(noteRepository);
  }
}