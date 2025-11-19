# HeroUI Demo React Native - Project Setup Guide

This guide walks you through setting up a React Native project with Expo SDK 54, HeroUI Native, and the comprehensive tech stack used in this demo application.

## Prerequisites

- **Node.js** (Bun recommended for faster performance)
- **Expo CLI** or **Expo Go app**
- **Android Studio** or **Xcode** for emulators/simulators

## Step 1: Create New Expo Project

```bash
# Create new Expo project
bun create expo-app your-app-name

# Navigate to project directory
cd your-app-name

# Optional: Clear the project (removes default templates)
bun run reset-project
```

## Step 2: Install HeroUI Native & Dependencies

[HeroUI Native](https://github.com/heroui-inc/heroui-native) is a modern React Native UI component library.

```bash
# Install HeroUI Native
bun expo install heroui-native

# Install required peer dependencies
bun expo install react-native-screens react-native-reanimated@~4.1.0 react-native-worklets@^0.5.1 react-native-safe-area-context@5.6.0 react-native-svg@^15.12.1 tailwind-variants@^3.1.0 tailwind-merge@^3.3.1 @gorhom/bottom-sheet@^5
```

## Configure Uniwind

### Install Uniwind

Follow the Quickstart guide to install Uniwind in your project.

```bash
bun add uniwind tailwindcss
```

Create a `global.css` file. We recommend placing this file in the root directory of your project.

```tsx
@import 'tailwindcss';
@import 'uniwind';
```

The location matters! The position of global.css determines your app’s root directory — Tailwind will automatically scan className starting from this directory. If you place global.css in a nested folder (e.g., app/global.css), classNames in other directories won’t be detected unless you explicitly include them with the @source directive.

```tsx
Import the CSS file in your App.tsx (main component).
import './global.css' // <-- file from previous step

// other imports

export const App = () => {} // <-- your app's main component
```

Do not import global.css in the root index.ts file that registers the Root Component, because any change would trigger a full reload instead of hot reload.

```tsx
// ‼️ Don't do that
import './global.css';

import { registerRootComponent } from 'expo';
import { App } from './src';  // <- ✅ import it somewhere in the src folder

registerRootComponent(App);
```

### Configure Metro

If you don’t see a metro.config.js file in your project, create one using:

```bash
bunx expo customize metro.config.js
```

```tsx
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro'); 

const config = getDefaultConfig(__dirname);

// your metro modifications (if any)

module.exports = withUniwindConfig(config, {  
  // relative path to your global.css file (from previous step)
  cssEntryFile: './global.css',
  // (optional) path where typings will be auto-generated
  // defaults to project's root
  dtsFile: './src/uniwind-types.d.ts'
});
```

We recommend placing uniwind-types.d.ts inside the src or app directory (it is auto-generated) so TypeScript picks it up automatically. For custom paths (e.g., project root), include it in tsconfig.json.

### Step 3: (Optional) Enable Tailwind IntelliSense for Uniwind

Open your editor’s settings.json file and add the following configuration:
```json
{
    "tailwindCSS.classAttributes": [
        "class",
        "className",
        "headerClassName",
        "contentContainerClassName",
        "columnWrapperClassName",
        "endFillColorClassName",
        "imageClassName",
        "tintColorClassName",
        "ios_backgroundColorClassName",
        "thumbColorClassName",
        "trackColorOnClassName",
        "trackColorOffClassName",
        "selectionColorClassName",
        "cursorColorClassName",
        "underlineColorAndroidClassName",
        "placeholderTextColorClassName",
        "selectionHandleColorClassName",
        "colorsClassName",
        "progressBackgroundColorClassName",
        "titleColorClassName",
        "underlayColorClassName",
        "colorClassName",
        "drawerBackgroundColorClassName",
        "statusBarBackgroundColorClassName",
        "backdropColorClassName",
        "backgroundColorClassName",
        "ListFooterComponentClassName",
        "ListHeaderComponentClassName"
    ],
    "tailwindCSS.classFunctions": [
        "useResolveClassNames"
    ]
}
```
## Run Expo

```bash
bunx expo -c
```

## heroui-mcp

https://github.com/heroui-inc/heroui-mcp/blob/develop/apps/native-mcp/README.md

Claude Code

```bash
claude mcp add heroui-native -- npx -y @heroui/native-mcp@latest
```

## Step 6: Install Additional Tech Stack

This demo includes a comprehensive tech stack for modern React Native development:

### State Management & Data Fetching
```bash
# Install TanStack Query for server state management
bunx expo install @dev-plugins/react-query

# Install Jotai for global state management
bun add jotai @tanstack/react-query
```

### Database & ORM
```bash
# Install SQLite and Drizzle ORM
bunx expo install expo-sqlite
bun add drizzle-orm

# Install TypeScript support and validation
bun add zod
```

### Development Tools
```bash
# Install development dependencies
bun i -D @tanstack/eslint-plugin-query drizzle-kit

# Install Metro plugins for better development experience
bun install --save-dev babel-plugin-inline-import expo-drizzle-studio-plugin
```

### AI/Chat Features (Optional)
If you want to add chat functionality like in this demo:

```bash
# Install AI SDK and providers
bun add @ai-sdk/react @ai-sdk/openai ai

# Install additional UI dependencies
bun add react-native-marked ollama-ai-provider-v2
```

## Step 7: Configure Development Tools

### HeroUI MCP for Claude Code

Enhance your development experience with HeroUI MCP for Claude Code:

```bash
claude mcp add heroui-native -- npx -y @heroui/native-mcp@latest
```

### Database Configuration

Set up Drizzle Kit for database management:

1. Create `drizzle.config.ts` in your project root
2. Configure your SQLite database connection
3. Set up migration scripts

```bash
# Generate database migrations
bunx drizzle-kit generate

# Push schema to database
bunx drizzle-kit push

# Open Drizzle Studio for visual database management
bunx drizzle-kit studio
```

## Step 8: Project Structure

Organize your project as follows:

```
your-app-name/
├── src/
│   ├── app/                    # Expo Router file-based routing
│   │   ├── _layout.tsx         # Root layout
│   │   ├── index.tsx           # Home screen
│   │   └── chatbot/            # Chat feature (optional)
│   │       ├── index.tsx
│   │       └── _layout.tsx
│   ├── components/             # Reusable components
│   │   └── MessageRenderer.tsx
│   └── utils/                  # Utility functions
├── docs/                       # Technical documentation
├── global.css                  # Global Tailwind/Uniwind styles
├── metro.config.js             # Metro bundler configuration
├── drizzle.config.ts           # Database configuration
└── CLAUDE.md                   # Claude AI development guidance
```

## Step 9: Run Your Application

```bash
# Start development server
bunx expo start

# Platform-specific commands
bun run android    # Android emulator
bun run ios       # iOS simulator
bun run web       # Web browser
```

## 🎉 Setup Complete!

You now have a fully configured React Native project with:

- ✅ **HeroUI Native** - Modern UI components
- ✅ **Uniwind** - Tailwind CSS for React Native
- ✅ **Expo Router** - File-based routing
- ✅ **TypeScript** - Type safety
- ✅ **State Management** - Jotai + TanStack Query
- ✅ **Database** - SQLite with Drizzle ORM
- ✅ **Development Tools** - ESLint, Hot Reload, Claude MCP

## Next Steps

1. Read the technical documentation in `docs/` for detailed patterns
2. Explore HeroUI Native components using the MCP tools
3. Start building your application features!
4. Follow React Native best practices in `docs/expo/react-native-tips.md`

## Support

- [HeroUI Native Documentation](https://heroui-native.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [Uniwind Documentation](https://github.com/iankred/uniwind)