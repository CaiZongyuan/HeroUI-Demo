# 插件 UI 渲染 - 快速参考

> 3 步添加新工具的自定义 UI 渲染

## 🚀 快速开始

### 步骤 1：创建卡片组件

```tsx
// src/components/YourCard.tsx
import { View, Text } from 'react-native';

interface YourCardProps {
  data: string; // 你的数据类型
}

export function YourCard({ data }: YourCardProps) {
  return (
    <View style={{
      marginVertical: 8,
      padding: 16,
      borderRadius: 16,
      backgroundColor: '#1a1a2e',
    }}>
      <Text style={{ color: '#fff' }}>{data}</Text>
    </View>
  );
}
```

### 步骤 2：注册渲染器

```tsx
// src/components/plugin-renderers.tsx
import { YourCard } from './YourCard';

const YourRenderer: PluginRenderer = ({ result }) => {
  try {
    // 解析 AgentScope 返回的数据
    if (Array.isArray(result)) {
      const text = result.find((item: any) => item?.type === 'text')?.text;
      if (text) return <YourCard data={text} />;
    }
    return null;
  } catch (error) {
    console.error('[YourRenderer] 错误:', error);
    return null;
  }
};

// 添加到注册表（只需这一行！）
export const PLUGIN_RENDERERS = {
  tool_now: TimeCardRenderer,
  your_tool_name: YourRenderer, // 👈 添加这里
};
```

### 步骤 3：测试

发送消息触发工具，检查卡片是否显示。

---

## 📋 数据格式

### AgentScope 返回格式

```typescript
// 常见格式 1：文本数组
[{ type: "text", text: "你的数据" }]

// 常见格式 2：JSON 字符串
[{ type: "text", text: '{"key": "value"}' }]
```

### 解析示例

```tsx
// 文本
const text = result.find((item: any) => item?.type === 'text')?.text;

// JSON
const data = JSON.parse(text);
```

---

## 🎨 样式模板

```tsx
const styles = {
  card: {
    marginVertical: 8,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0a0b8',
  },
  content: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
};
```

---

## 🐛 调试

```tsx
// 在渲染器中添加日志
console.log('[YourRenderer] 收到数据:', result);

// 检查注册
console.log('可用渲染器:', Object.keys(PLUGIN_RENDERERS));
```

---

## ✅ 检查清单

- [ ] 后端已注册工具
- [ ] 创建了卡片组件
- [ ] 实现了渲染器
- [ ] 添加到 PLUGIN_RENDERERS
- [ ] 测试成功

---

**详细文档**：`docs/插件UI渲染系统指南.md`
