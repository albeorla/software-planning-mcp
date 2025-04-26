import { WorkflowState, WorkflowPhase } from "../../../../WorkflowState.js";
import { GovernanceToolProxy } from "../../../../GovernanceToolProxy.js";
import { RoadmapApplicationService } from "../../../../../application/roadmap/index.js";

/**
 * Handlers for roadmap component operations in the governance server
 * Provides tools for adding and managing timeframes, initiatives, and items
 */
export class RoadmapComponentHandlers {
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