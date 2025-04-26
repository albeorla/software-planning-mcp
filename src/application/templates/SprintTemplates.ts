/**
 * Templates for Sprint Planning Documents
 * 
 * These templates and prompts guide an AI agent in creating
 * well-structured Sprint planning documents that follow project conventions.
 */

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