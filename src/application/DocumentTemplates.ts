/**
 * Document Templates and Prompts for generating structured artifacts
 *
 * These templates guide an AI agent (like Claude) in creating well-structured documents
 * following project conventions and best practices. The prompts are designed to elicit
 * detailed, consistent, and contextually relevant output.
 */

// --- PRD Generation ---

/**
 * Product Requirements Document (PRD) template structure.
 * Placeholders like {id}, {title}, etc., should be filled by the agent.
 */
export const PRD_TEMPLATE = `# [PRD-{id}] {title}

## 1. Overview
* **Goal:** {goal}
* **Scope:** {scope}
* **Success Metrics:** {success_metrics}

## 2. Business Requirements
* {business_requirements_list}

## 3. Use Cases / User Stories
* {user_stories_list}

## 4. Technical Requirements
* **Functional:** {functional_requirements_list}
* **Non-Functional (Performance, Security, Scalability, etc.):** {non_functional_requirements_list}
* **Data Requirements:** {data_requirements}

## 5. Design Considerations & Constraints
* **UI/UX:** {ui_ux_considerations}
* **Technical Constraints:** {technical_constraints}
* **Open Questions:** {open_questions}

## 6. Acceptance Criteria
* {acceptance_criteria_list}

## 7. Dependencies
* **Internal:** {internal_dependencies}
* **External:** {external_dependencies}

## 8. Release & Rollout Plan (Optional)
* {release_plan}
`;

/**
 * Prompt for creating a PRD from user input and project context.
 */
export const CREATE_PRD_PROMPT = `
You are a Product Manager responsible for creating a detailed Product Requirements Document (PRD).

**Input:** A description of a product feature, user needs, business goals, and potentially references to existing project context (e.g., roadmap, related PRDs).

**Task:** Generate a comprehensive PRD using the provided PRD_TEMPLATE. Fill in all placeholders ({placeholder}) with relevant information derived from the input and sound product management principles.

**Guidelines:**
* **Clarity & Specificity:** Write clear, specific, unambiguous requirements. Ensure they are measurable, achievable, relevant, and time-bound (SMART) where applicable.
* **Completeness:** Address both functional and non-functional requirements (performance, security, scalability, accessibility, maintainability).
* **Testability:** All acceptance criteria must be verifiable and testable. Use formats like "Given [context], When [action], Then [outcome]" if appropriate.
* **User Focus:** Clearly define the target users and their needs. Frame requirements from their perspective where possible.
* **Contextual Awareness:** If provided, reference the project roadmap, existing PRDs (e.g., in the '.docs/' directory), and overall product strategy. Ensure consistency.
* **Dependencies:** Explicitly identify dependencies on other features, teams, or external systems.
* **Constraints:** Document known technical limitations, budget constraints, or design guidelines.
* **Structure:** Strictly adhere to the PRD_TEMPLATE structure and headings. Use markdown formatting (especially lists) effectively.
* **ID Generation:** Use the provided \`generatePrdId\` function logic to create a suitable ID like \`PRD-XX-YY\`.

**Analysis Questions to Consider:**
1.  Who are the primary users and stakeholders? What are their key goals?
2.  What core problem does this feature solve? What value does it deliver?
3.  How will success be measured (KPIs, metrics)?
4.  What are the key assumptions being made?
5.  What are the potential technical risks or challenges?
6.  Are there any edge cases or alternative scenarios to consider?

**Output:** A complete markdown PRD document based on the PRD_TEMPLATE. Ask clarifying questions if the input is insufficient or ambiguous before generating the document.
`;

// --- Epic Generation ---

/**
 * Epic template structure.
 */
export const EPIC_TEMPLATE = `# [EPIC-{id}] {title}

## 1. Description
* **Goal:** {goal}
* **Scope:** {scope}
* **Out of Scope:** {out_of_scope}

## 2. Rationale & Value Proposition
* {rationale}

## 3. Related PRDs
* {prd_references_list}

## 4. High-Level Requirements / Features
* {high_level_requirements_list}

## 5. Proposed User Stories (Initial List)
* {stories_list}

## 6. Success Criteria / Definition of Done
* {success_criteria_list}

## 7. Dependencies & Risks
* {dependencies_and_risks}

## 8. Estimated Timeline / Target Release
* {timeline}
`;

