import { WorkflowState, WorkflowPhase } from "../../../WorkflowState.js";
import { GovernanceToolProxy } from "../../../GovernanceToolProxy.js";
import { RoadmapApplicationService } from "../../../../application/roadmap/index.js";
import { Roadmap } from "../../../../domain/entities/roadmap/index.js";

/**
 * Handlers for roadmap management operations in the governance server
 * Provides tools for creating and managing roadmaps and their components
 */
export class RoadmapManagementHandlers {
  /**
   * Creates a new roadmap
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   * @param data Roadmap data
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
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      return {
        success: false,
        roadmap: null,
      };
    }

    try {
      // Create the roadmap
      const roadmap = await roadmapService.createRoadmap(
        data.title,
        data.description,
        data.version,
        data.owner,
        data.initialTimeframes || []
      );

      return {
        success: true,
        roadmap: roadmap.toJSON(),
      };
    } catch (error: any) {
      console.error("Error creating roadmap:", error);
      return {
        success: false,
        roadmap: null,
      };
    }
  }

  /**
   * Get a roadmap by ID
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   * @param data Roadmap query data
   */
  public static async getRoadmap(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService,
    data: {
      id: string;
    }
  ): Promise<{ success: boolean; roadmap: any }> {
    try {
      const roadmap = await roadmapService.getRoadmap(data.id);

      if (!roadmap) {
        return {
          success: false,
          roadmap: null,
        };
      }

      return {
        success: true,
        roadmap: roadmap.toJSON(),
      };
    } catch (error: any) {
      console.error("Error getting roadmap:", error);
      return {
        success: false,
        roadmap: null,
      };
    }
  }

  /**
   * List all roadmaps
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   */
  public static async listRoadmaps(
    state: WorkflowState,
    proxy: GovernanceToolProxy,
    roadmapService: RoadmapApplicationService
  ): Promise<{ success: boolean; roadmaps: any[] }> {
    try {
      const roadmaps = await roadmapService.getAllRoadmaps();

      return {
        success: true,
        roadmaps: roadmaps.map((roadmap: Roadmap) => ({
          id: roadmap.id,
          title: roadmap.title,
          description: roadmap.description,
          version: roadmap.version,
          owner: roadmap.owner,
          timeframeCount: roadmap.timeframes.length,
          createdAt: roadmap.createdAt,
          updatedAt: roadmap.updatedAt
        })),
      };
    } catch (error: any) {
      console.error("Error listing roadmaps:", error);
      return {
        success: false,
        roadmaps: [],
      };
    }
  }

  /**
   * Add a timeframe to a roadmap
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   * @param data Timeframe data
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
  ): Promise<{ success: boolean; timeframe: any; error?: string }> {
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      return {
        success: false,
        timeframe: null,
      };
    }

    try {
      const roadmap = await roadmapService.addTimeframe(
        data.roadmapId,
        data.name,
        data.order
      );

      if (!roadmap) {
        return {
          success: false,
          timeframe: null,
        };
      }

      // Find the newly added timeframe
      const timeframe = roadmap.timeframes.find((tf: any) => tf.name === data.name && tf.order === data.order);
      
      if (!timeframe) {
        return {
          success: false,
          timeframe: null,
          error: "Failed to find the newly added timeframe"
        };
      }
      
      return {
        success: true,
        timeframe: {
          id: timeframe.id,
          name: timeframe.name,
          order: timeframe.order,
          roadmapId: roadmap.id
        }
      };
    } catch (error: any) {
      console.error("Error adding timeframe:", error);
      return {
        success: false,
        timeframe: null,
      };
    }
  }

  /**
   * Add an initiative to a timeframe
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   * @param data Initiative data
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
  ): Promise<{ success: boolean; initiative: any; error?: string }> {
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      return {
        success: false,
        initiative: null,
      };
    }

    try {
      const roadmap = await roadmapService.addInitiative(
        data.roadmapId,
        data.timeframeId,
        data.title,
        data.description,
        data.category,
        data.priority
      );

      if (!roadmap) {
        return {
          success: false,
          initiative: null,
        };
      }
      
      const timeframe = roadmap.getTimeframe(data.timeframeId);
      if (!timeframe) {
        return {
          success: false,
          initiative: null,
          error: "Failed to find the timeframe"
        };
      }
      
      // Find the newly added initiative by title
      const initiative = timeframe.initiatives.find((init: any) => init.title === data.title);
      if (!initiative) {
        return {
          success: false,
          initiative: null,
          error: "Failed to find the newly added initiative"
        };
      }
      
      return {
        success: true,
        initiative: {
          id: initiative.id,
          title: initiative.title,
          category: initiative.category,
          priority: initiative.priority,
          timeframeId: data.timeframeId,
          roadmapId: data.roadmapId
        }
      };
    } catch (error: any) {
      console.error("Error adding initiative:", error);
      return {
        success: false,
        initiative: null,
      };
    }
  }

  /**
   * Add an item to an initiative
   * @param state Current workflow state
   * @param proxy Governance tool proxy
   * @param roadmapService Roadmap application service
   * @param data Item data
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
  ): Promise<{ success: boolean; item: any; error?: string }> {
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      return {
        success: false,
        item: null,
      };
    }

    try {
      const roadmap = await roadmapService.addItem(
        data.roadmapId,
        data.timeframeId,
        data.initiativeId,
        data.title,
        data.description,
        data.status,
        data.relatedEntities,
        data.notes
      );

      if (!roadmap) {
        return {
          success: false,
          item: null,
        };
      }
      
      const timeframe = roadmap.getTimeframe(data.timeframeId);
      if (!timeframe) {
        return {
          success: false,
          item: null,
          error: "Failed to find the timeframe"
        };
      }
      
      const initiative = timeframe.getInitiative(data.initiativeId);
      if (!initiative) {
        return {
          success: false,
          item: null,
          error: "Failed to find the initiative"
        };
      }
      
      // Find the newly added item by title
      const item = initiative.items.find((itm: any) => itm.title === data.title);
      if (!item) {
        return {
          success: false,
          item: null,
          error: "Failed to find the newly added item"
        };
      }
      
      return {
        success: true,
        item: {
          id: item.id,
          title: item.title,
          status: item.status,
          initiativeId: data.initiativeId,
          timeframeId: data.timeframeId,
          roadmapId: data.roadmapId
        }
      };
    } catch (error: any) {
      console.error("Error adding item:", error);
      return {
        success: false,
        item: null,
      };
    }
  }
}