import { Task } from "../entities/Task.js";

/**
 * Repository interface for Task entities
 */
export interface TaskRepository {
  /**
   * Save a Task to the repository
   * @param task The Task to save
   */
  save(task: Task): Promise<void>;
  
  /**
   * Find a Task by its ID
   * @param id The Task ID
   * @returns The Task if found, null otherwise
   */
  findById(id: string): Promise<Task | null>;
  
  /**
   * List all Tasks in the repository
   * @returns Array of Tasks
   */
  findAll(): Promise<Task[]>;
  
  /**
   * Find Tasks related to a Story
   * @param storyId The Story ID
   * @returns Array of Tasks
   */
  findByStoryId(storyId: string): Promise<Task[]>;
  
  /**
   * Find Tasks by their status
   * @param status The task status to filter by
   * @returns Array of Tasks
   */
  findByStatus(status: 'todo' | 'in-progress' | 'blocked' | 'done'): Promise<Task[]>;
  
  /**
   * Delete a Task from the repository
   * @param id The ID of the Task to delete
   */
  delete(id: string): Promise<void>;
}