/**
 * Prompt for creating an Epic.
 */
export const CREATE_EPIC_PROMPT = `
You are a Product Owner or Lead Engineer responsible for defining a large feature or initiative as an Epic.

**Input:** One or more related PRDs (identified by IDs like \`[PRD-XX-YY]\`), high-level business goals, and potentially project context.

**Task:** Generate a well-defined Epic document using the EPIC_TEMPLATE. Fill in all placeholders ({placeholder}) based on the input PRDs and strategic goals.

**Guidelines:**
* **Scope Definition:** Clearly define what is included and explicitly state what is *out of scope*.
* **Value Focus:** Articulate the primary business or user value this Epic delivers.
* **Manageable Size:** The Epic should represent a significant body of work, typically deliverable over several sprints (e.g., 1-3 months), but not excessively large.
* **PRD Linking:** Explicitly list *all* relevant PRD IDs (e.g., \`[PRD-AB-12]\`, \`[PRD-CD-34]\`) that this Epic contributes to.
* **Story Decomposition:** Suggest 3-5 high-level User Stories that break down the Epic into smaller, user-centric pieces. These are initial suggestions and will be refined later.
* **Success Criteria:** Define clear, measurable criteria for when the Epic is considered complete.
* **Structure:** Strictly adhere to the EPIC_TEMPLATE structure and headings. Use markdown formatting effectively.
* **ID Generation:** Generate a suitable ID like \`EPIC-ZZ\`.

**Analysis Questions to Consider:**
1.  What is the overarching theme or capability this Epic represents?
2.  How does it align with the product roadmap and strategic objectives?
3.  What are the major functional components involved?
4.  Are there logical milestones or phases within this Epic?
5.  What are the key dependencies or potential risks associated with this large piece of work?

**Output:** A complete markdown Epic document based on the EPIC_TEMPLATE. Ask clarifying questions if the input PRDs are missing or ambiguous.
`;

// --- User Story Generation ---

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

// --- Task Generation ---

/**
 * Task template structure.
 */
export const TASK_TEMPLATE = `# [TASK-{id}] {title}

## Description
* {description}

## Implementation Details
* {implementation_steps_list}

## Parent Story
* {story_reference}

## Files / Components Affected
* {file_paths_list}
* {components_list}

## Technical Considerations
* {technical_notes}

## Testing Notes
* **Unit Tests:** {unit_test_requirements}
* **Integration Tests:** {integration_test_requirements}
* **Manual Verification:** {manual_verification_steps}

## Dependencies
* {task_dependencies_list}

## Estimated Complexity (1-8)
* {complexity}
`;

/**
 * Spike task template structure for research and exploration tasks.
 */
export const SPIKE_TEMPLATE = `# [SPIKE-{id}] {title}

## Objective
* {objective}

## Background
* {background}

## Questions to Answer
* {questions_list}

## Research Approach
* {research_approach}

## Time Box
* {time_box}

## Parent Story/Epic
* {parent_reference}

## Acceptance Criteria
* {acceptance_criteria_list}

## Deliverables
* {deliverables_list}

## Resources
* {resources_list}
`;

/**
 * Prompt for creating Implementation Tasks.
 */
export const CREATE_TASK_PROMPT = `
You are a Senior Software Engineer responsible for breaking down User Stories into actionable technical Tasks.

**Input:** A parent User Story (identified by ID like \`[STORY-AA]\`), technical context, and potentially architectural guidelines.

**Task:** Generate one or more specific, technical implementation Task documents using the TASK_TEMPLATE. Fill in all placeholders ({placeholder}).

**Guidelines:**
* **Actionable & Granular:** Each task should represent a specific piece of technical work, ideally completable by one developer in 1-2 days. Tasks are *how* the story gets built.
* **Technical Detail:** Include specific implementation details, algorithms, data structures, API endpoints, or UI component changes.
* **Code Focus:** Clearly identify the primary files, classes, functions, or components that need to be created or modified.
* **Testing:** Specify *how* the implementation will be tested (unit tests, integration points, manual checks).
* **Story Linking:** Explicitly reference the parent User Story ID (e.g., \`[STORY-AA]\`).
* **Dependencies:** Identify technical dependencies on other tasks (e.g., "TASK-BB must be completed first") or libraries.
* **Complexity:** Assign a relative complexity score (1-8) based on technical effort and uncertainty.
* **Structure:** Strictly adhere to the TASK_TEMPLATE structure and headings.
* **ID Generation:** Generate a suitable ID like \`TASK-XYZ\`.

**Analysis Questions to Consider:**
1.  What are the distinct technical steps required to implement the User Story?
2.  Which code modules, classes, or functions will be involved?
3.  Are there any new database schemas, API contracts, or data transformations needed?
4.  What are the specific unit test cases required? Are integration tests needed?
5.  Are there any non-obvious technical challenges or refactoring opportunities?
6.  Can this task be broken down further?

**Output:** One or more complete markdown Task documents based on the TASK_TEMPLATE. Ask clarifying questions if the input User Story or technical context is unclear.
`;

