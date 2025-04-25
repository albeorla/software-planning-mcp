# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Build: `pnpm run build`
- Watch mode: `pnpm run watch`
- Test with MCP inspector: `pnpm run inspector`

## Code Style Guidelines
- TypeScript with strict typing
- ES modules (import/export syntax)
- Error handling with specific error messages
- Follow MCP standards for server implementation
- Clear interface definitions in types.ts
- Functions should be small and focused
- Use async/await consistently
- JSON for data storage/serialization
- Use string literals for error messages
- Maintain consistent parameter naming
- Include helpful type annotations
- Follow existing naming conventions: PascalCase for interfaces/classes, camelCase for functions/variables
- Use async file operations with fs.promises
- Document complex logic with inline comments