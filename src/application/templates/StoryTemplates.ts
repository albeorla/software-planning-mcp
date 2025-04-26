/**
 * Templates for User Stories
 * 
 * These templates and prompts guide an AI agent in creating
 * well-structured User Story documents that follow project conventions.
 */

/**
 * User Story template structure.
 */
export const USER_STORY_TEMPLATE = `# [STORY-{id}] {title}

**User Story:** As a {user_type}, I want to {action}, so that {benefit}.

## Description
{description}

## Acceptance Criteria
\`\`\`gherkin
Feature: {Feature Name related to the story}

  Scenario: {Scenario Name}
    Given {context}
    When {action is performed}
    Then {expected outcome}

  # Add more scenarios as needed for different cases/edge cases
\`\`\`
* {additional_criteria_list}

## Related Epic
* {epic_reference}

## Dependencies
* {dependencies_list}

## UI/UX Notes (Optional)
* {ui_ux_notes}

## Estimated Complexity (1-8)
* {complexity}
`;

/**
 * Prompt for creating User Stories.
 */
export const CREATE_USER_STORY_PROMPT = `
You are a Business Analyst or Product Owner responsible for writing clear User Stories.

**Input:** A parent Epic (identified by ID like \`[EPIC-ZZ]\`), specific requirements from PRDs, and user context.

**Task:** Generate a well-formed User Story using the USER_STORY_TEMPLATE. Fill in all placeholders ({placeholder}).

**Guidelines:**
* **Format:** Strictly follow the "As a [user_type], I want to [action], so that [benefit]" format for the main story statement.
* **Focus:** Each story should represent a small, vertical slice of user-visible functionality, deliverable within a single sprint.
* **Acceptance Criteria (AC):** Write clear, testable AC. Use the Gherkin format (Given/When/Then) for primary scenarios. Add bullet points for other specific checks. AC should define "done" for the story.
* **Implementation Agnostic:** User Stories should describe *what* the user needs, not *how* it will be implemented. Avoid technical details.
* **Epic Linking:** Explicitly reference the parent Epic ID (e.g., \`[EPIC-ZZ]\`).
* **Dependencies:** Identify dependencies on other stories or external factors.
* **Complexity:** Assign a relative complexity score (e.g., using Fibonacci-like points 1, 2, 3, 5, 8) based on effort, uncertainty, and risk. Provide a brief justification if the score is high (5 or 8).
* **Structure:** Strictly adhere to the USER_STORY_TEMPLATE structure and headings.
* **ID Generation:** Generate a suitable ID like \`STORY-AA\`.

**Analysis Questions to Consider:**
1.  Who is the specific user persona benefiting from this?
2.  What is the smallest valuable action they can take?
3.  What is the clear benefit they receive?
4.  How can we objectively test if this story is complete?
5.  Does this story depend on any other work being done first?

**Output:** A complete markdown User Story document based on the USER_STORY_TEMPLATE. Ask clarifying questions if the input Epic or requirements are unclear.
`;