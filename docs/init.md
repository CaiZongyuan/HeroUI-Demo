# Project Setup
## Install Expo

```bash
bun create expo-app my-app

cd my-app

# Clear the project (optional, removes default templates)
bun run reset-project
```

## Install heroui-native

https://github.com/heroui-inc/heroui-native

```bash
bun expo install heroui-native

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

## Tech Stack & Core Libraries

- React Native with Expo 54
- Heroui-Native UI (Uniwind)
- Jotai
- Drizzle ORM
- TanStack Query
- SQLite
- Zod

```bash
bunx expo install expo-sqlite @dev-plugins/react-query

bun add jotai zod @tanstack/react-query drizzle-orm

bun i -D @tanstack/eslint-plugin-query drizzle-kit

bun install --save-dev babel-plugin-inline-import expo-drizzle-studio-plugin
```

All done! 🎉