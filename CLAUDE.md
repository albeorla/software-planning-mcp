# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Build: `pnpm run build`
- Watch mode: `pnpm run watch`
- Test with MCP inspector: `pnpm run inspector`
- Install dependencies: `pnpm install`

## Code Style Guidelines
- TypeScript with strict typing (follows tsconfig.json settings)
- ES modules (import/export syntax) with NodeNext module resolution
- Domain-Driven Design (DDD) architecture with application, domain, and infrastructure layers
- Error handling with specific, descriptive error messages
- Repository pattern for data access
- JSON for data storage/serialization using JsonFileStorage
- PascalCase for interfaces, classes, and types; camelCase for functions, methods, and variables
- Asynchronous operations with async/await and fs.promises
- Small, focused functions with single responsibilities
- Consistent parameter naming across related functions
- Descriptive type annotations for parameters and return values
- Organize related domain entities in appropriate folders
- Use interfaces to define contracts between layers
- Maintain immutability where possible