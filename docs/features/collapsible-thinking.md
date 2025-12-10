# 可折叠思考内容功能

## 功能概述

该功能允许模型在输出中包裹思考过程，前端会自动检测并以可折叠的形式显示，使界面更加整洁。

## 支持的格式

目前支持以下格式的思考内容：

### `<think>...</think>` 标签

DeepSeek-R1 和其他推理模型使用此格式：

```
<think>
这里是模型的思考过程...
可以进行多行分析
</think>

这里是最终的答案内容
```

## 工作原理

1. **检测**: 前端自动检测 `<think>` 标签
2. **分离**: 将思考内容与主要内容分离
3. **显示**:
   - 主要内容直接显示
   - 思考内容默认折叠，点击可展开

## 实现细节

### 核心函数

`splitThinkingFromContent(text)` - 分离思考内容和主要内容

```javascript
function splitThinkingFromContent(text) {
  const thinkPattern = /<think>([\s\S]*?)<\/think>/;
  const match = text.match(thinkPattern);

  if (match) {
    const thinking = match[1].trim();
    const content = text.replace(thinkPattern, '').trim();
    return { hasThinking: true, thinking, content };
  }

  return { hasThinking: false, thinking: '', content: text };
}
```

### 受影响的组件

- `Stage1.jsx` - 阶段 1 的模型响应
- `Stage2.jsx` - 阶段 2 的同行评审评估

### 样式

思考内容显示为：
- 灰色文本
- 左侧有边框线
- 缩进显示
- 字体稍小

## 使用示例

### 后端返回格式

```json
{
  "response": "<think>我需要仔细分析这个问题...</think>\n\n这是最终的回答。"
}
```

### 前端显示

**主要内容**:
> 这是最终的回答。

**思考过程** (可折叠):
▼ 点击展开查看思考过程

---

## 扩展支持

要支持其他思考格式，修改 `splitThinkingFromContent` 函数：

```javascript
function splitThinkingFromContent(text) {
  // 支持 <think> 标签
  const thinkPattern = /<think>([\s\S]*?)<\/think>/;
  const match = text.match(thinkPattern);
  if (match) {
    // ...处理逻辑
  }

  // 支持其他格式 (如 OpenAI reasoning)
  // const reasoningPattern = ...

  return { hasThinking: false, thinking: '', content: text };
}
```

## 配置

无需额外配置，自动生效。所有包含 `<think>` 标签的内容都会自动显示为可折叠形式。
