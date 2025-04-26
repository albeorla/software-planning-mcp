import { Roadmap } from '../entities/roadmap/Roadmap.js';
import { Priority } from '../value-objects/Priority.js';

/**
 * Domain service for managing roadmap priorities
 * Domain services contain business logic that doesn't naturally fit within any single entity
 */
export class RoadmapPriorityService {
  /**
   * Maximum allowed high-priority initiatives per roadmap
   */
  private readonly MAX_HIGH_PRIORITY_INITIATIVES = 5;
  
  /**
   * Validates that a roadmap follows priority constraints
   * @param roadmap The roadmap to validate
   * @returns Validation result with success flag and optional error message
   */
  public validatePriorities(roadmap: Roadmap): { valid: boolean; message?: string } {
    const highPriorityCount = this.countHighPriorityInitiatives(roadmap);
    
    if (highPriorityCount > this.MAX_HIGH_PRIORITY_INITIATIVES) {
      return {
        valid: false,
        message: `Too many high-priority initiatives (${highPriorityCount}). Maximum allowed is ${this.MAX_HIGH_PRIORITY_INITIATIVES}.`
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Counts high-priority initiatives in a roadmap
   * @param roadmap The roadmap to analyze
   * @returns The number of high-priority initiatives
   */
  private countHighPriorityInitiatives(roadmap: Roadmap): number {
    let count = 0;
    
    for (const timeframe of roadmap.timeframes) {
      for (const initiative of timeframe.initiatives) {
        if (initiative.priority.isHigh) {
          count++;
        }
      }
    }
    
    return count;
  }
  
  /**
   * Rebalances initiative priorities within a roadmap to adhere to constraints
   * @param roadmap The roadmap to rebalance
   * @returns A new roadmap with rebalanced priorities
   */
  public rebalancePriorities(roadmap: Roadmap): Roadmap {
    const highPriorityCount = this.countHighPriorityInitiatives(roadmap);
    
    // If we're under the limit, no rebalancing needed
    if (highPriorityCount <= this.MAX_HIGH_PRIORITY_INITIATIVES) {
      return roadmap;
    }
    
    // Create a mutable working copy of the roadmap
    let updatedRoadmap = roadmap;
    
    // We need to downgrade (highPriorityCount - MAX) initiatives
    const downgradeCount = highPriorityCount - this.MAX_HIGH_PRIORITY_INITIATIVES;
    
    // Collect all high-priority initiatives across timeframes
    const highPriorityInitiatives: Array<{
      timeframeId: string;
      initiativeId: string;
      title: string;
      // Lower score means higher priority to keep as high
      score: number;
    }> = [];
    
    // Score each high-priority initiative (lower score = higher priority to keep)
    for (const timeframe of roadmap.timeframes) {
      for (const initiative of timeframe.initiatives) {
        if (initiative.priority.isHigh) {
          // Scoring algorithm:
          // Later timeframes get higher scores (more likely to downgrade)
          // Initiatives with fewer items get higher scores (more likely to downgrade)
          const timeframeOrder = timeframe.order;
          const itemCount = initiative.items.length;
          
          // Calculate a score (lower = higher priority to keep)
          // This is a simple algorithm that could be refined based on business rules
          const score = timeframeOrder * 10 - itemCount;
          
          highPriorityInitiatives.push({
            timeframeId: timeframe.id,
            initiativeId: initiative.id,
            title: initiative.title,
            score
          });
        }
      }
    }
    
    // Sort by score (highest score first = most likely to downgrade)
    highPriorityInitiatives.sort((a, b) => b.score - a.score);
    
    // Downgrade the top N initiatives
    for (let i = 0; i < downgradeCount && i < highPriorityInitiatives.length; i++) {
      const { timeframeId, initiativeId } = highPriorityInitiatives[i];
      
      // Find the timeframe
      const timeframe = updatedRoadmap.getTimeframe(timeframeId);
      if (!timeframe) continue;
      
      // Find the initiative
      const initiative = timeframe.getInitiative(initiativeId);
      if (!initiative) continue;
      
      // Downgrade to medium priority
      const updatedInitiative = initiative.updatePriority(Priority.MEDIUM, {
        roadmapId: updatedRoadmap.id,
        timeframeId: timeframe.id
      });
      
      // Update the timeframe
      const updatedTimeframe = timeframe
        .removeInitiative(initiativeId)
        .addInitiative(updatedInitiative);
      
      // Update the roadmap
      updatedRoadmap = updatedRoadmap
        .removeTimeframe(timeframeId)
        .addTimeframe(updatedTimeframe);
    }
    
    return updatedRoadmap;
  }
}