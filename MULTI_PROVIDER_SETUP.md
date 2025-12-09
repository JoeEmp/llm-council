# 多模型供应商配置指南

本指南介绍如何配置 LLM Council 以支持多个模型供应商。

## 支持的供应商

本项目现在支持以下模型供应商:

1. **OpenRouter** - 聚合多个模型的平台 (默认)
2. **OpenAI** - OpenAI API 兼容格式 (包括 Azure OpenAI、Groq 等)
3. **火山引擎 (Doubao/Ark)** - 字节跳动模型服务
4. **DeepSeek** - DeepSeek API
5. **Ollama** - 本地运行的开源模型

## 模型标识格式

所有模型使用统一的标识格式:

```
供应商/模型名
```

或者对于 OpenRouter 的嵌套路径:

```
供应商/子路径/模型名
```

### 示例

- `openrouter/openai/gpt-4o` - OpenRouter 上的 GPT-4o
- `openai/gpt-4o` - 直接调用 OpenAI
- `doubao/deepseek-v3` - 火山引擎的 DeepSeek V3
- `deepseek/deepseek-chat` - DeepSeek 官方 Chat API
- `ollama/llama3.1` - 本地的 Llama 3.1 模型

## 配置步骤

### 1. 复制环境配置文件

```bash
cp .env.example .env
```

### 2. 填写 API Keys

编辑 `.env` 文件,添加你想要使用的供应商的 API Key:

```env
# OpenRouter (https://openrouter.ai/keys)
OPENROUTER_API_KEY=your_key_here

# OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# 火山引擎 (https://console.volcengine.com/ark)
DOUBAO_API_KEY=your_key_here

# DeepSeek (https://platform.deepseek.com/api_keys)
DEEPSEEK_API_KEY=sk-...

# Ollama (本地,无需 API Key)
# OLLAMA_BASE_URL=http://localhost:11434
```

### 3. 配置使用的模型

编辑 `backend/config.py`,在 `COUNCIL_MODELS` 列表中添加你想要使用的模型:

```python
COUNCIL_MODELS = [
    "openrouter/openai/gpt-4o",
    "openrouter/google/gemini-2.5-flash",
    "openrouter/anthropic/claude-3.5-sonnet",
    "doubao/deepseek-v3",
    "deepseek/deepseek-chat",
    "ollama/llama3.1",
]

# 主席模型 - 综合最终答案
CHAIRMAN_MODEL = "openrouter/google/gemini-2.5-flash"
```

**注意**: 只有配置了 API Key 的供应商的模型会被使用。未配置的供应商会被自动忽略(优雅降级)。

## 高级配置

### 自定义 Base URL

如果你使用 API 代理或自托管服务,可以通过环境变量自定义 Base URL:

```env
OPENAI_BASE_URL=https://your-proxy.example.com/v1
DOUBAO_BASE_URL=https://custom-ark.example.com/api/v3
```

### 添加新的供应商

要添加新的供应商支持:

1. 在 `backend/providers/` 创建新的 provider 类(继承自 `ModelProvider`)
2. 在 `PROVIDER_CLASSES` 中注册新的 provider
3. 在 `MODEL_CONFIGS` 中添加配置模板
4. 在 `.env.example` 中添加示例配置

## 测试

运行测试脚本来验证配置:

```bash
python test_providers.py
```

这个脚本会测试:
- 模型标识解析
- Provider 创建
- 单模型查询
- 并行查询

## 故障排除

### 模型查询失败

如果某些模型查询失败,检查:

1. 是否配置了正确的 API Key
2. 模型标识是否正确
3. API Key 是否有访问该模型的权限
4. 网络连接是否正常

### Ollama 连接失败

如果使用 Ollama:

1. 确保 Ollama 正在运行: `ollama serve`
2. 确保模型已下载: `ollama pull llama3.1`
3. 检查端口是否开放 (默认: 11434)

## 架构说明

### 核心组件

- **`ModelProvider`** - 抽象基类,定义所有供应商的通用接口
- **`providers/factory.py`** - Provider 工厂,根据模型标识自动选择正确的供应商
- **`providers/`** - 各供应商的具体实现
- **`config.py`** - 统一的配置管理

### 工作原理

1. 系统解析模型标识 (如 `openai/gpt-4o`)
2. 根据供应商前缀选择对应的 Provider
3. Provider 使用自己的 API 格式查询模型
4. 返回统一格式的响应

这种设计使得:
- 添加新供应商非常简单
- 模型标识统一且清晰
- 错误处理和优雅降级更容易实现
- 代码复用性高
