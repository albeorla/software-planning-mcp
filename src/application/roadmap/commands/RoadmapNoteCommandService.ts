import { RoadmapNote } from "../../../domain/entities/RoadmapNote.js";
import { IRoadmapNoteRepository } from "../../../domain/repositories/RoadmapNoteRepository.js";

/**
 * Service responsible for command operations on RoadmapNotes
 * Part of the Command Query Responsibility Segregation (CQRS) pattern
 */
export class RoadmapNoteCommandService {
  /**
   * Creates a new RoadmapNoteCommandService
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    private readonly noteRepository: IRoadmapNoteRepository
  ) {}

  /**
   * Creates a new roadmap note
   * @param title The title of the note
   * @param content The content of the note
   * @param category The category of the note
   * @param priority The priority of the note
   * @param timeline The timeline of the note
   * @param relatedItems Related item IDs
   * @returns The created note
   */
  public async createRoadmapNote(
    title: string,
    content: string,
    category: string,
    priority: string,
    timeline: string,
    relatedItems: string[] = []
  ): Promise<RoadmapNote> {
    const note = RoadmapNote.create(title, content, category, priority, timeline, relatedItems);
    await this.noteRepository.save(note);
    return note;
  }

  /**
   * Updates a roadmap note
   * @param id The ID of the note to update
   * @param updates The fields to update
   * @returns The updated note or null if not found
   */
  public async updateRoadmapNote(
    id: string,
    updates: {
      title?: string;
      content?: string;
      category?: string;
      priority?: string;
      timeline?: string;
      relatedItems?: string[];
    }
  ): Promise<RoadmapNote | null> {
    const note = await this.noteRepository.findById(id);
    if (!note) {
      return null;
    }

    const updatedNote = note.update(updates);
    await this.noteRepository.save(updatedNote);
    return updatedNote;
  }

  /**
   * Deletes a roadmap note
   * @param id The ID of the note to delete
   * @returns True if the note was deleted, false if not found
   */
  public async deleteRoadmapNote(id: string): Promise<boolean> {
    return await this.noteRepository.delete(id);
  }
}