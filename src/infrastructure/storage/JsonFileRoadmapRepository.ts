import { Roadmap } from "../../domain/entities/roadmap/index.js";
import { IRoadmapRepository } from "../../domain/repositories/RoadmapRepository.js";
import { RoadmapJsonFileStorage } from "./RoadmapJsonFileStorage.js";

/**
 * Repository implementation for Roadmap entities using JSON file storage
 */
export class JsonFileRoadmapRepository implements IRoadmapRepository {
  private readonly storage: RoadmapJsonFileStorage;
  private readonly storageKey = "roadmaps";

  /**
   * Creates a new JsonFileRoadmapRepository
   * @param filePath The path to the JSON file for storage
   */
  constructor(filePath: string) {
    this.storage = new RoadmapJsonFileStorage(filePath);
  }

  /**
   * Saves a roadmap to storage
   * @param roadmap The roadmap to save
   */
  public async save(roadmap: Roadmap): Promise<void> {
    const roadmaps = await this.findAll();
    const existingIndex = roadmaps.findIndex(r => r.id === roadmap.id);
    
    if (existingIndex >= 0) {
      roadmaps[existingIndex] = roadmap;
    } else {
      roadmaps.push(roadmap);
    }
    
    await this.storage.write(this.storageKey, roadmaps);
  }

  /**
   * Finds a roadmap by ID
   * @param id The ID of the roadmap to find
   * @returns The roadmap, or null if not found
   */
  public async findById(id: string): Promise<Roadmap | null> {
    const roadmaps = await this.findAll();
    const roadmap = roadmaps.find(r => r.id === id);
    return roadmap || null;
  }

  /**
   * Returns all roadmaps
   * @returns An array of all roadmaps
   */
  public async findAll(): Promise<Roadmap[]> {
    try {
      const rawData = await this.storage.read(this.storageKey) || [];
      return rawData.map((data: any) => Roadmap.fromPersistence(data));
    } catch (error) {
      return [];
    }
  }

  /**
   * Finds roadmaps by owner
   * @param owner The owner to search for
   * @returns An array of matching roadmaps
   */
  public async findByOwner(owner: string): Promise<Roadmap[]> {
    const roadmaps = await this.findAll();
    return roadmaps.filter(r => r.owner === owner);
  }

  /**
   * Finds roadmaps by version
   * @param version The version to search for
   * @returns An array of matching roadmaps
   */
  public async findByVersion(version: string): Promise<Roadmap[]> {
    const roadmaps = await this.findAll();
    return roadmaps.filter(r => r.version === version);
  }

  /**
   * Deletes a roadmap by ID
   * @param id The ID of the roadmap to delete
   * @returns True if the roadmap was deleted, false if not found
   */
  public async delete(id: string): Promise<boolean> {
    const roadmaps = await this.findAll();
    const initialLength = roadmaps.length;
    const filteredRoadmaps = roadmaps.filter(r => r.id !== id);
    
    if (filteredRoadmaps.length !== initialLength) {
      await this.storage.write(this.storageKey, filteredRoadmaps);
      return true;
    }
    
    return false;
  }
}