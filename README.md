# HeroUI Demo React Native App

A comprehensive React Native application built with Expo SDK 54, featuring HeroUI Native components, AI-powered chat functionality, and a modern tech stack for cross-platform mobile development.

## 🌟 Features

- ✅ **AI Chat Interface** - Built-in chatbot with Ollama and OpenAI support
- ✅ **HeroUI Native Components** - Beautiful, modern UI components
- ✅ **Cross-Platform** - iOS, Android, and Web support
- ✅ **File-Based Routing** - Expo Router for navigation
- ✅ **Modern Styling** - Tailwind CSS with Uniwind
- ✅ **Type-Safe Database** - SQLite with Drizzle ORM
- ✅ **Advanced State Management** - Jotai + TanStack Query
- ✅ **Real-time Features** - WebSocket and streaming support
- ✅ **Development Tools** - Hot reload, Claude Code MCP integration

## 🌍 Language / 语言

- **English** - Continue reading below
- **中文** - [中文文档](./README.zh-CN.md)

## 🚀 Tech Stack

### Core Framework
- **Expo SDK 54** - React Native development platform
- **Expo Router** - File-based routing system
- **TypeScript** - Type safety and better DX

### UI & Styling
- **[HeroUI Native](https://heroui-native.com/)** - Modern React Native UI components
- **Tailwind CSS** + **Uniwind** - Utility-first styling for native apps
- **React Native Reanimated** - Smooth animations and gestures

### AI & Chat Features
- **Vercel AI SDK** - AI integration framework
- **Ollama AI Provider** - Local LLM support
- **OpenAI SDK** - GPT model integration
- **React Native Marked** - Markdown rendering for chat messages

### State Management
- **Jotai** - Atomic state management for global state
- **TanStack Query** - Server state, caching, and data fetching
- **React Hooks** - Local component state management

### Database & Storage
- **Drizzle ORM** - Type-safe SQL database operations
- **expo-sqlite** - SQLite database for React Native
- **Zod** - Runtime type validation

### Development Tools
- **React Compiler** - Experimental React optimizations
- **ESLint** - Code linting and formatting
- **Drizzle Kit** - Database development tools
- **HeroUI MCP** - Claude Code integration for component development

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
│   ├── app/                       # Expo Router file-based routing
│   │   ├── _layout.tsx           # Root layout with providers
│   │   ├── index.tsx             # Home screen
│   │   └── chatbot/              # AI Chat feature
│   │       ├── index.tsx         # Chat interface
│   │       └── _layout.tsx       # Chat layout
│   ├── components/               # Reusable components
│   │   └── MessageRenderer.tsx   # Chat message rendering component
│   ├── utils/                    # Utility functions
│   │   └── expoUrl.ts           # URL generation utilities
│   └── uniwind-types.d.ts        # Auto-generated Tailwind types
├── docs/                         # Technical documentation
│   ├── init.md                   # Project setup guide
│   └── expo/
│       ├── react-native-tips.md  # React Native development guidelines
│       └── Drizzle.md            # Database usage patterns
├── global.css                    # Global Tailwind/Uniwind styles
├── metro.config.js               # Metro bundler configuration
├── drizzle.config.ts             # Database configuration
├── package.json                  # Dependencies and scripts
└── CLAUDE.md                     # Claude AI development guidance
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

## 🤖 AI Chat Features

The demo includes a fully functional AI chat interface with support for:

- **Multiple AI Providers**: OpenAI GPT models and local Ollama models
- **Real-time Streaming**: Watch responses appear in real-time
- **Markdown Rendering**: Rich text formatting with code highlighting
- **Message History**: Persistent conversation context
- **Responsive Design**: Works seamlessly on all platforms

### Chat Implementation Details

- Built with Vercel AI SDK for seamless AI integration
- Custom `MessageRenderer` component for beautiful message display
- Automatic scrolling and keyboard handling
- Error handling and loading states
- Expo Fetch API integration for cross-platform compatibility

## 🎨 Development Guidelines

### Styling
- Use Tailwind classes with Uniwind for React Native
- All styling: `className="flex-1 items-center justify-center"`
- Auto-generated types provide theme support
- Refer to `global.css` for global styles configuration

### React Native Rules
1. **All text content must be wrapped in `<Text>` component**
2. Use `react-native-safe-area-context` for SafeAreaView
3. Follow patterns in `docs/expo/react-native-tips.md`
4. Use HeroUI Native components for better UI/UX
5. Leverage React Native Reanimated for smooth animations

### AI Integration
- Use Vercel AI SDK for AI provider abstraction
- Implement proper error handling for AI responses
- Support streaming for better user experience
- Use React Native Marked for markdown rendering

### Database Operations
- Use Drizzle ORM for type-safe database operations
- **Always read `docs/expo/Drizzle.md`** before database work
- Run migrations with `bunx drizzle-kit`
- Use Zod for runtime validation

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

# Claude Code Integration
claude mcp add heroui-native -- npx -y @heroui/native-mcp@latest
```

## 🚀 Getting Started Guide

New to this stack? Follow our step-by-step setup guide:

1. **Read `docs/init.md`** - Comprehensive project setup instructions
2. **Configure Environment** - Set up AI providers and database
3. **Run Development Server** - Start with `bunx expo start`
4. **Explore Features** - Visit `/chatbot` to test AI functionality
5. **Read Documentation** - Check `docs/expo/` for detailed patterns

## 🤝 Contributing

1. Read the technical documentation in `docs/` before starting
2. Follow the existing code patterns and conventions
3. Ensure all text is wrapped in `<Text>` components
4. Test on multiple platforms when possible
5. Use HeroUI Native components for consistency
6. Implement proper error handling and loading states
7. Follow TypeScript best practices

## 📚 Documentation

- **`docs/init.md`** - Complete project setup guide
- **`docs/expo/react-native-tips.md`** - React Native development best practices
- **`docs/expo/Drizzle.md`** - Database operations and patterns
- **`CLAUDE.md`** - AI development assistant guidelines

## 🔗 Related Projects & Resources

### Core Libraries
- [HeroUI Native Documentation](https://heroui-native.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction)
- [Uniwind Documentation](https://github.com/iankred/uniwind)

### AI Integration
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Ollama Documentation](https://ollama.ai/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### State Management & Database
- [Jotai Documentation](https://jotai.org/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

### Development Tools
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint React Native Guide](https://eslint.org/docs/rules/)

## 📄 License

This project is a demo application for educational purposes. Feel free to use it as a reference for your own projects.

---

**Built with ❤️ using modern React Native development tools**
