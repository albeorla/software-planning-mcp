import { BaseTemplateService } from './BaseTemplateService.js';
import { 
  TASK_TEMPLATE, 
  SPIKE_TEMPLATE 
} from '../index.js';

/**
 * Service for generating task documents (Implementation Tasks and Spikes)
 */
export class TaskTemplateService extends BaseTemplateService {
  /**
   * Generates an Implementation Task based on a User Story
   */
  public async generateTask(
    title: string,
    description: string,
    storyId: string,
    complexity: number
  ): Promise<{
    id: string;
    content: string;
    sections: Record<string, string>;
  }> {
    // Generate task ID
    const taskId = `TASK-${this.generateRandomNumber(100, 999)}`;
    
    // Mock LLM response
    const content = this.fillTaskTemplate(taskId, title, description, storyId, complexity);
    
    // Parse sections
    const sections = this.parseSections(content);
    
    return {
      id: taskId,
      content,
      sections
    };
  }
  
  /**
   * Generates a Spike document for research and exploration
   */
  public async generateSpike(
    title: string,
    objective: string,
    questions: string[],
    timeBox: string,
    parentReference?: string,
    background?: string,
    researchApproach?: string,
    acceptanceCriteria?: string[],
    deliverables?: string[]
  ): Promise<{
    id: string;
    content: string;
    sections: Record<string, string>;
  }> {
    // Generate spike ID
    const spikeId = `SPIKE-${this.generateRandomNumber(100, 999)}`;
    
    // Mock LLM response
    const content = this.fillSpikeTemplate(
      spikeId, 
      title, 
      objective, 
      questions, 
      timeBox, 
      parentReference,
      background,
      researchApproach,
      acceptanceCriteria,
      deliverables
    );
    
    // Parse sections
    const sections = this.parseSections(content);
    
    return {
      id: spikeId,
      content,
      sections
    };
  }
  
  /**
   * Fills in the Task template with values
   */
  private fillTaskTemplate(
    id: string,
    title: string,
    description: string,
    storyId: string,
    complexity: number
  ): string {
    return TASK_TEMPLATE
      .replace('{id}', id)
      .replace('{title}', title)
      .replace('{description}', description)
      .replace('{implementation_steps_list}', '- Step 1: Design the interface\n- Step 2: Implement core functionality\n- Step 3: Add validation logic')
      .replace('{story_reference}', storyId)
      .replace('{file_paths_list}', '- src/models/TaskModel.ts\n- src/api/TaskController.ts')
      .replace('{components_list}', '- TaskForm component\n- ValidationService')
      .replace('{technical_notes}', 'Ensure data validation at both client and server side')
      .replace('{unit_test_requirements}', 'Test validation logic and error handling')
      .replace('{integration_test_requirements}', 'Test API interaction with mock data')
      .replace('{manual_verification_steps}', 'Verify UI feedback on validation errors')
      .replace('{task_dependencies_list}', 'None')
      .replace('{complexity}', complexity.toString());
  }
  
  /**
   * Fills in the Spike template with values
   */
  private fillSpikeTemplate(
    id: string,
    title: string,
    objective: string,
    questions: string[],
    timeBox: string,
    parentReference?: string,
    background?: string,
    researchApproach?: string,
    acceptanceCriteria?: string[],
    deliverables?: string[]
  ): string {
    const questionsFormatted = questions.map(q => `* ${q}`).join('\n');
    const deliverablesList = deliverables?.map(d => `* ${d}`).join('\n') || '* Documentation of findings\n* Decision recommendation';
    const criteriaList = acceptanceCriteria?.map(c => `* ${c}`).join('\n') || '* All questions answered with clear evidence\n* Recommendations documented';
    
    return SPIKE_TEMPLATE
      .replace('{id}', id)
      .replace('{title}', title)
      .replace('{objective}', objective)
      .replace('{background}', background || 'No specific background provided.')
      .replace('{questions_list}', questionsFormatted)
      .replace('{research_approach}', researchApproach || 'Research documentation, prototyping, and exploration.')
      .replace('{time_box}', timeBox)
      .replace('{parent_reference}', parentReference || 'Not linked to a specific story/epic')
      .replace('{acceptance_criteria_list}', criteriaList)
      .replace('{deliverables_list}', deliverablesList)
      .replace('{resources_list}', '* Documentation\n* Existing code');
  }
}