/**
 * Prompt for creating Spike tasks for research and exploration.
 */
export const CREATE_SPIKE_PROMPT = `
You are a Technical Lead responsible for defining research and exploration activities.

**Input:** A problem or question that needs investigation, potential parent Epic or Story reference, and context about the technology landscape.

**Task:** Generate a Spike document using the SPIKE_TEMPLATE. Fill in all placeholders ({placeholder}).

**Guidelines:**
* **Clear Objective:** Define a specific, focused objective for the spike. What knowledge gap are you trying to fill?
* **Time-Boxed:** Spikes should be strictly time-boxed (typically 1-3 days) to prevent open-ended research.
* **Structured Questions:** List the specific questions that need to be answered by the spike.
* **Research Approach:** Outline the methods for investigation (e.g., prototyping, benchmarking, literature review, API exploration).
* **Deliverables:** Clearly define what artifacts will be produced (e.g., proof of concept, report, decision matrix, architecture recommendation).
* **Actionable:** Results should lead to informed decisions or next steps.
* **Not Implementation:** Spikes are for research only, not for implementing production features.
* **Structure:** Strictly adhere to the SPIKE_TEMPLATE structure and headings.
* **ID Generation:** Generate a suitable ID like \`SPIKE-XYZ\`.

**Analysis Questions to Consider:**
1.  What specific information is missing that blocks progress?
2.  What options or technologies need to be evaluated?
3.  What metrics or criteria will determine success?
4.  How will findings be communicated to the team?
5.  What decisions will be made based on the spike's results?

**Output:** A complete markdown Spike document based on the SPIKE_TEMPLATE. Ask clarifying questions if the spike's purpose or context is unclear.
`;

// --- Sprint Generation ---

/**
 * Sprint template structure.
 */
export const SPRINT_TEMPLATE = `# Sprint {sprint_id} ({start_date} - {end_date})

## 1. Sprint Goal
* {sprint_goal}

## 2. Team Capacity
* **Members:** {team_members_list}
* **Estimated Capacity (Story Points):** {capacity_points}

## 3. Committed Stories & Tasks
* **[STORY-AA] {Story A Title}** (Complexity: {points})
    * [ ] [TASK-101] {Task 1 Title} (Complexity: {points})
    * [ ] [TASK-102] {Task 2 Title} (Complexity: {points})
* **[STORY-BB] {Story B Title}** (Complexity: {points})
    * [ ] [TASK-201] {Task 3 Title} (Complexity: {points})
* **Total Committed Complexity:** {total_committed_points}

## 4. Risks and Dependencies
* {risks_list}
* {dependencies_list}

## 5. Success Metrics
* {success_metrics_list}
`;

/**
 * Prompt for creating a Sprint plan.
 */
