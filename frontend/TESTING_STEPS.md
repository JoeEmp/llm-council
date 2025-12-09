# 测试 LLM Council 数据保存功能

## 测试步骤

1. **启动前端**
   ```bash
   cd frontend
   npm run dev
   ```

2. **创建新对话**
   - 点击 "New Conversation"
   - 输入问题（如："2+2等于多少？"）
   - 按 Enter 发送

3. **等待所有三个阶段完成**
   - Stage 1: 收集各模型的独立回答
   - Stage 2: 模型互相评价和排序
   - Stage 3: 主席综合最终答案

4. **验证数据保存**
   - 检查浏览器控制台是否有错误
   - 查看对话文件是否包含 assistant 消息
   ```bash
   tail -f data/conversations/*.json
   ```

5. **刷新页面测试**
   - 刷新浏览器页面
   - 确认能看到三个阶段的讨论结果

## 可能的问题

### 1. 如果 staging 失败，数据还会保存吗？

**会！** 从版本 2.0 开始，无论成功还是失败，获取到的数据都会被保存。

- 如果 Stage 1 失败：只保存 user 消息
- 如果 Stage 2 失败：保存 user 消息 + Stage 1 结果
- 如果 Stage 3 失败：保存 user 消息 + Stage 1 + Stage 2 结果
- 如果全部成功：保存完整的三阶段数据

### 2. 如何判断是否成功保存？

查看对话文件大小：
- 249 字节：只有 user 消息（失败）
- > 300 字节：包含 assistant 消息（成功）

查看对话文件内容：
```json
{
  "messages": [
    {
      "role": "user",
      "content": "..."
    },
    {
      "role": "assistant",
      "stage1": [...],
      "stage2": [...],
      "stage3": {...}
    }
  ]
}
```

### 3. 常见错误

**网络错误**：检查后端日志 `backend.log`

**API Key 错误**：验证 `.env` 文件中的 API Keys

**模型不可用**：检查 `backend/config.py` 中的模型配置

## 调试方法

### 查看后端日志

```bash
tail -f backend.log
```

查找错误信息，例如：
- `Error querying model ...`
- `Timeout ...`
- `Rate limit ...`

### 查看对话文件

```bash
ls -lt data/conversations/ | head
```

最新创建的文件在顶部。如果 assistant 消息被保存，文件大小会大于 300 字节。

### 测试 API

直接调用 API 测试：

```bash
curl -X POST http://localhost:8001/api/conversations \
  -H "Content-Type: application/json" \
  -d '{}'
```

得到 conversation_id 后：

```bash
curl -X POST http://localhost:8001/api/conversations/{id}/message \
  -H "Content-Type: application/json" \
  -d '{"content": "2+2=?"}'
```

## 版本记录

- **v2.0**：在 finally 块中保存数据（无论成功失败）
- **v1.0**：只在 try 块成功后保存数据
