# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Requirements

- **All internal thinking and actions must be conducted in English**
- Communication with users should be in the user's preferred language
- Code comments and documentation should follow the project's existing language patterns

## Project Overview

This is a React Native project built with Expo SDK 54, featuring HeroUI Native components and modern tooling including:

- **Framework**: Expo Router with file-based routing
- **UI Library**: HeroUI Native
- **Styling**: Tailwind CSS + Uniwind for native styling
- **State Management**: Jotai for global state, TanStack Query for server state
- **Database**: Drizzle ORM with SQLite (via expo-sqlite)
- **Navigation**: Expo Router with native tabs

## Development Commands

### Project Setup & Running
```bash
bun install              # Install dependencies
bunx expo start          # Start development server
bun run android         # Start on Android emulator
bun run ios            # Start on iOS simulator
bun run web            # Start web version
```

### Code Quality & Maintenance
```bash
bun run lint           # Run ESLint
bun run reset-project  # Reset to blank project (moves starter to app-example)
```

### Database Operations
```bash
bunx drizzle-kit generate    # Generate database migrations
bunx drizzle-kit push        # Push schema to database
bunx drizzle-kit studio      # Open Drizzle Studio
```

## Architecture & Key Patterns

### Project Structure
- `src/app/` - Expo Router file-based routing
- `src/app/(home)/` - Main tab navigation group with Home and Settings tabs
- `src/uniwind-types.d.ts` - Auto-generated Tailwind types (do not edit)
- `global.css` - Global Tailwind/Uniwind styles

### Documentation - CRITICAL
The `docs/` directory contains essential technical guidance that MUST be read before working with specific technologies:

- **`docs/expo/react-native-tips.md`** - Core React Native development guidelines and best practices
- **`docs/expo/Drizzle.md`** - Database operations standard patterns using Drizzle ORM
- **Future docs will be added** for other technologies as the project grows

**MANDATORY**: Before using any technology (especially Drizzle), first read the corresponding documentation in `docs/` to understand the project's standard usage patterns and conventions.

### Styling System
- Uses **Uniwind** + **Tailwind CSS** for component styling
- Uniwind integrates Tailwind utilities with React Native
- All styling uses Tailwind classes
- Auto-generated types in `src/uniwind-types.d.ts` provide theme support

### React Native Specific Guidelines
1. Use HeroUI Native components - get latest info via heroui-mcp
2. For unfamiliar libraries, use Context7 MCP to get current documentation
3. **ALWAYS read `docs/expo/react-native-tips.md`** before starting React Native development

### State Management Architecture
- **Jotai**: Global application state (atomic state management)
- **TanStack Query**: Server state, caching, and data fetching
- Local component state with React hooks

### Database Layer
- **Drizzle ORM**: Type-safe database operations
- **expo-sqlite**: SQLite database for React Native
- **Drizzle Studio**: Visual database management tool

**MANDATORY**: Before ANY database operations, **ALWAYS read `docs/expo/Drizzle.md`** to understand the project's standard Drizzle usage patterns, migration workflow, and best practices.

### Navigation
- File-based routing via Expo Router
- Native tabs using `NativeTabs` from `expo-router/unstable-native-tabs`
- Tab layout configured in `src/app/(home)/_layout.tsx`

## Development Notes

- React Compiler is enabled in `app.json` experiments
- New Architecture is enabled for React Native
- Typed Routes are enabled for better type safety
- ESLint includes React Query plugin for data fetching best practices
- Project supports iOS, Android, and Web platforms