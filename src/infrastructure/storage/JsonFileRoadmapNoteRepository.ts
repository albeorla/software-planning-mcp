import { RoadmapNote } from "../../domain/entities/RoadmapNote.js";
import { IRoadmapNoteRepository } from "../../domain/repositories/RoadmapNoteRepository.js";
import { RoadmapJsonFileStorage } from "./RoadmapJsonFileStorage.js";

/**
 * Repository implementation for RoadmapNote entities using JSON file storage
 */
export class JsonFileRoadmapNoteRepository implements IRoadmapNoteRepository {
  private readonly storage: RoadmapJsonFileStorage;
  private readonly storageKey = "roadmapNotes";

  /**
   * Creates a new JsonFileRoadmapNoteRepository
   * @param filePath The path to the JSON file for storage
   */
  constructor(filePath: string) {
    this.storage = new RoadmapJsonFileStorage(filePath);
  }

  /**
   * Saves a roadmap note to storage
   * @param note The note to save
   */
  public async save(note: RoadmapNote): Promise<void> {
    const notes = await this.findAll();
    const existingIndex = notes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      notes[existingIndex] = note;
    } else {
      notes.push(note);
    }
    
    await this.storage.write(this.storageKey, notes);
  }

  /**
   * Finds a roadmap note by ID
   * @param id The ID of the note to find
   * @returns The note, or null if not found
   */
  public async findById(id: string): Promise<RoadmapNote | null> {
    const notes = await this.findAll();
    const note = notes.find(n => n.id === id);
    return note || null;
  }

  /**
   * Finds roadmap notes by category
   * @param category The category to search for
   * @returns An array of matching notes
   */
  public async findByCategory(category: string): Promise<RoadmapNote[]> {
    const notes = await this.findAll();
    return notes.filter(n => n.category === category);
  }

  /**
   * Finds roadmap notes by priority
   * @param priority The priority to search for
   * @returns An array of matching notes
   */
  public async findByPriority(priority: string): Promise<RoadmapNote[]> {
    const notes = await this.findAll();
    return notes.filter(n => n.priority === priority);
  }

  /**
   * Finds roadmap notes by timeline
   * @param timeline The timeline to search for
   * @returns An array of matching notes
   */
  public async findByTimeline(timeline: string): Promise<RoadmapNote[]> {
    const notes = await this.findAll();
    return notes.filter(n => n.timeline === timeline);
  }

  /**
   * Returns all roadmap notes
   * @returns An array of all notes
   */
  public async findAll(): Promise<RoadmapNote[]> {
    try {
      return await this.storage.read(this.storageKey) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Deletes a roadmap note by ID
   * @param id The ID of the note to delete
   * @returns True if the note was deleted, false if not found
   */
  public async delete(id: string): Promise<boolean> {
    const notes = await this.findAll();
    const initialLength = notes.length;
    const filteredNotes = notes.filter(n => n.id !== id);
    
    if (filteredNotes.length !== initialLength) {
      await this.storage.write(this.storageKey, filteredNotes);
      return true;
    }
    
    return false;
  }
}