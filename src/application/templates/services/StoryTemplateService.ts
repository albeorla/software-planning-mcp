import { BaseTemplateService } from './BaseTemplateService.js';
import { USER_STORY_TEMPLATE } from '../index.js';

/**
 * Service for generating user story documents
 */
export class StoryTemplateService extends BaseTemplateService {
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
    const storyId = `STORY-${this.generateRandomNumber(100, 999)}`;
    
    // Mock LLM response
    const content = this.fillUserStoryTemplate(storyId, title, userType, action, benefit, epicId);
    
    // Parse sections
    const sections = this.parseSections(content);
    
    return {
      id: storyId,
      content,
      sections
    };
  }
  
  /**
   * Fills in the User Story template with values
   */
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
      .replace('Feature: {Feature Name related to the story}', `Feature: ${title}`)
      .replace('Scenario: {Scenario Name}', 'Scenario: Main Success Path')
      .replace('{context}', 'the user is logged in')
      .replace('{action is performed}', `the user ${action.toLowerCase()}`)
      .replace('{expected outcome}', 'the system confirms success')
      .replace('{additional_criteria_list}', '- All fields are validated\n- Error messages are clear')
      .replace('{epic_reference}', epicId)
      .replace('{dependencies_list}', '- Authentication system\n- Database access')
      .replace('{ui_ux_notes}', 'Maintain consistent design language')
      .replace('{complexity}', '3');
  }
}