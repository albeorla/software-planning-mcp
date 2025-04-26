import { IRoadmapRepository } from "../../../../domain/repositories/RoadmapRepository.js";
import { IRoadmapNoteRepository } from "../../../../domain/repositories/RoadmapNoteRepository.js";
import { RoadmapNote } from "../../../../domain/entities/roadmap/index.js";
import { CompositeCommandServiceBase } from "./CompositeCommandServiceBase.js";

/**
 * Service for roadmap note operations
 * Part of the split CompositeRoadmapCommandService
 */
export class NoteOperationsService extends CompositeCommandServiceBase {
  /**
   * Creates a new NoteOperationsService
   * @param roadmapRepository The repository for roadmaps
   * @param noteRepository The repository for roadmap notes
   */
  constructor(
    roadmapRepository: IRoadmapRepository,
    noteRepository: IRoadmapNoteRepository
  ) {
    super(roadmapRepository, noteRepository);
  }

  /**
   * Creates a new roadmap note
   * @param roadmapId The ID of the roadmap the note is associated with
   * @param title The title of the note
   * @param content The content of the note
   * @param category The category of the note
   * @returns The created roadmap note
   */
  public async createNote(
    roadmapId: string,
    title: string,
    content: string,
    category: string
  ): Promise<RoadmapNote> {
    return this.roadmapNoteCommandService.createRoadmapNote(
      title, 
      content, 
      category,
      'medium', // default priority
      'future', // default timeline
      [roadmapId] // related items
    );
  }

  /**
   * Updates an existing roadmap note
   * @param noteId The ID of the note to update
   * @param updates The fields to update
   * @returns The updated roadmap note or null if not found
   */
  public async updateNote(
    noteId: string,
    updates: {
      title?: string;
      content?: string;
      category?: string;
    }
  ): Promise<RoadmapNote | null> {
    return this.roadmapNoteCommandService.updateRoadmapNote(noteId, updates);
  }

  /**
   * Deletes a roadmap note
   * @param noteId The ID of the note to delete
   * @returns True if deleted, false if not found
   */
  public async deleteNote(noteId: string): Promise<boolean> {
    return this.roadmapNoteCommandService.deleteRoadmapNote(noteId);
  }

  /**
   * Links a note to an entity within the roadmap
   * @param noteId The ID of the note
   * @param entityType The type of entity (timeframe, initiative, item)
   * @param entityId The ID of the entity
   * @returns The updated note or null if not found
   */
  public async linkNoteToEntity(
    noteId: string,
    entityType: "timeframe" | "initiative" | "item",
    entityId: string
  ): Promise<RoadmapNote | null> {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      return null;
    }
    
    const updatedNote = note.update({
      relatedItems: [...note.relatedItems, entityId]
    });
    
    await this.noteRepository.save(updatedNote);
    return updatedNote;
  }

  /**
   * Removes a link between a note and an entity
   * @param noteId The ID of the note
   * @param entityType The type of entity (timeframe, initiative, item)
   * @param entityId The ID of the entity
   * @returns The updated note or null if not found
   */
  public async unlinkNoteFromEntity(
    noteId: string,
    entityType: "timeframe" | "initiative" | "item",
    entityId: string
  ): Promise<RoadmapNote | null> {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      return null;
    }
    
    const updatedNote = note.update({
      relatedItems: note.relatedItems.filter(id => id !== entityId)
    });
    
    await this.noteRepository.save(updatedNote);
    return updatedNote;
  }
}