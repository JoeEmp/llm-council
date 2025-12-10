# Markdown 表格渲染支持

## 功能概述

前端现在支持渲染 Markdown 表格，包括 GitHub Flavored Markdown (GFM) 的表格语法。

## 支持的语法

### 标准表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |
```

### 对齐方式

```markdown
| 左对齐 | 居中 | 右对齐 |
|:------|:----:|------:|
| 内容 | 内容 | 内容 |
```

### 无表头表格

```markdown
| 内容1 | 内容2 |
| 内容3 | 内容4 |
```

## 实现细节

### 安装的依赖

```bash
npm install remark-gfm
```

`remark-gfm` 插件提供了以下增强功能：
- ✅ 表格渲染
- ✅ 删除线（~~删除~~）
- ✅ 任务列表（- [x] 已完成）
- ✅ URL 自动链接
- ✅ 脚注

### 更新的文件

#### 1. 组件导入

所有使用 `ReactMarkdown` 的组件都添加了：

```javascript
import remarkGfm from 'remark-gfm';
```

#### 2. ReactMarkdown 使用

所有 `ReactMarkdown` 组件都添加了 `remarkPlugins` 属性：

```javascript
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {content}
</ReactMarkdown>
```

#### 3. 受影响的组件

- `ChatInterface.jsx` - 用户消息和最终答案
- `Stage1.jsx` - 各模型的独立响应
- `Stage2.jsx` - 同行评审的评价
- `Stage3.jsx` - 主席的最终综合答案
- `Collapsible.jsx` - 思考过程（导入更新）

### 表格样式

在 `index.css` 中添加了以下样式：

```css
.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  font-size: 14px;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.markdown-content th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.markdown-content tr:nth-child(even) {
  background-color: #fafafa;
}

.markdown-content tr:hover {
  background-color: #f0f7ff;
}
```

## 测试方法

### 方法一：发送包含表格的消息

发送以下消息给 LLM Council：

```
请用表格对比一下 OpenAI 和 Claude 的特点：

| 特性 | OpenAI | Claude |
|------|--------|--------|
| 语言能力 | 优秀 | 优秀 |
| 推理能力 | 强 | 强 |
| 上下文长度 | 128K | 200K |
| 价格 | 较高 | 较低 |
```

### 方法二：检查示例

创建一个测试组件验证：

```jsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const tableMarkdown = `
| 模型 | 优点 | 缺点 |
|------|------|------|
| GPT-4 | 准确度高 | 价格高 |
| Claude | 上下文长 | 速度较慢 |
`;

function TestTable() {
  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {tableMarkdown}
      </ReactMarkdown>
    </div>
  );
}
```

## 常见问题

### 1. 表格不显示边框

检查是否在 `index.css` 中添加了表格样式。

### 2. Markdown 表格语法无效

确保：
- 已安装 `remark-gfm`：`npm list remark-gfm`
- 所有 `ReactMarkdown` 组件都添加了 `remarkPlugins={[remarkGfm]}`
- 表格语法正确（每行列数相同）

### 3. 表格样式冲突

如果表格样式被其他 CSS 覆盖，检查：
- CSS 选择器优先级
- 是否有全局样式影响表格
- 是否需要提高样式优先级

## 版本信息

- **react-markdown**: ^10.1.0
- **remark-gfm**: ^4.0.0（自动安装）

## 相关文件

- `package.json` - 依赖配置
- `index.css` - 全局表格样式
- `ChatInterface.jsx` - 用户/助手脚本消息
- `Stage1.jsx` - Stage 1 响应
- `Stage2.jsx` - Stage 2 评价
- `Stage3.jsx` - Stage 3 综合答案
