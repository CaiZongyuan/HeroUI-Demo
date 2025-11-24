# 插件 UI 渲染系统完整指南

## 📖 概述

本系统允许你为 AgentScope 后端的不同工具（tool）定制专属的 UI 渲染组件。通过简单的三步流程，即可为任何工具创建精美的卡片展示。

### 核心理念

- **KISS 原则**：使用简单的对象映射，无需复杂的工厂模式或动态加载
- **零配置**：添加新插件只需修改一个文件
- **类型安全**：完整的 TypeScript 支持
- **易扩展**：每个插件独立开发，互不影响

---

## 🏗️ 系统架构

### 数据流程

```
AgentScope 后端
    ↓ (SSE 事件流)
plugin_call_output 事件
    ↓ (AI SDK 处理)
message.parts (tool-{name} 类型)
    ↓ (extractPluginOutputs 提取)
插件数据数组
    ↓ (PLUGIN_RENDERERS 查找)
对应的渲染组件
    ↓ (React 渲染)
精美的 UI 卡片
```

### 核心文件

| 文件 | 作用 |
|------|------|
| `src/components/plugin-renderers.tsx` | **插件注册中心** - 所有插件在此注册 |
| `src/utils/message-utils.ts` | 数据提取工具 - 从消息中提取插件输出 |
| `src/app/chatbot/index.tsx` | 渲染集成 - 在聊天界面中渲染插件 |
| `src/components/{YourCard}.tsx` | 你的卡片组件 - 自定义 UI |

---

## 🎯 完整示例：tool_now

让我们通过 `tool_now` 工具的完整实现来学习整个流程。

### 第一步：创建卡片组件

**文件**：`src/components/TimeCard.tsx`

```tsx
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TimeCardProps {
  timestamp: string; // ISO 8601 格式的时间戳
}

export function TimeCard({ timestamp }: TimeCardProps) {
  // 1. 解析时间戳
  const date = new Date(timestamp);
  
  // 2. 格式化显示
  const formattedDate = date.toLocaleDateString('zh-CN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // 3. 渲染 UI
  return (
    <View
      style={{
        marginVertical: 8,
        marginHorizontal: 4,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#2d2d44',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {/* 头部：图标 + 标题 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#6366f1',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="time-outline" size={24} color="#ffffff" />
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#a0a0b8',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          当前时间
        </Text>
      </View>

      {/* 主要内容：时间 */}
      <Text
        style={{
          fontSize: 32,
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: 4,
          letterSpacing: -0.5,
        }}
      >
        {formattedTime}
      </Text>

      {/* 次要信息：日期和时区 */}
      <Text style={{ fontSize: 16, fontWeight: '500', color: '#8b8b9f', marginBottom: 2 }}>
        {formattedDate}
      </Text>
      
      <Text style={{ fontSize: 14, fontWeight: '400', color: '#6b6b7f' }}>
        {timezone}
      </Text>

      {/* 装饰：渐变条 */}
      <View
        style={{
          marginTop: 12,
          height: 3,
          borderRadius: 2,
          backgroundColor: '#6366f1',
          opacity: 0.6,
        }}
      />
    </View>
  );
}
```

**设计要点**：
- 使用深色主题 (`#1a1a2e`)
- 添加阴影和边框提升层次感
- 使用品牌色 (`#6366f1`) 作为强调色
- 清晰的信息层级：时间 > 日期 > 时区

---

### 第二步：创建渲染器

**文件**：`src/components/plugin-renderers.tsx`

```tsx
import React from 'react';
import { TimeCard } from './TimeCard';

// 1️⃣ 定义渲染器接口
export interface PluginRendererProps {
  result: unknown;      // 工具返回的原始数据
  toolName: string;     // 工具名称
  toolCallId: string;   // 调用 ID
}

export type PluginRenderer = React.FC<PluginRendererProps>;

// 2️⃣ 实现 TimeCard 渲染器
const TimeCardRenderer: PluginRenderer = ({ result, toolName, toolCallId }) => {
  console.log('[TimeCardRenderer] 开始渲染:', { toolName, toolCallId, result });
  
  try {
    // AgentScope 返回格式：[{ type: "text", text: "ISO8601时间戳" }]
    if (Array.isArray(result)) {
      const textOutput = result.find(
        (item: any) => item?.type === 'text' && typeof item.text === 'string'
      );
      
      if (textOutput?.text) {
        console.log('[TimeCardRenderer] ✅ 渲染成功');
        return <TimeCard timestamp={textOutput.text} />;
      }
    }
    
    // 备用方案：直接是字符串
    if (typeof result === 'string') {
      return <TimeCard timestamp={result} />;
    }
    
    console.warn('[TimeCardRenderer] ⚠️ 无法解析数据');
    return null;
  } catch (error) {
    console.error('[TimeCardRenderer] ❌ 渲染失败:', error);
    return null;
  }
};

// 3️⃣ 注册到插件渲染器映射表
export const PLUGIN_RENDERERS: Record<string, PluginRenderer> = {
  tool_now: TimeCardRenderer,
  // 👇 在这里添加更多插件
};
```

