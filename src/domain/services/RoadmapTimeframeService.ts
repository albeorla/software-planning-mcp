import { Roadmap } from '../entities/roadmap/Roadmap.js';
import { RoadmapTimeframe } from '../entities/roadmap/RoadmapTimeframe.js';

/**
 * Domain service for managing roadmap timeframes
 * Encapsulates business rules related to timeframes
 */
export class RoadmapTimeframeService {
  /**
   * Maximum allowed timeframes per roadmap
   */
  private readonly MAX_TIMEFRAMES = 10;
  
  /**
   * Validates the timeframes of a roadmap
   * @param roadmap The roadmap to validate
   * @returns Validation result with success flag and optional error message
   */
  public validateTimeframes(roadmap: Roadmap): { valid: boolean; message?: string } {
    // Check timeframe count
    if (roadmap.timeframes.length > this.MAX_TIMEFRAMES) {
      return {
        valid: false,
        message: `Too many timeframes (${roadmap.timeframes.length}). Maximum allowed is ${this.MAX_TIMEFRAMES}.`
      };
    }
    
    // Check for duplicate timeframe orders
    const orders = new Set<number>();
    const duplicateOrders: number[] = [];
    
    for (const timeframe of roadmap.timeframes) {
      if (orders.has(timeframe.order)) {
        duplicateOrders.push(timeframe.order);
      } else {
        orders.add(timeframe.order);
      }
    }
    
    if (duplicateOrders.length > 0) {
      return {
        valid: false,
        message: `Duplicate timeframe orders detected: ${duplicateOrders.join(', ')}`
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Reorders timeframes to ensure sequential order without gaps
   * @param roadmap The roadmap to normalize
   * @returns A new roadmap with normalized timeframe ordering
   */
  public normalizeTimeframeOrdering(roadmap: Roadmap): Roadmap {
    if (roadmap.timeframes.length === 0) {
      return roadmap;
    }
    
    // Sort timeframes by order
    const sortedTimeframes = [...roadmap.timeframes].sort((a, b) => a.order - b.order);
    
    // Create a new roadmap without timeframes
    let updatedRoadmap = roadmap;
    for (const timeframe of roadmap.timeframes) {
      updatedRoadmap = updatedRoadmap.removeTimeframe(timeframe.id);
    }
    
    // Add timeframes back with normalized order
    for (let i = 0; i < sortedTimeframes.length; i++) {
      const timeframe = sortedTimeframes[i];
      
      // If the order doesn't match the index, update the timeframe with the new order
      if (timeframe.order !== i) {
        const updatedTimeframe = timeframe.update({ order: i });
        updatedRoadmap = updatedRoadmap.addTimeframe(updatedTimeframe);
      } else {
        // Order is already correct, just add it back
        updatedRoadmap = updatedRoadmap.addTimeframe(timeframe);
      }
    }
    
    return updatedRoadmap;
  }
  
  /**
   * Suggests optimal timeframe structure based on initiatives and items
   * @param roadmap The roadmap to analyze
   * @returns A suggested timeframe structure
   */
  public suggestTimeframeStructure(roadmap: Roadmap): {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  } {
    // Analyze initiatives and categorize them into timeframes
    const shortTerm: string[] = [];
    const mediumTerm: string[] = [];
    const longTerm: string[] = [];
    
    for (const timeframe of roadmap.timeframes) {
      for (const initiative of timeframe.initiatives) {
        // Use priority to determine suggested timeframe
        if (initiative.priority.isHigh) {
          shortTerm.push(initiative.title);
        } else if (initiative.priority.isMedium) {
          mediumTerm.push(initiative.title);
        } else {
          longTerm.push(initiative.title);
        }
      }
    }
    
    return {
      shortTerm,
      mediumTerm,
      longTerm
    };
  }
}