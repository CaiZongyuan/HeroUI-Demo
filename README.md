# HeroUI Demo React Native App

A modern React Native application built with Expo SDK 54, featuring HeroUI Native components and a comprehensive tech stack for cross-platform mobile development.

## 🌍 Language / 语言

- **English** - Continue reading below
- **中文** - [中文文档](./README.zh-CN.md)

## 🚀 Tech Stack

- **Framework**: Expo Router with file-based routing
- **UI Library**: [HeroUI Native](https://heroui-native.com/) - Beautiful React Native components
- **Styling**: Tailwind CSS + Uniwind for native styling
- **State Management**:
  - Jotai for global state management
  - TanStack Query for server state and caching
- **Database**: Drizzle ORM with SQLite (via expo-sqlite)
- **Navigation**: Expo Router with native tabs
- **Development**: TypeScript, ESLint, React Compiler enabled

## 📋 Prerequisites

- Node.js (recommended to use Bun for faster performance)
- Expo Go app or Expo development build
- Android Studio/Xcode for emulator/simulator

## 🛠️ Installation & Setup

1. Clone the repository
2. Install dependencies:

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

3. Start the development server:

```bash
# Using Bun
bunx expo start

# Or using npm
npx expo start
```

## 📱 Running the App

Choose your preferred platform from the Expo CLI options:

- **Development Build**: Connect to your development build
- **Android Emulator**: Launch Android emulator
- **iOS Simulator**: Launch iOS simulator
- **Expo Go**: Quick testing (limited features)
- **Web**: Open in browser

```bash
bun run android    # Start on Android emulator
bun run ios       # Start on iOS simulator
bun run web       # Start web version
```

## 🗂️ Project Structure

```
├── src/
│   ├── app/                    # Expo Router file-based routing
│   │   ├── (home)/            # Main tab navigation group
│   │   │   ├── index.tsx      # Home screen
│   │   │   └── settings.tsx   # Settings screen
│   │   └── _layout.tsx        # Root layout
│   └── uniwind-types.d.ts     # Auto-generated Tailwind types
├── docs/                      # Technical documentation
│   └── expo/
│       ├── react-native-tips.md    # RN development guidelines
│       └── Drizzle.md              # Database usage patterns
├── global.css                # Global Tailwind/Uniwind styles
└── CLAUDE.md                 # Claude AI development guidance
```

## 🎨 Development Guidelines

### Styling
- Use Tailwind classes with Uniwind for React Native
- All styling: `className="flex-1 items-center justify-center"`
- Auto-generated types provide theme support

### React Native Rules
1. **All text content must be wrapped in `<Text>` component**
2. Use `react-native-safe-area-context` for SafeAreaView
3. Follow patterns in `docs/expo/react-native-tips.md`

### Database Operations
- Use Drizzle ORM for type-safe database operations
- **Always read `docs/expo/Drizzle.md`** before database work
- Run migrations with `bunx drizzle-kit`

## 🔧 Development Commands

```bash
# Development
bunx expo start              # Start dev server
bun run android              # Android emulator
bun run ios                 # iOS simulator
bun run web                 # Web version

# Code Quality
bun run lint                # Run ESLint

# Database
bunx drizzle-kit generate   # Generate migrations
bunx drizzle-kit push       # Push schema to database
bunx drizzle-kit studio     # Open Drizzle Studio

# Project Reset
bun run reset-project       # Reset to blank project
```

## 📚 Documentation

- **`docs/expo/react-native-tips.md`** - React Native development best practices
- **`docs/expo/Drizzle.md`** - Database operations and patterns
- **`CLAUDE.md`** - AI development assistant guidelines

## 🌟 Features

- ✅ Cross-platform (iOS, Android, Web)
- ✅ Modern UI with HeroUI Native components
- ✅ Type-safe database operations
- ✅ Optimized state management
- ✅ File-based routing
- ✅ Native tab navigation
- ✅ Tailwind CSS styling
- ✅ TypeScript support
- ✅ React Compiler enabled

## 🤝 Contributing

1. Read the technical documentation in `docs/` before starting
2. Follow the existing code patterns and conventions
3. Ensure all text is wrapped in `<Text>` components
4. Test on multiple platforms when possible

## 📖 Learn More

- [Expo documentation](https://docs.expo.dev/)
- [HeroUI Native documentation](https://heroui-native.com/)
- [React Native documentation](https://reactnative.dev/)
- [TanStack Query documentation](https://tanstack.com/query/latest)
- [Drizzle ORM documentation](https://orm.drizzle.team/)

## 🆘 Support

- [Expo Discord](https://chat.expo.dev) - Community support
- [HeroUI Native GitHub](https://github.com/geekyanton/heroui-native) - Component issues
- Project issues - Use GitHub Issues for bug reports and feature requests