**关键点**：
- **数据解析**：根据 AgentScope 的返回格式提取数据
- **错误处理**：try-catch 包裹，失败时返回 null
- **日志调试**：添加 console.log 便于排查问题
- **类型安全**：使用 TypeScript 接口约束

---

### 第三步：理解数据提取（已实现，无需修改）

**文件**：`src/utils/message-utils.ts`

```typescript
export interface PluginOutput {
  toolName: string;
  toolCallId: string;
  result: unknown;
}

export const extractPluginOutputs = (message: UIMessage): PluginOutput[] => {
  if (!message.parts) return [];

  const outputs: PluginOutput[] = [];

  message.parts.forEach((part: any) => {
    // AI SDK 的工具调用格式：
    // type: "tool-{toolName}" (例如 "tool-tool_now")
    // state: "output-available" (成功) 或 "output-error" (失败)
    // output: 工具输出数据
    
    if (part.type?.startsWith('tool-') && part.state === 'output-available') {
      const toolName = part.type.substring(5); // "tool-tool_now" -> "tool_now"
      
      outputs.push({
        toolName: toolName,
        toolCallId: part.toolCallId || 'unknown',
        result: part.output, // 注意：使用 output 字段，不是 result
      });
    }
  });

  return outputs;
};
```

**重要说明**：
- AI SDK 的 part 类型是 `tool-{工具名}`，不是 `tool-result`
- 数据在 `part.output` 字段，不是 `part.result`
- 只提取 `state === 'output-available'` 的成功调用

---

### 第四步：集成到聊天界面（已实现，无需修改）

**文件**：`src/app/chatbot/index.tsx`

```tsx
import { PLUGIN_RENDERERS } from "@/src/components/plugin-renderers";
import { extractPluginOutputs } from "@/src/utils/message-utils";

// 在消息渲染循环中
{m.role === 'assistant' && (
  <View>
    {/* 1. 思考指示器（流式传输时） */}
    {showThinkingIndicator && <ThinkingIndicator />}
    
    {/* 2. 思考日志按钮（完成后） */}
    {!isStreaming && hasThinkingLogs(m) && <ThoughtsButton />}
    
    {/* 3. 插件输出卡片 - 在这里渲染 */}
    {extractPluginOutputs(m).map((plugin) => {
      const Renderer = PLUGIN_RENDERERS[plugin.toolName];
      return Renderer ? (
        <Renderer
          key={plugin.toolCallId}
          result={plugin.result}
          toolName={plugin.toolName}
          toolCallId={plugin.toolCallId}
        />
      ) : null;
    })}
    
    {/* 4. 文本内容 */}
    <MessageRenderer role="assistant" content={messageContent} />
  </View>
)}
```

**渲染顺序**：
1. 思考指示器（仅流式传输时显示）
2. 思考日志按钮（完成后显示）
3. **插件输出卡片**（你的自定义 UI）
4. 文本内容（AI 的回复文本）

---

## 🚀 添加新插件：三步走

### 示例：添加天气卡片 (tool_weather)

#### 步骤 1：创建卡片组件

**文件**：`src/components/WeatherCard.tsx`

```tsx
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WeatherCardProps {
  temperature: number;
  condition: string;
  location: string;
}

export function WeatherCard({ temperature, condition, location }: WeatherCardProps) {
  // 根据天气选择图标
  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('sun') || lower.includes('clear')) return 'sunny';
    if (lower.includes('rain')) return 'rainy';
    if (lower.includes('cloud')) return 'cloudy';
    return 'partly-sunny';
  };

  return (
    <View
      style={{
        marginVertical: 8,
        marginHorizontal: 4,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#2d2d44',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Ionicons name={getWeatherIcon(condition)} size={40} color="#fbbf24" />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: 14, color: '#a0a0b8' }}>{location}</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#ffffff' }}>
            {temperature}°C
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 16, color: '#8b8b9f' }}>{condition}</Text>
    </View>
  );
}
```

#### 步骤 2：创建渲染器并注册

**文件**：`src/components/plugin-renderers.tsx`

