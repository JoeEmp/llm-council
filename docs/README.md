# 文档和脚本目录说明

## docs/ - 项目文档

### docs/features/ - 功能文档

- **collapsible-thinking.md** - 可折叠思考内容功能说明
  - 支持 `<think>...</think>` 标签格式
  - 在 Stage1 和 Stage2 中显示思考过程
  - 默认折叠，点击展开

- **multi-provider.md** - 多供应商支持配置指南
  - 支持 OpenRouter, OpenAI, 火山引擎, DeepSeek, Ollama
  - 模型标识格式说明（provider/model）
  - 环境变量配置示例

- **table-rendering.md** - Markdown 表格渲染支持
  - remark-gfm 插件安装和使用
  - 支持的 Markdown 表格语法
  - 表格样式配置

### docs/technical/ - 技术文档

- **history-save-fix.md** - 历史对话数据保存修复说明
  - 问题现象和根本原因
  - 修复方案和实现细节
  - 数据保存策略

- **root-cause-analysis.md** - 数据丢失问题根因分析
  - 完整的问题诊断过程
  - 错误场景分析
  - 测试验证方法

### docs/testing/ - 测试文档

- **testing-guide.md** - 测试指南
  - 完整的测试步骤
  - 常见问题和调试方法
  - API 测试示例

## scripts/ - 脚本工具

### scripts/verification/ - 验证脚本

- **verify-setup.py** - 环境配置验证脚本
  - 检查供应商配置状态
  - 验证 API Key 设置
  - 测试模型标识解析

- **test-fix.js** - 修复功能验证脚本
  - 检查对话文件是否包含 assistant 消息
  - 验证 Stage 1-3 数据保存
  - 支持 watch 模式实时监控

### scripts/testing/ - 测试脚本

- **test-providers.py** - 多供应商测试脚本
  - 测试所有供应商的连通性
  - 验证模型查询功能
  - 测试并行查询

## 使用示例

### 验证环境配置

```bash
cd /Users/joe/Documents/CodeManager/git_repo/github/llm-council
python scripts/verification/verify-setup.py
```

### 检查数据保存

```bash
node scripts/verification/test-fix.js
```

### 测试供应商

```bash
python scripts/testing/test-providers.py
```

## 文档阅读建议

1. **新用户**：先阅读 `docs/features/multi-provider.md` 配置环境
2. **遇到问题**：查看 `docs/technical/` 目录下的相关文档
3. **开发新功能**：参考 `docs/features/` 中的实现模式
4. **调试问题**：使用 `scripts/verification/` 中的工具脚本
