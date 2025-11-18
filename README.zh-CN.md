# HeroUI 演示 React Native 应用

一个使用 Expo SDK 54 构建的现代化 React Native 应用，集成了 HeroUI Native 组件和全面的技术栈，支持跨平台移动开发。

## 🌍 Language / 语言

- **中文** - 继续阅读下方内容
- **English** - [English Documentation](./README.md)

## 🚀 技术栈

- **框架**: Expo Router 基于文件的路由
- **UI 库**: [HeroUI Native](https://heroui-native.com/) - 精美的 React Native 组件
- **样式**: Tailwind CSS + Uniwind 原生样式解决方案
- **状态管理**:
  - Jotai 全局状态管理
  - TanStack Query 服务端状态和缓存
- **数据库**: Drizzle ORM 与 SQLite (通过 expo-sqlite)
- **导航**: Expo Router 原生标签页导航
- **开发**: TypeScript, ESLint, React Compiler 启用

## 📋 前置要求

- Node.js (推荐使用 Bun 以获得更好的性能)
- Expo Go 应用或 Expo 开发构建
- Android Studio/Xcode 用于模拟器

## 🛠️ 安装与设置

1. 克隆仓库
2. 安装依赖：

```bash
# 使用 Bun (推荐)
bun install

# 或使用 npm
npm install
```

3. 启动开发服务器：

```bash
# 使用 Bun
bunx expo start

# 或使用 npm
npx expo start
```

## 📱 运行应用

从 Expo CLI 选项中选择你偏好的平台：

- **开发构建**: 连接到你的开发构建
- **Android 模拟器**: 启动 Android 模拟器
- **iOS 模拟器**: 启动 iOS 模拟器
- **Expo Go**: 快速测试 (功能受限)
- **Web**: 在浏览器中打开

```bash
bun run android    # 启动 Android 模拟器
bun run ios       # 启动 iOS 模拟器
bun run web       # 启动 Web 版本
```

## 🗂️ 项目结构

```
├── src/
│   ├── app/                    # Expo Router 基于文件的路由
│   │   ├── (home)/            # 主标签页导航组
│   │   │   ├── index.tsx      # 首页
│   │   │   └── settings.tsx   # 设置页
│   │   └── _layout.tsx        # 根布局
│   └── uniwind-types.d.ts     # 自动生成的 Tailwind 类型
├── docs/                      # 技术文档
│   └── expo/
│       ├── react-native-tips.md    # RN 开发指南
│       └── Drizzle.md              # 数据库使用模式
├── global.css                # 全局 Tailwind/Uniwind 样式
└── CLAUDE.md                 # Claude AI 开发指导
```

## 🎨 开发指南

### 样式规范
- 使用 Tailwind 类配合 Uniwind 用于 React Native
- 所有样式: `className="flex-1 items-center justify-center"`
- 自动生成的类型提供主题支持

### React Native 规则
1. **所有文本内容必须用 `<Text>` 组件包裹**
2. 使用 `react-native-safe-area-context` 处理 SafeAreaView
3. 遵循 `docs/expo/react-native-tips.md` 中的模式

### 数据库操作
- 使用 Drizzle ORM 进行类型安全的数据库操作
- **数据库工作前务必阅读 `docs/expo/Drizzle.md`**
- 使用 `bunx drizzle-kit` 运行迁移

## 🔧 开发命令

```bash
# 开发
bunx expo start              # 启动开发服务器
bun run android              # Android 模拟器
bun run ios                 # iOS 模拟器
bun run web                 # Web 版本

# 代码质量
bun run lint                # 运行 ESLint

# 数据库
bunx drizzle-kit generate   # 生成迁移
bunx drizzle-kit push       # 推送架构到数据库
bunx drizzle-kit studio     # 打开 Drizzle Studio

# 项目重置
bun run reset-project       # 重置为空白项目
```

## 📚 文档

- **`docs/expo/react-native-tips.md`** - React Native 开发最佳实践
- **`docs/expo/Drizzle.md`** - 数据库操作和模式
- **`CLAUDE.md`** - AI 开发助手指南

## 🌟 功能特性

- ✅ 跨平台支持 (iOS, Android, Web)
- ✅ 使用 HeroUI Native 的现代化 UI
- ✅ 类型安全的数据库操作
- ✅ 优化的状态管理
- ✅ 基于文件的路由
- ✅ 原生标签页导航
- ✅ Tailwind CSS 样式
- ✅ TypeScript 支持
- ✅ React Compiler 启用

## 🤝 贡献

1. 开始前先阅读 `docs/` 中的技术文档
2. 遵循现有的代码模式和约定
3. 确保所有文本都用 `<Text>` 组件包裹
4. 尽可能地在多个平台上测试

## 📖 了解更多

- [Expo 文档](https://docs.expo.dev/)
- [HeroUI Native 文档](https://heroui-native.com/)
- [React Native 文档](https://reactnative.dev/)
- [TanStack Query 文档](https://tanstack.com/query/latest)
- [Drizzle ORM 文档](https://orm.drizzle.team/)

## 🆘 支持

- [Expo Discord](https://chat.expo.dev) - 社区支持
- [HeroUI Native GitHub](https://github.com/geekyanton/heroui-native) - 组件问题
- 项目问题 - 使用 GitHub Issues 报告错误和功能请求