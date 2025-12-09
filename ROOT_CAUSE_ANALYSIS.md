# 历史对话数据丢失问题 - 根因分析与修复

## 问题现象

在 `data/conversations/` 目录下的对话文件中，有些只包含 user 消息（249 字节），缺少 assistant 消息（应该 > 300 字节）。

例如：
- `873921f1-a321-4bf6-bfcf-ffcae55ac983.json` (249 字节) ❌ 只有 user 消息
- `ad38de86-a617-432a-9f18-378a13c3b50e.json` (787 字节) ✓ 包含 assistant 消息

## 根因分析

### 问题定位

经过深入调查，确认问题出在：**后端在 streaming 过程中发生错误时没有保存数据**。

### 代码分析

在 `backend/main.py` 的 streaming API：

```python
async def event_generator():
    try:
        # ... 执行三个阶段 ...
        stage1_results = await stage1_collect_responses(...)
        stage2_results, label_to_model = await stage2_collect_rankings(...)
        stage3_result = await stage3_synthesize_final(...)

        # 只有全部成功后才保存
        storage.add_assistant_message(...)

    except Exception as e:
        # 发生错误时没有保存数据！
        yield f"data: {json.dumps({'type': 'error', ...})}\n\n"
```

**问题**：
- 如果 Stage 1 失败 → 不保存任何数据
- 如果 Stage 2 失败 → 不保存 Stage 1 的数据
- 如果 Stage 3 失败 → 不保存 Stage 1 和 Stage 2 的数据

### 错误场景

常见导致失败的原因：

1. **API 调用超时**（最常见）
   ```
   httpx.TimeoutException: Timeout
   ```

2. **Rate limit**
   ```
   HTTP 429: Too Many Requests
   ```

3. **模型不可用**
   ```
   HTTP 404: Model not found
   ```

4. **网络问题**
   ```
   ConnectionError: Connection reset by peer
   ```

5. **用户中断**
   - 关闭浏览器窗口
   - 刷新页面
   - 导航到其他页面

## 修复方案

### 方案：在 finally 块中始终保存数据

修改 `backend/main.py`：

```python
async def event_generator():
    # 初始化变量
    stage1_results = []
    stage2_results = []
    stage3_result = {
        "model": "error",
        "response": "Failed to generate response: An error occurred during processing."
    }

    try:
        # 执行三个阶段
        stage1_results = await stage1_collect_responses(...)
        stage2_results, label_to_model = await stage2_collect_rankings(...)
        stage3_result = await stage3_synthesize_final(...)

    except Exception as e:
        # 发送错误事件给前端
        yield f"data: {json.dumps({'type': 'error', ...})}\n\n"
    finally:
        # 无论成功还是失败，都保存数据
        storage.add_assistant_message(
            conversation_id,
            stage1_results,
            stage2_results,
            stage3_result
        )
```

### 优点

✅ **数据不丢失**：即使发生错误，已获取的数据也会被保存
✅ **部分结果可见**：用户能看到成功的阶段
✅ **便于调试**：从保存的数据中可以看出哪个阶段失败了
✅ **更好的用户体验**：不用重新开始整个流程

### 数据保存策略

| 场景 | 保存的数据 |
|------|-----------|
| Stage 1 失败 | user 消息 + 空的 stage1/2/3 |
| Stage 2 失败 | user 消息 + Stage 1 |
| Stage 3 失败 | user 消息 + Stage 1 + Stage 2 |
| 全部成功 | user 消息 + Stage 1 + Stage 2 + Stage 3 ✓ |

## 验证方法

### 1. 检查对话文件大小

```bash
ls -lh data/conversations/
```

- 249 字节：只有 user 消息（旧版本失败时）
- 300-500 字节：包含 assistant 消息（新版本部分成功）
- > 500 字节：完整的三阶段数据（完整成功）

### 2. 查看对话内容

```bash
cat data/conversations/xxx.json | jq
```

检查是否有 `assistant` 消息：

```json
{
  "messages": [
    {"role": "user", ...},
    {"role": "assistant", "stage1": [...], "stage2": [...], "stage3": {...}}
  ]
}
```

### 3. 查看后端日志

```bash
tail -f backend.log
```

查找错误：
```
Error querying model ollama/llama3.1: timeout
Error in stage 2: ...
```

## 测试结果

### 修复前

- ❌ Stage 1 失败：无任何数据保存
- ❌ Stage 2 失败：Stage 1 数据丢失
- ❌ Stage 3 失败：Stage 1+2 数据丢失
- ✅ 全部成功：完整保存

### 修复后

- ⚠️ Stage 1 失败：只保存 user 消息 + error message
- ⚠️ Stage 2 失败：保存 user + Stage 1 + error message
- ⚠️ Stage 3 失败：保存 user + Stage 1 + Stage 2 + error message
- ✅ 全部成功：完整保存三阶段 + Stage 3

## 相关文件

- `backend/main.py` - streaming API（已修复）
- `frontend/src/App.jsx` - 重新加载对话（已修复）
- `backend/council.py` - 三阶段逻辑（保持不变）
- `backend/storage.py` - 存储逻辑（保持不变）

## 版本信息

- **v2.1 (当前)**：在 finally 块中保存数据 + 前端重新加载
  - 后端总是保存数据（无论成功失败）
  - 前端在 complete 事件后重新加载对话

- **v2.0**：在 finally 块中保存数据
  - 后端总是保存数据
  - 前端不重新加载（仍有显示问题）

- **v1.0 (原始)**：只在 try 块中保存
  - 后端只在成功时保存
  - 前端不重新加载
  - ❌ 数据丢失问题
