/**
 * Templates for Tasks and Spikes
 * 
 * These templates and prompts guide an AI agent in creating
 * well-structured Task documents that follow project conventions.
 */

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
5.  What are the non-obvious technical challenges or refactoring opportunities?
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