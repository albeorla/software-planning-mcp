import { Roadmap } from '../entities/roadmap/Roadmap.js';
import { RoadmapPriorityService } from './RoadmapPriorityService.js';
import { RoadmapTimeframeService } from './RoadmapTimeframeService.js';

/**
 * Domain service for comprehensive roadmap validation
 * Coordinates multiple validation rules across the roadmap
 */
export class RoadmapValidationService {
  private readonly priorityService: RoadmapPriorityService;
  private readonly timeframeService: RoadmapTimeframeService;
  
  constructor() {
    this.priorityService = new RoadmapPriorityService();
    this.timeframeService = new RoadmapTimeframeService();
  }
  
  /**
   * Validates an entire roadmap against all domain rules
   * @param roadmap The roadmap to validate
   * @returns Validation result with success flag and array of error messages
   */
  public validateRoadmap(roadmap: Roadmap): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Validate priority constraints
    const priorityValidation = this.priorityService.validatePriorities(roadmap);
    if (!priorityValidation.valid && priorityValidation.message) {
      errors.push(priorityValidation.message);
    }
    
    // Validate timeframe constraints
    const timeframeValidation = this.timeframeService.validateTimeframes(roadmap);
    if (!timeframeValidation.valid && timeframeValidation.message) {
      errors.push(timeframeValidation.message);
    }
    
    // Validate roadmap has a title
    if (!roadmap.title || roadmap.title.trim() === '') {
      errors.push('Roadmap must have a title');
    }
    
    // Validate roadmap has a version
    if (!roadmap.version || roadmap.version.trim() === '') {
      errors.push('Roadmap must have a version');
    }
    
    // Validate roadmap has an owner
    if (!roadmap.owner || roadmap.owner.trim() === '') {
      errors.push('Roadmap must have an owner');
    }
    
    // Validate roadmap initiatives have unique titles within timeframes
    const initiativeTitles = new Map<string, Set<string>>();
    
    for (const timeframe of roadmap.timeframes) {
      const titles = new Set<string>();
      initiativeTitles.set(timeframe.id, titles);
      
      for (const initiative of timeframe.initiatives) {
        const normalizedTitle = initiative.title.trim().toLowerCase();
        if (titles.has(normalizedTitle)) {
          errors.push(`Duplicate initiative title "${initiative.title}" in timeframe "${timeframe.name}"`);
        } else {
          titles.add(normalizedTitle);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Verifies a roadmap is consistent and fixes any inconsistencies
   * @param roadmap The roadmap to normalize
   * @returns A normalized roadmap with fixed inconsistencies
   */
  public normalizeRoadmap(roadmap: Roadmap): Roadmap {
    // First, normalize timeframe ordering
    let normalizedRoadmap = this.timeframeService.normalizeTimeframeOrdering(roadmap);
    
    // Then, rebalance priorities if needed
    normalizedRoadmap = this.priorityService.rebalancePriorities(normalizedRoadmap);
    
    return normalizedRoadmap;
  }
}