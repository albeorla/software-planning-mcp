/**
 * Templates for Product Requirements Documents (PRDs)
 * 
 * These templates and prompts guide an AI agent in creating
 * well-structured PRD documents that follow project conventions.
 */

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
6.  What are the edge cases or alternative scenarios to consider?

**Output:** A complete markdown PRD document based on the PRD_TEMPLATE. Ask clarifying questions if the input is insufficient or ambiguous before generating the document.
`;

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