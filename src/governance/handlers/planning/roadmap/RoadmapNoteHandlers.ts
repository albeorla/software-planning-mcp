import { WorkflowState, WorkflowPhase } from "../../../WorkflowState.js";
import { GovernanceToolProxy } from "../../../GovernanceToolProxy.js";
import { RoadmapApplicationService } from "../../../../application/roadmap/index.js";

/**
 * Handlers for roadmap note operations in the governance server
 * Provides tools for creating, updating, and managing roadmap notes
 */
export class RoadmapNoteHandlers {
  /**
   * Creates a new roadmap note
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   * @param data Note data
   */
  public static async createRoadmapNote(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      title: string;
      content: string;
      category: string;
      tags?: string[];
      relatedRoadmapIds?: string[];
    }
  ): Promise<{ success: boolean; note: any }> {
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      return {
        success: false,
        note: null,
      };
    }

    try {
      const note = await roadmapService.createRoadmapNote(
        data.title,
        data.content,
        data.category,
        data.tags?.[0] || "", // priority
        data.tags?.[1] || "", // timeline
        data.relatedRoadmapIds
      );

      return {
        success: true,
        note: {
          id: note.id,
          title: note.title,
          content: note.content,
          category: note.category,
          priority: data.tags?.[0] || "",
          timeline: data.tags?.[1] || "",
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        },
      };
    } catch (error: any) {
      console.error("Error creating roadmap note:", error);
      return {
        success: false,
        note: null,
      };
    }
  }

  /**
   * Get a roadmap note by ID
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   * @param data Note query data
   */
  public static async getRoadmapNote(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      id: string;
    }
  ): Promise<{ success: boolean; note: any }> {
    try {
      const note = await roadmapService.getRoadmapNote(data.id);

      if (!note) {
        return {
          success: false,
          note: null,
        };
      }

      return {
        success: true,
        note: {
          id: note.id,
          title: note.title,
          content: note.content,
          category: note.category,
          priority: note.priority || "",
          timeline: note.timeline || "",
          relatedItems: note.relatedItems,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        },
      };
    } catch (error: any) {
      console.error("Error getting roadmap note:", error);
      return {
        success: false,
        note: null,
      };
    }
  }

  /**
   * Update a roadmap note
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   * @param data Note update data
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
      tags?: string[];
      relatedRoadmapIds?: string[];
    }
  ): Promise<{ success: boolean; note: any }> {
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      return {
        success: false,
        note: null,
      };
    }

    try {
      const note = await roadmapService.updateRoadmapNote(
        data.id,
        {
          title: data.title,
          content: data.content,
          category: data.category,
          priority: data.tags?.[0] || undefined,
          timeline: data.tags?.[1] || undefined,
          relatedItems: data.relatedRoadmapIds,
        }
      );

      if (!note) {
        return {
          success: false,
          note: null,
        };
      }

      return {
        success: true,
        note: {
          id: note.id,
          title: note.title,
          category: note.category,
          priority: note.priority || "",
          timeline: note.timeline || "",
          updatedAt: note.updatedAt
        },
      };
    } catch (error: any) {
      console.error("Error updating roadmap note:", error);
      return {
        success: false,
        note: null,
      };
    }
  }

  /**
   * List all roadmap notes
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   * @param data Filter options
   */
  public static async listRoadmapNotes(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data?: {
      category?: string;
      tag?: string;
      relatedRoadmapId?: string;
    }
  ): Promise<{ success: boolean; notes: any[] }> {
    try {
      let notes;

      if (data?.category) {
        notes = await roadmapService.getRoadmapNotesByCategory(data.category);
      } else if (data?.tag) {
        // Use priority if tag is provided
        notes = await roadmapService.getRoadmapNotesByPriority(data.tag);
      } else if (data?.relatedRoadmapId) {
        // For related roadmap, we might need to filter manually
        const allNotes = await roadmapService.getAllRoadmapNotes();
        notes = allNotes.filter((note: any) => 
          note.relatedItems && note.relatedItems.includes(data.relatedRoadmapId || "")
        );
      } else {
        notes = await roadmapService.getAllRoadmapNotes();
      }

      return {
        success: true,
        notes: notes.map(note => ({
          id: note.id,
          title: note.title,
          category: note.category,
          priority: note.priority || "",
          timeline: note.timeline || ""
        })),
      };
    } catch (error: any) {
      console.error("Error listing roadmap notes:", error);
      return {
        success: false,
        notes: [],
      };
    }
  }

  /**
   * Delete a roadmap note
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   * @param data Note ID
   */
  public static async deleteRoadmapNote(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      id: string;
    }
  ): Promise<{ success: boolean }> {
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      return {
        success: false,
      };
    }

    try {
      const success = await roadmapService.deleteRoadmapNote(data.id);

      return {
        success,
      };
    } catch (error: any) {
      console.error("Error deleting roadmap note:", error);
      return {
        success: false,
      };
    }
  }
}