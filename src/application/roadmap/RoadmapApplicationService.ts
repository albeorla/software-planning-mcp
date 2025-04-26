import { Roadmap } from "../../domain/entities/roadmap/index.js";
import { RoadmapNote } from "../../domain/entities/RoadmapNote.js";
import { IRoadmapRepository } from "../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../domain/repositories/RoadmapNoteRepository.js";
import {
  RoadmapFacade,
  TimeframeInitiativeFacade,
  RoadmapItemFacade,
  RoadmapNoteFacade
} from "./facades/index.js";

/**
 * Main application service that combines specialized facades for roadmap operations
 * Maintains backward compatibility with the original RoadmapService
 */
export class RoadmapApplicationService {
  // Specialized facades for different aspects of roadmap functionality
  private readonly roadmapFacade: RoadmapFacade;
  private readonly timeframeInitiativeFacade: TimeframeInitiativeFacade;
  private readonly itemFacade: RoadmapItemFacade;
  private readonly noteFacade: RoadmapNoteFacade;

  /**
   * Creates a new RoadmapApplicationService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    roadmapRepository: IRoadmapRepository,
    noteRepository: IRoadmapNoteRepository
  ) {
    this.roadmapFacade = new RoadmapFacade(roadmapRepository, noteRepository);
    this.timeframeInitiativeFacade = new TimeframeInitiativeFacade(roadmapRepository, noteRepository);
    this.itemFacade = new RoadmapItemFacade(roadmapRepository, noteRepository);
    this.noteFacade = new RoadmapNoteFacade(roadmapRepository, noteRepository);
  }

  // -------------------------------------------------------------------------
  // Facade delegation methods
  // -------------------------------------------------------------------------

  // Delegate to RoadmapFacade
  public async getRoadmap(id: string): Promise<Roadmap | null> {
    return this.roadmapFacade.getRoadmap(id);
  }

  public async getAllRoadmaps(): Promise<Roadmap[]> {
    return this.roadmapFacade.getAllRoadmaps();
  }

  public async getRoadmapsByOwner(owner: string): Promise<Roadmap[]> {
    return this.roadmapFacade.getRoadmapsByOwner(owner);
  }

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
    return this.roadmapFacade.createRoadmap(
      title,
      description,
      version,
      owner,
      initialTimeframes
    );
  }

  public async updateRoadmap(
    id: string,
    updates: {
      title?: string;
      description?: string;
      version?: string;
      owner?: string;
    }
  ): Promise<Roadmap | null> {
    return this.roadmapFacade.updateRoadmap(id, updates);
  }

  public async deleteRoadmap(id: string): Promise<boolean> {
    return this.roadmapFacade.deleteRoadmap(id);
  }

  // Delegate to TimeframeInitiativeFacade
  public async addTimeframe(
    roadmapId: string,
    name: string,
    order: number
  ): Promise<Roadmap | null> {
    return this.timeframeInitiativeFacade.addTimeframe(roadmapId, name, order);
  }

  public async updateTimeframe(
    roadmapId: string,
    timeframeId: string,
    updates: {
      name?: string;
      order?: number;
    }
  ): Promise<Roadmap | null> {
    return this.timeframeInitiativeFacade.updateTimeframe(roadmapId, timeframeId, updates);
  }

  public async removeTimeframe(
    roadmapId: string,
    timeframeId: string
  ): Promise<Roadmap | null> {
    return this.timeframeInitiativeFacade.removeTimeframe(roadmapId, timeframeId);
  }

  public async addInitiative(
    roadmapId: string,
    timeframeId: string,
    title: string,
    description: string,
    category: string,
    priority: string
  ): Promise<Roadmap | null> {
    return this.timeframeInitiativeFacade.addInitiative(
      roadmapId,
      timeframeId,
      title,
      description,
      category,
      priority
    );
  }

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
    return this.timeframeInitiativeFacade.updateInitiative(
      roadmapId,
      timeframeId,
      initiativeId,
      updates
    );
  }

  public async removeInitiative(
    roadmapId: string,
    timeframeId: string,
    initiativeId: string
  ): Promise<Roadmap | null> {
    return this.timeframeInitiativeFacade.removeInitiative(
      roadmapId,
      timeframeId,
      initiativeId
    );
  }

  // Delegate to ItemFacade
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
    return this.itemFacade.addItem(
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
    return this.itemFacade.updateItem(
      roadmapId,
      timeframeId,
      initiativeId,
      itemId,
      updates
    );
  }

  public async removeItem(
    roadmapId: string,
    timeframeId: string,
    initiativeId: string,
    itemId: string
  ): Promise<Roadmap | null> {
    return this.itemFacade.removeItem(
      roadmapId,
      timeframeId,
      initiativeId,
      itemId
    );
  }

  // Delegate to NoteFacade
  public async getRoadmapNote(id: string): Promise<RoadmapNote | null> {
    return this.noteFacade.getRoadmapNote(id);
  }

  public async getAllRoadmapNotes(): Promise<RoadmapNote[]> {
    return this.noteFacade.getAllRoadmapNotes();
  }

  public async getRoadmapNotesByCategory(category: string): Promise<RoadmapNote[]> {
    return this.noteFacade.getRoadmapNotesByCategory(category);
  }

  public async getRoadmapNotesByPriority(priority: string): Promise<RoadmapNote[]> {
    return this.noteFacade.getRoadmapNotesByPriority(priority);
  }

  public async getRoadmapNotesByTimeline(timeline: string): Promise<RoadmapNote[]> {
    return this.noteFacade.getRoadmapNotesByTimeline(timeline);
  }

  public async createRoadmapNote(
    title: string,
    content: string,
    category: string,
    priority: string,
    timeline: string,
    relatedItems: string[] = []
  ): Promise<RoadmapNote> {
    return this.noteFacade.createRoadmapNote(
      title,
      content,
      category,
      priority,
      timeline,
      relatedItems
    );
  }

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
    return this.noteFacade.updateRoadmapNote(id, updates);
  }

  public async deleteRoadmapNote(id: string): Promise<boolean> {
    return this.noteFacade.deleteRoadmapNote(id);
  }
}