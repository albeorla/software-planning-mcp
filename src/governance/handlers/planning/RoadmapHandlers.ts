import { WorkflowState } from "../../WorkflowState.js";
import { GovernanceToolProxy } from "../../GovernanceToolProxy.js";
import { RoadmapApplicationService } from "../../../application/roadmap/index.js";
import { RoadmapManagementHandlers, RoadmapNoteHandlers } from "./roadmap/index.js";
import { RoadmapComponentHandlers } from "./roadmap/components/RoadmapComponentHandlers.js";

/**
 * @deprecated This class is maintained for backward compatibility.
 * Please use the specialized classes from the roadmap/ directory instead:
 * - RoadmapManagementHandlers: For core roadmap operations
 * - RoadmapNoteHandlers: For roadmap note operations
 */
export class RoadmapHandlers {
  // -------------------------------------------------------------------------
  // Roadmap Management - Redirecting to RoadmapManagementHandlers
  // -------------------------------------------------------------------------

  /**
   * @deprecated Use RoadmapManagementHandlers.createRoadmap instead
   */
  public static async createRoadmap(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      title: string;
      description: string;
      version: string;
      owner: string;
      initialTimeframes?: Array<{
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
      }>;
    }
  ): Promise<{ success: boolean; roadmap: any }> {
    console.warn('RoadmapHandlers.createRoadmap is deprecated. Use RoadmapManagementHandlers.createRoadmap instead.');
    return RoadmapManagementHandlers.createRoadmap(state, proxy, roadmapService, data);
  }

  /**
   * @deprecated Use RoadmapManagementHandlers.getRoadmap instead
   */
  public static async getRoadmap(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: { id: string }
  ): Promise<{ success: boolean; roadmap: any }> {
    console.warn('RoadmapHandlers.getRoadmap is deprecated. Use RoadmapManagementHandlers.getRoadmap instead.');
    return RoadmapManagementHandlers.getRoadmap(state, proxy, roadmapService, data);
  }

  /**
   * @deprecated Use RoadmapManagementHandlers.listRoadmaps instead
   */
  public static async listRoadmaps(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: { owner?: string }
  ): Promise<{ success: boolean; roadmaps: any[] }> {
    console.warn('RoadmapHandlers.listRoadmaps is deprecated. Use RoadmapManagementHandlers.listRoadmaps instead.');
    return RoadmapManagementHandlers.listRoadmaps(state, proxy, roadmapService);
  }

  // -------------------------------------------------------------------------
  // Timeframe Management - Redirecting to RoadmapManagementHandlers
  // -------------------------------------------------------------------------

  /**
   * @deprecated Use RoadmapManagementHandlers.addTimeframe instead
   */
  public static async addTimeframe(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      roadmapId: string;
      name: string;
      order: number;
    }
  ): Promise<{ success: boolean; timeframe: any }> {
    console.warn('RoadmapHandlers.addTimeframe is deprecated. Use RoadmapManagementHandlers.addTimeframe instead.');
    // Use the component handlers which implement the addTimeframe method
    return RoadmapComponentHandlers.addTimeframe(state, proxy, roadmapService, data);
  }

  // -------------------------------------------------------------------------
  // Initiative Management - Redirecting to RoadmapManagementHandlers
  // -------------------------------------------------------------------------

  /**
   * @deprecated Use RoadmapManagementHandlers.addInitiative instead
   */
  public static async addInitiative(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      roadmapId: string;
      timeframeId: string;
      title: string;
      description: string;
      category: string;
      priority: string;
    }
  ): Promise<{ success: boolean; initiative: any }> {
    console.warn('RoadmapHandlers.addInitiative is deprecated. Use RoadmapManagementHandlers.addInitiative instead.');
    // Use the component handlers which implement the addInitiative method
    return RoadmapComponentHandlers.addInitiative(state, proxy, roadmapService, data);
  }

  // -------------------------------------------------------------------------
  // Roadmap Item Management - Redirecting to RoadmapManagementHandlers
  // -------------------------------------------------------------------------

  /**
   * @deprecated Use RoadmapManagementHandlers.addItem instead
   */
  public static async addItem(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      roadmapId: string;
      timeframeId: string;
      initiativeId: string;
      title: string;
      description: string;
      status?: string;
      relatedEntities?: string[];
      notes?: string;
    }
  ): Promise<{ success: boolean; item: any }> {
    console.warn('RoadmapHandlers.addItem is deprecated. Use RoadmapManagementHandlers.addItem instead.');
    // Use the component handlers which implement the addItem method
    return RoadmapComponentHandlers.addItem(state, proxy, roadmapService, data);
  }

  // -------------------------------------------------------------------------
  // Roadmap Note Management - Redirecting to RoadmapNoteHandlers
  // -------------------------------------------------------------------------

  /**
   * @deprecated Use RoadmapNoteHandlers.createRoadmapNote instead
   */
  public static async createRoadmapNote(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      title: string;
      content: string;
      category: string;
      priority: string;
      timeline: string;
      relatedItems?: string[];
    }
  ): Promise<{ success: boolean; note: any }> {
    console.warn('RoadmapHandlers.createRoadmapNote is deprecated. Use RoadmapNoteHandlers.createRoadmapNote instead.');
    
    // Adapt parameters to match the new interface
    const adaptedData = {
      title: data.title,
      content: data.content,
      category: data.category,
      tags: [data.priority, data.timeline],
      relatedRoadmapIds: data.relatedItems
    };
    
    return RoadmapNoteHandlers.createRoadmapNote(state, proxy, roadmapService, adaptedData);
  }

  /**
   * @deprecated Use RoadmapNoteHandlers.getRoadmapNote instead
   */
  public static async getRoadmapNote(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: { id: string }
  ): Promise<{ success: boolean; note: any }> {
    console.warn('RoadmapHandlers.getRoadmapNote is deprecated. Use RoadmapNoteHandlers.getRoadmapNote instead.');
    return RoadmapNoteHandlers.getRoadmapNote(state, proxy, roadmapService, data);
  }

  /**
   * @deprecated Use RoadmapNoteHandlers.updateRoadmapNote instead
   */
  public static async updateRoadmapNote(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      id: string;
      title?: string;
      content?: string;
      category?: string;
      priority?: string;
      timeline?: string;
      relatedItems?: string[];
    }
  ): Promise<{ success: boolean; note: any }> {
    console.warn('RoadmapHandlers.updateRoadmapNote is deprecated. Use RoadmapNoteHandlers.updateRoadmapNote instead.');
    
    // Adapt parameters to match the new interface
    const adaptedData: any = {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
    };

    // Only add tags if either priority or timeline is specified
    if (data.priority || data.timeline) {
      adaptedData.tags = [];
      if (data.priority) adaptedData.tags.push(data.priority);
      if (data.timeline) adaptedData.tags.push(data.timeline);
    }

    if (data.relatedItems) {
      adaptedData.relatedRoadmapIds = data.relatedItems;
    }
    
    return RoadmapNoteHandlers.updateRoadmapNote(state, proxy, roadmapService, adaptedData);
  }

  /**
   * @deprecated Use RoadmapNoteHandlers.listRoadmapNotes instead
   */
  public static async listRoadmapNotes(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      category?: string;
      priority?: string;
      timeline?: string;
    }
  ): Promise<{ success: boolean; notes: any[] }> {
    console.warn('RoadmapHandlers.listRoadmapNotes is deprecated. Use RoadmapNoteHandlers.listRoadmapNotes instead.');
    
    // Adapt parameters to match the new interface
    const adaptedData: any = {};
    
    if (data.category) {
      adaptedData.category = data.category;
    } else if (data.priority) {
      adaptedData.tag = data.priority;
    } else if (data.timeline) {
      adaptedData.tag = data.timeline;
    }
    
    return RoadmapNoteHandlers.listRoadmapNotes(state, proxy, roadmapService, adaptedData);
  }

  /**
   * @deprecated Use RoadmapNoteHandlers.deleteRoadmapNote instead
   */
  public static async deleteRoadmapNote(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: { id: string }
  ): Promise<{ success: boolean }> {
    console.warn('RoadmapHandlers.deleteRoadmapNote is deprecated. Use RoadmapNoteHandlers.deleteRoadmapNote instead.');
    return RoadmapNoteHandlers.deleteRoadmapNote(state, proxy, roadmapService, data);
  }
}