export const CREATE_SPRINT_PROMPT = `
You are a Scrum Master or Team Lead responsible for facilitating Sprint Planning.

**Input:** The current prioritized backlog (list of User Stories and/or Tasks with complexity estimates), team capacity information (members, availability, velocity/points), and overall project/product goals.

**Task:** Generate a Sprint plan document using the SPRINT_TEMPLATE. Select appropriate work items from the backlog to form a coherent sprint goal and fill in all placeholders ({placeholder}).

**Guidelines:**
* **Sprint Goal:** Define a single, clear, and achievable goal for the sprint.
* **Selection:** Choose Stories/Tasks from the top of the prioritized backlog. The total estimated complexity should align with the team's capacity.
* **Structure:** List committed Stories, and under each Story, list the specific Tasks required to complete it. Use markdown task list format (\`- [ ] [TASK-ID] ...\`).
* **Capacity Management:** Ensure the 'Total Committed Complexity' does not significantly exceed the 'Estimated Capacity'.
* **Risks:** Identify potential risks or blockers for the committed items *and* suggest mitigation strategies if possible.
* **Metrics:** Define specific, measurable metrics to evaluate the sprint's success beyond just completing tasks (e.g., "Reduce API latency by 10%", "Complete user authentication flow").
* **Context:** Consult previous sprint plans (e.g., in \`.docs/planning/sprints/\`) for velocity and context.
* **Structure:** Strictly adhere to the SPRINT_TEMPLATE structure, including the checklist format for tasks.
* **ID Generation:** Assign a sequential Sprint ID.

**Analysis Questions to Consider:**
1.  What is the most valuable outcome we can achieve this sprint?
2.  Which backlog items directly contribute to the sprint goal?
3.  Are there dependencies between selected items that dictate order?
4.  Does the team have the skills and knowledge for the selected items?
5.  What potential impediments might arise during the sprint?

**Output:** A complete markdown Sprint plan document based on the SPRINT_TEMPLATE. Ask clarifying questions about backlog priorities or team capacity if needed.
`;

// --- Work Log Generation ---

/**
 * Daily work log template structure.
 */
export const DAILY_WORK_LOG_TEMPLATE = `# Work Log: {date}

## Tasks Worked On Today
* **[TASK-ID] {Task Title}:** {Brief progress update, e.g., "Completed implementation", "Debugging issue X", "Blocked by Y"}

## Detailed Summary
{detailed_summary_paragraph}

## Blockers or Issues Encountered
* {blocker_1}
* {blocker_2}
* (or "None")

## Next Steps (Tomorrow)
* {next_step_1}
* {next_step_2}
`;

/**
 * Prompt for generating a Daily Work Log entry.
 * Note: This is typically called by the 'complete_task' tool or a dedicated logging tool.
 */
export const CREATE_DAILY_LOG_PROMPT = `
You are an AI assistant helping a developer log their daily work.

**Input:** The current date, a list of Task IDs worked on, a brief summary of progress for each, any blockers encountered, and planned next steps.

**Task:** Generate a daily work log entry using the DAILY_WORK_LOG_TEMPLATE. Fill in all placeholders ({placeholder}) based on the provided input.

**Guidelines:**
* **Conciseness:** Keep progress updates brief within the task list. Use the 'Detailed Summary' for more context.
* **Clarity:** Clearly state blockers and actionable next steps.
* **Structure:** Strictly adhere to the DAILY_WORK_LOG_TEMPLATE structure.
* **Date Formatting:** Use YYYY-MM-DD format for the date.

**Output:** A complete markdown Daily Work Log document based on the DAILY_WORK_LOG_TEMPLATE.
`;

// --- Utility Functions ---

/**
 * Parses structured document sections from markdown content based on headings.
 */
export function parseDocumentSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  // Regex to capture level 2 headings (##) and their content until the next level 2 heading or end of file.
  const sectionRegex = /^##\s+([^\n]+)\n([\s\S]*?)(?=\n^##\s+|$)/gm;
  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    const sectionName = match[1].trim();
    const sectionContent = match[2].trim();
    sections[sectionName] = sectionContent;
  }
  return sections;
}

/**
 * Generates a plausible PRD ID based on title words.
 * Example: "Implement User Authentication" -> "PRD-UA-XX"
 */
export function generatePrdId(title: string): string {
  const ignoreWords = new Set(['and', 'the', 'for', 'with', 'a', 'an', 'of', 'to', 'in', 'on']);
  const prefix = title
    .split(/\s+/)
    .filter(word => word.length > 2 && !ignoreWords.has(word.toLowerCase()))
    .slice(0, 2) // Take first two significant words
    .map(word => word[0].toUpperCase())
    .join('');
  // Generate a simple pseudo-random 2-digit number for demo purposes
  const number = Math.floor(Math.random() * 90 + 10);
  return `PRD-${prefix || 'XX'}-${number}`; // Fallback prefix if needed
}

// TODO: Add similar ID generation functions for EPIC, STORY, TASK if needed.
// TODO: Add functions to parse/update specific structured sections (e.g., task lists within markers).