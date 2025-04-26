import { BaseTemplateService } from './BaseTemplateService.js';
import { 
  PRD_TEMPLATE, 
  EPIC_TEMPLATE,
  generatePrdId
} from '../index.js';

/**
 * Service for generating requirement documents (PRDs, Epics)
 */
export class RequirementTemplateService extends BaseTemplateService {
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
    
    // Mock LLM response with a simplified template fill
    const content = this.fillPRDTemplate(prdId, title, description);
    
    // Parse sections for storage/indexing
    const sections = this.parseSections(content);
    
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
    const epicId = `EPIC-${this.generateRandomNumber(10, 99)}`;
    
    // Mock LLM response with template fill
    const content = this.fillEpicTemplate(epicId, title, description, prdIds);
    
    // Parse sections for storage/indexing
    const sections = this.parseSections(content);
    
    return {
      id: epicId,
      content,
      sections
    };
  }
  
  /**
   * Fills in the PRD template with values
   */
  private fillPRDTemplate(id: string, title: string, description: string): string {
    return PRD_TEMPLATE
      .replace('{id}', id)
      .replace('{title}', title)
      .replace('{goal}', `The goal is to ${description.toLowerCase().slice(0, 50)}...`)
      .replace('{scope}', 'The scope includes...')
      .replace('{success_metrics}', '- User adoption rate increases\n- Reduction in support tickets')
      .replace('{business_requirements_list}', '- Business requirement 1\n- Business requirement 2')
      .replace('{user_stories_list}', '- As a user, I want to...\n- As an admin, I want to...')
      .replace('{functional_requirements_list}', '- System shall provide...\n- System shall validate...')
      .replace('{non_functional_requirements_list}', '- System response time under 200ms\n- 99.9% uptime')
      .replace('{data_requirements}', 'User data, configuration data')
      .replace('{ui_ux_considerations}', 'Mobile-friendly design, accessibility compliance')
      .replace('{technical_constraints}', 'Must integrate with existing authentication system')
      .replace('{open_questions}', 'How will this affect the current workflow?')
      .replace('{acceptance_criteria_list}', '- Users can complete process in < 3 steps\n- Data is validated correctly')
      .replace('{internal_dependencies}', 'User management system, Database')
      .replace('{external_dependencies}', 'None')
      .replace('{release_plan}', 'Phased rollout over 2 weeks');
  }
  
  /**
   * Fills in the Epic template with values
   */
  private fillEpicTemplate(
    id: string, 
    title: string,
    description: string,
    prdIds: string[]
  ): string {
    const formattedPrdRefs = prdIds.map(id => `* [${id}]`).join('\n');
    
    return EPIC_TEMPLATE
      .replace('{id}', id)
      .replace('{title}', title)
      .replace('{goal}', description)
      .replace('{scope}', 'The scope includes the following features...')
      .replace('{out_of_scope}', 'The following items are out of scope...')
      .replace('{rationale}', 'This epic addresses key user needs by...')
      .replace('{prd_references_list}', formattedPrdRefs || '* No PRDs linked')
      .replace('{high_level_requirements_list}', '- Feature requirement 1\n- Feature requirement 2')
      .replace('{stories_list}', '- As a user, I want to...\n- As an admin, I need to...')
      .replace('{success_criteria_list}', '- All acceptance tests pass\n- User feedback is positive')
      .replace('{dependencies_and_risks}', '- Depends on authentication service\n- Risk: Data migration complexity')
      .replace('{timeline}', 'Estimated completion: 3 weeks');
  }
}