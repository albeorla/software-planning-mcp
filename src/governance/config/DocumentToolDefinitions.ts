/**
 * Factory class for document-related tool definitions
 */
export class DocumentToolDefinitions {
  /**
   * Generate document creation tools
   */
  static getDocumentTools() {
    return [
      {
        name: 'mcp__governance__create_prd',
        description: 'Create a Product Requirements Document (PRD)',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the PRD',
            },
            goal: {
              type: 'string',
              description: 'The primary goal of the project or feature',
            },
            scope: {
              type: 'string',
              description: 'The scope of the project or feature',
            },
            businessRequirements: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of business requirements',
            },
            technicalRequirements: {
              type: 'object',
              properties: {
                functional: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'List of functional technical requirements',
                },
                nonFunctional: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'List of non-functional technical requirements',
                },
              },
              description: 'Technical requirements organized by type',
            },
            acceptanceCriteria: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of acceptance criteria',
            },
          },
          required: ['title', 'goal', 'scope', 'businessRequirements'],
        },
      },
      {
        name: 'mcp__governance__create_epic',
        description: 'Create an Epic to group related user stories',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the Epic',
            },
            goal: {
              type: 'string',
              description: 'The primary goal of this Epic',
            },
            scope: {
              type: 'string',
              description: 'The scope of this Epic',
            },
            outOfScope: {
              type: 'string',
              description: 'What is explicitly out of scope for this Epic',
            },
            prdIds: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of PRD IDs this Epic relates to',
            },
            rationale: {
              type: 'string',
              description: 'Business rationale for this Epic',
            },
          },
          required: ['title', 'goal', 'scope', 'prdIds'],
        },
      },
      {
        name: 'mcp__governance__create_story',
        description: 'Create a User Story for a specific feature',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the User Story',
            },
            userType: {
              type: 'string',
              description: 'Type of user this story addresses',
            },
            action: {
              type: 'string',
              description: 'What the user wants to do',
            },
            benefit: {
              type: 'string',
              description: 'Why the user wants to do this / the benefit',
            },
            description: {
              type: 'string',
              description: 'Additional details about the user story',
            },
            epicId: {
              type: 'string',
              description: 'ID of the Epic this story belongs to',
            },
            acceptanceCriteria: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scenario: { type: 'string' },
                  given: { type: 'string' },
                  when: { type: 'string' },
                  then: { type: 'string' },
                },
                required: ['scenario', 'given', 'when', 'then'],
              },
              description: 'Acceptance criteria in Gherkin syntax',
            },
            complexity: {
              type: 'number',
              description: 'Story points or complexity rating',
              minimum: 1,
              maximum: 10,
            },
          },
          required: ['title', 'userType', 'action', 'benefit', 'epicId', 'complexity'],
        },
      },
      {
        name: 'mcp__governance__create_spike',
        description: 'Create a technical spike for research and exploration',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the spike',
            },
            objective: {
              type: 'string',
              description: 'The main objective of this research spike',
            },
            background: {
              type: 'string',
              description: 'Background information explaining why this spike is needed',
            },
            questions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of questions this spike aims to answer',
            },
            researchApproach: {
              type: 'string',
              description: 'How the research will be conducted',
            },
            timeBox: {
              type: 'string',
              description: 'Time allocation for this spike (e.g., "2 days")',
            },
            parentReference: {
              type: 'string',
              description: 'ID of the parent item (story, epic, etc.)',
            },
            acceptanceCriteria: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'What determines if this spike is complete',
            },
            deliverables: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Expected outputs of this spike',
            },
          },
          required: ['title', 'objective', 'questions', 'timeBox', 'deliverables'],
        },
      },
    ];
  }
}