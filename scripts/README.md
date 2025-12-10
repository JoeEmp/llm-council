# Scripts 目录说明

本目录包含用于验证、测试和调试 LLM Council 的各种脚本工具。

## 目录结构

```
scripts/
├── verification/          # 验证脚本
│   ├── verify-setup.py   # 环境配置验证
│   └── test-fix.js       # 功能修复验证
└── testing/              # 测试脚本
    └── test-providers.py # 供应商测试
```

## 验证脚本 (verification/)

### verify-setup.py

用于验证 LLM Council 的环境配置是否正确。

**功能**：
- 检查所有支持的供应商配置（OpenRouter, OpenAI, 火山引擎, DeepSeek, Ollama）
- 验证 API Key 是否设置
- 显示已配置的模型列表
- 测试模型标识解析

**使用方法**：
```bash
python scripts/verification/verify-setup.py
```

**输出示例**：
```
================================================================================
LLM Council Multi-Provider Setup Verification
================================================================================

1. Supported Providers:
  openrouter      ✓ Configured
  openai          ✗ Missing API Key
  doubao          ✗ Missing API Key
  deepseek        ✗ Missing API Key
  ollama          ✓ Available (Local)

2. Council Members Configuration:
   1. ollama/deepseek-r1:1.5b         ✓ Usable
   2. ollama/qwen3:1.7b              ✓ Usable
```

### test-fix.js

用于验证历史对话数据保存功能是否正常工作。

**功能**：
- 检查最新的对话文件
- 验证是否包含 assistant 消息
- 验证 Stage 1-3 数据是否保存
- 支持 watch 模式实时监控

**使用方法**：
```bash
# 一次性检查
node scripts/verification/test-fix.js

# 监控模式（实时监控文件变化）
node scripts/verification/test-fix.js --watch
```

**输出示例**：
```
Checking latest conversation files...

Latest: ad38de86-a617-432a-9f18-381a13c3b50e.json
Messages: 2

Message 1:
  Role: user
  Content: 聊聊openai和 claude 谁跟厉害吧...

Message 2:
  Role: assistant
  Stage 1: ✅ 2 responses
  Stage 2: ✅ 1 rankings
  Stage 3: ✅ ollama/gemma3:latest

==================================================
✅ Assistant message FOUND
✅ ALL three stages saved successfully
```

## 测试脚本 (testing/)

### test-providers.py

用于测试多供应商支持的完整功能。

**功能**：
- 测试单个模型查询
- 测试并行查询多个模型
- 验证所有配置的供应商
- 检查模型标识解析

**使用方法**：
```bash
python scripts/testing/test-providers.py
```

**测试内容**：
1. 模型标识解析测试
2. 供应商创建测试
3. 单模型查询测试（可选）
4. 并行查询测试（可选）

## 使用建议

1. **首次部署后**：运行 `verify-setup.py` 确认配置正确
2. **遇到数据丢失**：运行 `test-fix.js` 检查保存功能
3. **添加新供应商**：运行 `test-providers.py` 验证连通性
4. **持续监控**：使用 `test-fix.js --watch` 在开发过程中监控

## 脚本要求

- **verify-setup.py**: Python 3.7+, 需要安装项目依赖 (`pip install -r requirements.txt`)
- **test-fix.js**: Node.js 14+, 需要安装前端依赖 (`cd frontend && npm install`)
- **test-providers.py**: Python 3.7+, 需要正确配置 `.env` 文件

## 故障排除

如果脚本运行失败：

1. **检查依赖**：确保已安装所有必要的依赖包
2. **检查路径**：在项目根目录运行脚本
3. **检查配置**：确保 `.env` 文件配置正确
4. **查看日志**：检查 `backend.log` 获取详细错误信息
