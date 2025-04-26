import { WorkflowState, WorkflowPhase } from "../../../WorkflowState.js";
import { GovernanceToolProxy } from "../../../GovernanceToolProxy.js";
import { RoadmapApplicationService } from "../../../../application/roadmap/index.js";
import { Roadmap } from "../../../../domain/entities/roadmap/index.js";

/**
 * Handlers for roadmap-level management operations in the governance server
 * Provides tools for creating, retrieving, and listing roadmaps
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
}