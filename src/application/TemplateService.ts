import {
  PRD_TEMPLATE,
  CREATE_PRD_PROMPT,
  EPIC_TEMPLATE,
  CREATE_EPIC_PROMPT,
  USER_STORY_TEMPLATE,
  CREATE_USER_STORY_PROMPT,
  TASK_TEMPLATE,
  CREATE_TASK_PROMPT,
  SPIKE_TEMPLATE,
  CREATE_SPIKE_PROMPT,
  SPRINT_TEMPLATE,
  CREATE_SPRINT_PROMPT,
  DAILY_WORK_LOG_TEMPLATE,
  generatePrdId,
  parseDocumentSections
} from './DocumentTemplates.js';

/**
 * Service responsible for generating structured content based on templates.
 * This is used to generate documents like PRDs, Epics, User Stories, etc.
 * In a production environment, this would integrate with an LLM API.
 */
export class TemplateService {
  /**
   * Generates a Product Requirements Document (PRD) from a title and description
   */
  public async generatePRD(title: string, description: string): Promise<{
    id: string;
    content: string;
    sections: Record<string, string>;
  }> {
    // In a real implementation, this would call the LLM API
    const prdId = generatePrdId(title);
    
    // Create a prompt combining the template and guidance
    const prompt = `${CREATE_PRD_PROMPT}

Input:
Title: ${title}
Description: ${description}

Please generate a complete PRD based on this information.`;
    
    // For demo, we mock the LLM response with a simplified template fill
    const content = this.fillPRDTemplate(prdId, title, description);
    
    // Parse sections for storage/indexing
    const sections = parseDocumentSections(content);
    
    return {
      id: prdId,
      content,
      sections
    };
  }
  
  /**
   * Generates an Epic based on PRD and requirements
   */
  public async generateEpic(title: string, description: string, prdIds: string[]): Promise<{
    id: string;
    content: string;
    sections: Record<string, string>;
  }> {
    // Generate epic ID (in production would be from a sequence or DB)
    const epicId = `EPIC-${Math.floor(Math.random() * 90 + 10)}`;
    
    // Mock LLM response with template fill
    const content = this.fillEpicTemplate(epicId, title, description, prdIds);
    
    // Parse sections for storage/indexing
    const sections = parseDocumentSections(content);
    
    return {
      id: epicId,
      content,
      sections
    };
  }
  
  /**
   * Generates a User Story based on Epic and requirements
   */
  public async generateUserStory(
    title: string, 
    userType: string,
    action: string,
    benefit: string,
    epicId: string
  ): Promise<{
    id: string;
    content: string;
    sections: Record<string, string>;
  }> {
    // Generate story ID
    const storyId = `STORY-${Math.floor(Math.random() * 900 + 100)}`;
    
    // Mock LLM response
    const content = this.fillUserStoryTemplate(storyId, title, userType, action, benefit, epicId);
    
    // Parse sections
    const sections = parseDocumentSections(content);
    
    return {
      id: storyId,
      content,
      sections
    };
  }
  
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
    const taskId = `TASK-${Math.floor(Math.random() * 900 + 100)}`;
    
    // Mock LLM response
    const content = this.fillTaskTemplate(taskId, title, description, storyId, complexity);
    
    // Parse sections
    const sections = parseDocumentSections(content);
    
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
    const spikeId = `SPIKE-${Math.floor(Math.random() * 900 + 100)}`;
    
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
    const sections = parseDocumentSections(content);
    
    return {
      id: spikeId,
      content,
      sections
    };
  }
  
  /**
   * Generates a Sprint plan based on available stories and tasks
   */
  public async generateSprint(
    sprintId: string,
    startDate: string,
    endDate: string,
    teamMembers: string[],
    availableTasks: { id: string; title: string; complexity: number }[]
  ): Promise<{
    id: string;
    content: string;
    sections: Record<string, string>;
  }> {
    // Mock LLM response
    const content = this.fillSprintTemplate(sprintId, startDate, endDate, teamMembers, availableTasks);
    
    // Parse sections
    const sections = parseDocumentSections(content);
    
    return {
      id: sprintId,
      content,
      sections
    };
  }
  
  // Private helpers for template filling (mock LLM responses)
  
  private fillPRDTemplate(id: string, title: string, description: string): string {
    return PRD_TEMPLATE
      .replace('{id}', id)
      .replace('{title}', title)
      .replace('{description}', description)
      .replace('{business_requirements}', '- Business requirement 1\n- Business requirement 2')
      .replace('{technical_requirements}', '- Technical requirement 1\n- Technical requirement 2')
      .replace('{acceptance_criteria}', '- Acceptance criteria 1\n- Acceptance criteria 2')
      .replace('{design_considerations}', 'Consider performance and scalability')
      .replace('{timeline}', '2 weeks')
      .replace('{dependencies}', '- Dependency 1\n- Dependency 2');
  }
  
  private fillEpicTemplate(
    id: string, 
    title: string,
    description: string,
    prdIds: string[]
  ): string {
    return EPIC_TEMPLATE
      .replace('{id}', id)
      .replace('{title}', title)
      .replace('{description}', description)
      .replace('{goals}', '- Goal 1\n- Goal 2')
      .replace('{prd_references}', prdIds.join(', '))
      .replace('{user_impact}', 'This will improve user experience by...')
      .replace('{timeline}', '3 weeks')
      .replace('{stories}', '- Potential story 1\n- Potential story 2');
  }
  
private fillUserStoryTemplate(
    id: string,
    title: string,
    userType: string,
    action: string,
    benefit: string,
    epicId: string
  ): string {
    return USER_STORY_TEMPLATE
      .replace('{id}', id)
      .replace('{title}', title)
      .replace('{user_type}', userType)
      .replace('{action}', action)
      .replace('{benefit}', benefit)
      .replace('{description}', `Detailed description of the user story: ${title}`)
      .replace('{acceptance_criteria}', '- Criteria 1\n- Criteria 2')
      .replace('{epic_reference}', epicId)
      .replace('{dependencies}', 'None')
      .replace('{complexity}', '3');
  }
  
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
      .replace('{implementation_details}', 'Implementation details for this task...')
      .replace('{story_reference}', storyId)
      .replace('{file_paths}', '- src/models/TaskModel.ts\n- src/api/TaskController.ts')
      .replace('{complexity}', complexity.toString())
      .replace('{dependencies}', 'None')
      .replace('{testing_notes}', 'Test with unit tests and integration tests');
  }
  
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
  
  private fillSprintTemplate(
    sprintId: string,
    startDate: string, 
    endDate: string,
    teamMembers: string[],
    availableTasks: { id: string; title: string; complexity: number }[]
  ): string {
    const tasksSection = availableTasks
      .map(task => `- [${task.id}] ${task.title} (${task.complexity})`)
      .join('\n');
      
    return SPRINT_TEMPLATE
      .replace('{sprint_id}', sprintId)
      .replace('{goals}', '- Complete feature X\n- Improve performance of Y')
      .replace('{start_date}', startDate)
      .replace('{end_date}', endDate)
      .replace('{team_members}', teamMembers.join(', '))
      .replace('{stories_and_tasks}', tasksSection)
      .replace('{risks}', '- Potential integration issues\n- External API dependency')
      .replace('{metrics}', '- Feature completion\n- No regression bugs');
  }
}