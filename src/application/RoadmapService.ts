import { IRoadmapRepository } from "../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../domain/repositories/RoadmapNoteRepository.js";
import { RoadmapApplicationService } from "./roadmap/RoadmapApplicationService.js";

/**
 * @deprecated This service is maintained for backward compatibility.
 * Please use the specialized services in the roadmap/ directory instead:
 * - RoadmapApplicationService: Facade that provides all functionality
 * - RoadmapQueryService: For read operations
 * - RoadmapCommandService: For write operations
 */
// Re-export the RoadmapApplicationService for backwards compatibility with imports
export { RoadmapApplicationService } from './roadmap/index.js';

/**
 * A proxy service that delegates all calls to the RoadmapApplicationService.
 * This is maintained for backward compatibility with existing code.
 * @deprecated Use RoadmapApplicationService directly instead.
 */
export class RoadmapService {
  /**
   * The underlying application service
   */
  private readonly service: RoadmapApplicationService;

  /**
   * Creates a new RoadmapService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    roadmapRepository: IRoadmapRepository,
    noteRepository: IRoadmapNoteRepository
  ) {
    console.warn(
      "RoadmapService is deprecated. Please use the specialized services in the roadmap/ directory instead."
    );
    this.service = new RoadmapApplicationService(roadmapRepository, noteRepository);

    // Set up a proxy to automatically delegate all method calls to the application service
    return this.createServiceProxy();
  }

  /**
   * Creates a proxy that forwards all method calls to the application service
   * This allows us to maintain backward compatibility without duplicating code
   */
  private createServiceProxy(): RoadmapService {
    const self = this;
    
    // Use a Proxy to delegate method calls
    return new Proxy(this, {
      get(target, prop, receiver) {
        // If the property exists on this object, use it
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        
        // Otherwise, delegate to the application service
        const appServiceValue = self.service[prop as keyof typeof self.service];
        
        // If it's a method, make sure to bind it to the application service
        if (typeof appServiceValue === 'function') {
          return function(...args: any[]) {
            return (appServiceValue as Function).apply(self.service, args);
          };
        }
        
        // For non-function properties, return the value directly
        return appServiceValue;
      }
    }) as RoadmapService;
  }
}