```tsx
import { WeatherCard } from './WeatherCard';

// 添加 WeatherCard 渲染器
const WeatherCardRenderer: PluginRenderer = ({ result }) => {
  try {
    // 假设 AgentScope 返回格式：
    // [{ type: "text", text: '{"temp": 22, "condition": "晴天", "location": "北京"}' }]
    
    if (Array.isArray(result)) {
      const textOutput = result.find((item: any) => item?.type === 'text');
      
      if (textOutput?.text) {
        const data = JSON.parse(textOutput.text);
        return (
          <WeatherCard
            temperature={data.temp}
            condition={data.condition}
            location={data.location}
          />
        );
      }
    }
    
    return null;
  } catch (error) {
    console.error('[WeatherCardRenderer] 解析失败:', error);
    return null;
  }
};

// 注册插件（只需添加这一行！）
export const PLUGIN_RENDERERS: Record<string, PluginRenderer> = {
  tool_now: TimeCardRenderer,
  tool_weather: WeatherCardRenderer,  // 👈 添加这一行
};
```

#### 步骤 3：测试

1. 确保 AgentScope 后端已注册 `tool_weather` 工具
2. 在聊天中发送："北京天气怎么样？"
3. 查看 WeatherCard 是否正确渲染

**完成！** 🎉

---

## 📊 数据格式参考

### AgentScope 后端事件格式

```json
{
  "event": "plugin_call_output",
  "data": {
    "sequence_number": 13,
    "object": "plugin_call_output",
    "status": "completed",
    "id": "msg_xxx",
    "type": "plugin_call_output",
    "role": "assistant",
    "content": [{
      "object": "content",
      "type": "data",
      "delta": false,
      "data": {
        "type": "tool_result",
        "id": "019ab63e...",
        "name": "tool_now",
        "output": [
          { "type": "text", "text": "2025-11-24T15:27:05.034988+00:00" }
        ]
      }
    }]
  }
}
```

### AI SDK 处理后的 message.parts 格式

```typescript
{
  type: "tool-tool_now",           // 类型：tool-{工具名}
  state: "output-available",       // 状态：成功
  toolCallId: "msg_xxx",           // 调用 ID
  output: [                        // 输出数据（注意字段名是 output）
    { type: "text", text: "2025-11-24T15:27:05.034988+00:00" }
  ],
  providerExecuted: true           // 后端执行标记
}
```

### 提取后的 PluginOutput 格式

```typescript
{
  toolName: "tool_now",            // 工具名（已去掉 "tool-" 前缀）
  toolCallId: "msg_xxx",           // 调用 ID
  result: [                        // 原始 output 数据
    { type: "text", text: "2025-11-24T15:27:05.034988+00:00" }
  ]
}
```

---

## 🎨 UI 设计建议

### 卡片设计原则

1. **一致的间距**
   ```tsx
   marginVertical: 8,
   marginHorizontal: 4,
   padding: 16,
   ```

2. **深色主题配色**
   - 背景：`#1a1a2e`
   - 边框：`#2d2d44`
   - 主文本：`#ffffff`
   - 次要文本：`#8b8b9f`
   - 辅助文本：`#6b6b7f`

3. **品牌色强调**
   - 蓝紫色：`#6366f1` (时间、工具)
   - 金黄色：`#fbbf24` (天气、警告)
   - 绿色：`#10b981` (成功、完成)
   - 红色：`#ef4444` (错误、失败)

4. **圆角和阴影**
   ```tsx
   borderRadius: 16,
   shadowColor: '#6366f1',
   shadowOffset: { width: 0, height: 4 },
   shadowOpacity: 0.3,
   shadowRadius: 8,
   elevation: 8, // Android 阴影
   ```

### 图标选择

使用 `@expo/vector-icons` 的 Ionicons：

| 工具类型 | 推荐图标 |
|---------|---------|
| 时间 | `time-outline` |
| 天气 | `sunny`, `rainy`, `cloudy` |
| 位置 | `location-outline` |
| 搜索 | `search-outline` |
| 计算 | `calculator-outline` |
| 文件 | `document-text-outline` |

---

## 🐛 调试技巧

### 1. 检查插件是否被识别

```tsx
console.log('[Chatbot] 可用渲染器:', Object.keys(PLUGIN_RENDERERS));
```

输出应包含你的工具名，例如：`["tool_now", "tool_weather"]`

### 2. 检查数据提取

在 `extractPluginOutputs` 中添加临时日志：

```typescript
console.log('[Debug] 提取的插件:', outputs);
```

### 3. 检查渲染器调用

在你的渲染器中：

```tsx
const YourRenderer: PluginRenderer = ({ result, toolName }) => {
  console.log('[YourRenderer] 收到数据:', { toolName, result });
  // ...
};
```

### 4. 常见问题

**问题**：卡片不显示
- ✅ 检查工具名是否匹配（区分大小写）
- ✅ 检查 `PLUGIN_RENDERERS` 中是否已注册
- ✅ 检查渲染器是否返回了有效的 JSX

**问题**：数据解析失败
- ✅ 打印 `result` 查看实际格式
- ✅ 检查 AgentScope 返回的数据结构
- ✅ 添加 try-catch 捕获错误

