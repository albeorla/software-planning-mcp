# Claude Code Integration

This document explains how to integrate Claude Code with the Software Planning Tool.

## Overview

Claude Code will interact with the software planning tool through the MCP Governance Server, which enforces a structured workflow for software development tasks. The governance server controls the transition between different phases of development and ensures tools are used in the appropriate order.

## Setup Instructions

1. Install the Software Planning Tool and its dependencies:
   ```bash
   pnpm install
   ```

2. Run the governance server:
   ```bash
   pnpm run governance
   ```

3. Configure Claude Code to use the governance MCP by:
   - Running Claude Code with the `--mcp` flag pointing to the running governance server
   - Updating your `CLAUDE.md` file to specify that specific tools must be used

## Claude.md Configuration

Add the following to your `CLAUDE.md` file to force Claude to use the governance tools:

```markdown
## Governance Workflow

Claude must follow the structured workflow enforced by the governance server. 
This means using specific tools at each stage of development:

1. **Planning Phase:**
   - Use `mcp__governance__start_planning_session` to begin a planning session
   - Use `mcp__governance__add_planning_thought` to record thoughts during planning
   - Use `mcp__governance__create_prd`, `mcp__governance__create_epic`, etc. to create documentation
   - Use `mcp__governance__create_task` to define implementation tasks

2. **Implementation Phase:**
   - Use `mcp__governance__start_implementation` to begin implementing a task
   - When reading files, always call `mcp__governance__track_file_read` before using View
   - When modifying files, always call `mcp__governance__track_file_edit` before using Edit
   - Use `mcp__governance__update_task_status` to update task status
   - Use `mcp__governance__log_daily_work` to log progress
   - Use `mcp__governance__complete_implementation` when finished

3. **Review and Commit Phase:**
   - Use `mcp__governance__start_code_review` for code review
   - Use `mcp__governance__create_branch` to create git branches
   - Use `mcp__governance__commit_changes` to commit work
   - Use `mcp__governance__create_pull_request` to create PRs

4. **Completed Phase:**
   - Use `mcp__governance__update_sprint_status` to update sprint status

IMPORTANT: Claude must NEVER use standard file operations (View, Edit, etc.) without first calling the corresponding governance tracking tool.
```

## Available Tools

The governance server provides the following tools through the MCP protocol:

| Tool | Description | Phase |
|------|-------------|-------|
| `mcp__governance__start_planning_session` | Start a new planning session with a goal | IDLE |
| `mcp__governance__add_planning_thought` | Record a thought during planning | PLANNING |
| `mcp__governance__create_task` | Create a new implementation task | PLANNING |
| `mcp__governance__list_tasks` | List all tasks in the current plan | PLANNING, IMPLEMENTATION |
| `mcp__governance__start_implementation` | Start implementing a specific task | PLANNING, IMPLEMENTATION |
| `mcp__governance__track_file_read` | Track file read access | IMPLEMENTATION |
| `mcp__governance__track_file_edit` | Track file edit | IMPLEMENTATION |
| `mcp__governance__complete_implementation` | Mark current task as complete | IMPLEMENTATION |
| `mcp__governance__commit_changes` | Commit changes | REVIEW_AND_COMMIT |

## Workflow Enforcement

The governance server enforces the workflow phases shown in the diagram below:

```mermaid
---
id: f10f7104-782f-4ff5-9d6d-83e752c5b256
---
flowchart TD
    IDLE[IDLE] --> |mcp__governance__start_planning_session| PLANNING
    
    subgraph PLANNING ["Planning Phase"]
        P1[Record thoughts\nusing add_planning_thought] --> P2[Create PRD]
        P2 --> P3[Create Epic]
        P3 --> P4[Create User Story]
        P4 --> P5[Create Task]
        P5 --> P6[Create Subtask]
        P5 -.-> P7[Create Spike for research]
        P4 --> P8[Create Sprint]
    end
    
    PLANNING --> |mcp__governance__start_implementation\nSelects a task to implement| IMPLEMENTATION
    
    subgraph IMPLEMENTATION ["Implementation Phase"]
        I1[Read files\nwith track_file_read\nand View tool] --> I2[Edit files\nwith track_file_edit\nand Edit tool]
        I2 --> I3[Update task status\nwith update_task_status]
        I3 --> I4[Log daily work\nwith log_daily_work]
        I4 --> I5[Complete implementation\nwith complete_implementation]
    end
    
    IMPLEMENTATION --> |mcp__governance__complete_implementation| REVIEW
    
    subgraph REVIEW ["Review and Commit Phase"]
        R1[Start code review\nwith start_code_review] --> R2[Create branches\nwith create_branch]
        R2 --> R3[Commit changes\nwith commit_changes]
        R3 --> R4[Create pull request\nwith create_pull_request]
    end
    
    REVIEW --> |mcp__governance__commit_changes| COMPLETED
    
    subgraph COMPLETED ["Completed Phase"]
        C1[Update sprint status\nwith update_sprint_status]
    end
    
    COMPLETED --> |Reset workflow state| IDLE
```

Attempting to use tools out of sequence will result in error messages explaining the appropriate phase for that tool.