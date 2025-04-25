# Governance Tool Demo

This document provides a walkthrough for demonstrating the Software Planning Tool and its workflow enforcement.

## Demo Scenario

In this demo, we'll simulate a complete software development workflow where Claude Code is guided through:

1. Planning a feature
2. Implementing the feature
3. Reviewing and committing changes
4. Completing the task

## Demo Steps

### 1. Start the Governance Server

First, start the governance server:

```bash
pnpm run governance
```

### 2. Launch Claude Code with the Governance MCP

```bash
claude-code --mcp http://localhost:3000
```

### 3. Complete Planning Phase

1. Start a planning session:
   ```
   User: Let's plan a feature to add user authentication to our app
   Claude: (uses mcp__governance__start_planning_session)
   ```

2. Record some planning thoughts:
   ```
   User: Think about how to implement this
   Claude: (uses mcp__governance__add_planning_thought to record sequential steps)
   ```

3. Create a PRD and Epic:
   ```
   User: Create a PRD for this feature
   Claude: (uses mcp__governance__create_prd)
   ```

4. Create specific implementation tasks:
   ```
   User: Break this down into tasks
   Claude: (uses mcp__governance__create_task for each component)
   ```

### 4. Implementation Phase

1. Start implementation of a specific task:
   ```
   User: Let's implement the login form component
   Claude: (uses mcp__governance__start_implementation)
   ```

2. Track file operations:
   ```
   User: Show me the existing components
   Claude: (uses mcp__governance__track_file_read before using View)
   
   User: Create the login form
   Claude: (uses mcp__governance__track_file_edit before using Edit)
   ```

3. Complete implementation:
   ```
   User: I think we're done with the implementation
   Claude: (uses mcp__governance__complete_implementation)
   ```

### 5. Review and Commit Phase

1. Start code review:
   ```
   User: Review the code
   Claude: (uses mcp__governance__start_code_review)
   ```

2. Create branch and commit:
   ```
   User: Commit these changes
   Claude: (uses mcp__governance__commit_changes)
   ```

### 6. Completed Phase

1. Update sprint status:
   ```
   User: Update the sprint with our completed task
   Claude: (uses mcp__governance__update_sprint_status)
   ```

## Demonstrating Enforcement

To demonstrate the workflow enforcement, try these scenarios:

1. Skip phases:
   ```
   User: Let's just edit the file directly without planning
   Claude: (explains that we need to be in IMPLEMENTATION phase)
   ```

2. Use tools out of order:
   ```
   User: Let's commit our changes
   Claude: (explains that we can't commit in PLANNING phase)
   ```

## Key Demo Points

1. **Structured Workflow**: Show how Claude is guided through a structured process
2. **Tracking**: Demonstrate how all file operations are tracked
3. **Documentation**: Show how documentation artifacts are created
4. **Error Prevention**: Demonstrate how the system prevents out-of-sequence actions
5. **State Management**: Show the different phases and transitions

## Troubleshooting

If tools aren't being called in the appropriate sequence:

1. Check the governance server logs for workflow state errors
2. Ensure Claude Code is properly configured to use the MCP
3. Verify the CLAUDE.md file contains the governance workflow instructions