**问题**：样式不生效
- ✅ 使用 `style` 对象，不是 CSS 字符串
- ✅ 检查 React Native 支持的样式属性
- ✅ Android 需要 `elevation`，iOS 需要 `shadow*`

---

## 📝 最佳实践

### 1. 命名规范

- **组件文件**：`{ToolName}Card.tsx`（大驼峰）
- **渲染器函数**：`{ToolName}CardRenderer`
- **工具名**：与 AgentScope 后端保持一致

### 2. 错误处理

```tsx
const YourRenderer: PluginRenderer = ({ result }) => {
  try {
    // 数据解析逻辑
    const data = parseData(result);
    
    // 数据验证
    if (!data || !data.requiredField) {
      console.warn('[YourRenderer] 缺少必要字段');
      return null;
    }
    
    return <YourCard {...data} />;
  } catch (error) {
    console.error('[YourRenderer] 错误:', error);
    return null; // 失败时不显示，不影响其他内容
  }
};
```

### 3. 类型安全

```tsx
interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

const parseWeatherData = (result: unknown): WeatherData | null => {
  // 类型守卫和验证
  if (!Array.isArray(result)) return null;
  
  const textItem = result.find((item: any) => item?.type === 'text');
  if (!textItem?.text) return null;
  
  try {
    const data = JSON.parse(textItem.text);
    // 验证必要字段
    if (typeof data.temp !== 'number') return null;
    if (typeof data.condition !== 'string') return null;
    if (typeof data.location !== 'string') return null;
    
    return data as WeatherData;
  } catch {
    return null;
  }
};
```

### 4. 性能优化

```tsx
// ❌ 不好：每次渲染都创建新对象
<View style={{ padding: 16, backgroundColor: '#1a1a2e' }}>

// ✅ 好：使用 StyleSheet
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#1a1a2e',
  },
});

<View style={styles.card}>
```

---

## 🔄 完整工作流程总结

```
1. 后端开发
   └─ 在 AgentScope 中注册新工具
   
2. 前端开发（3 步）
   ├─ 创建卡片组件 (src/components/{Tool}Card.tsx)
   ├─ 创建渲染器 (src/components/plugin-renderers.tsx)
   └─ 注册到 PLUGIN_RENDERERS（添加一行）
   
3. 测试
   ├─ 发送触发工具的消息
   ├─ 检查控制台日志
   └─ 验证 UI 渲染
   
4. 调试（如需要）
   ├─ 检查工具名匹配
   ├─ 打印数据格式
   └─ 验证渲染逻辑
```

---

## 📚 参考资源

- **AI SDK 文档**：`.claude/skills/ai-sdk-ui/SKILL.md`
- **示例代码**：
  - TimeCard: `src/components/TimeCard.tsx`
  - 渲染器: `src/components/plugin-renderers.tsx`
  - 数据提取: `src/utils/message-utils.ts`
- **图标库**：[Expo Icons](https://icons.expo.fyi/)

---

## 💡 进阶技巧

### 1. 支持多种数据格式

```tsx
const FlexibleRenderer: PluginRenderer = ({ result }) => {
  // 格式 1: 数组包含对象
  if (Array.isArray(result) && result[0]?.type === 'text') {
    return <Card data={result[0].text} />;
  }
  
  // 格式 2: 直接是对象
  if (typeof result === 'object' && result !== null) {
    return <Card data={result} />;
  }
  
  // 格式 3: 字符串
  if (typeof result === 'string') {
    return <Card data={JSON.parse(result)} />;
  }
  
  return null;
};
```

### 2. 条件渲染不同卡片

```tsx
const SmartRenderer: PluginRenderer = ({ result }) => {
  const data = parseData(result);
  
  // 根据数据类型选择不同的卡片
  if (data.type === 'success') {
    return <SuccessCard {...data} />;
  } else if (data.type === 'error') {
    return <ErrorCard {...data} />;
  } else {
    return <InfoCard {...data} />;
  }
};
```

### 3. 添加交互功能

```tsx
export function InteractiveCard({ data }: Props) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)}>
      <View style={styles.card}>
        <Text>{data.title}</Text>
        {expanded && <Text>{data.details}</Text>}
      </View>
    </TouchableOpacity>
  );
}
```

---

## ✅ 检查清单

添加新插件前，确保：

- [ ] AgentScope 后端已注册该工具
- [ ] 了解工具返回的数据格式
- [ ] 创建了卡片组件文件
- [ ] 实现了渲染器函数
- [ ] 在 `PLUGIN_RENDERERS` 中注册
- [ ] 添加了错误处理
- [ ] 测试了正常和异常情况
- [ ] 检查了 UI 在不同屏幕尺寸下的表现

---

**祝你开发顺利！** 🚀

如有问题，请检查控制台日志或参考 `TimeCard` 的完整实现。
