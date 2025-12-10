# 历史对话 LLM Council 渲染修复

## 问题描述

在查看历史对话时，LLM Council 的三阶段讨论结果（Stage 1、Stage 2、Stage 3）不会渲染，只能看到用户消息。

## 根本原因

问题出在前端处理 streaming API 的 complete 事件时，只重新加载了对话列表（conversations list），但没有重新加载当前对话的详细消息。

### 技术细节

在 `frontend/src/App.jsx` 的 `sendMessageStream` 回调中：

```javascript
case 'complete':
  // Stream complete, reload conversations list
  loadConversations();  // 只更新了对话列表
  setIsLoading(false);
  break;
```

`loadConversations()` 函数只更新了对话列表的元数据（标题、消息数量等），但没有更新当前对话的完整消息内容。

当 streaming 完成后，后端已经正确地将 assistant 消息（包含 stage1、stage2、stage3）保存到存储中，但前端没有重新加载这些数据。

## 修复方案

在 complete 事件中，除了重新加载对话列表，还要重新加载当前对话的详细内容：

```javascript
case 'complete':
  // Stream complete, reload conversations list and current conversation
  loadConversations();
  if (currentConversationId) {
    loadConversation(currentConversationId);
  }
  setIsLoading(false);
  break;
```

## 验证步骤

1. 发送一条消息给 LLM Council
2. 等待所有三个阶段完成
3. 刷新页面或切换到其他对话再切换回来
4. 确认能看到三个阶段的完整讨论结果

## 工作原理

1. **Streaming 过程**:
   - 前端发送消息到 `/api/conversations/{id}/message/stream`
   - 后端逐个返回 stage1、stage2、stage3 的事件
   - 前端实时显示进度

2. **保存过程**:
   - 在 `event_generator()` 中，所有阶段完成后调用 `storage.add_assistant_message()`
   - assistant 消息包含完整的 stage1、stage2、stage3 数据

3. **重新加载过程**:
   - complete 事件触发后，前端调用 `loadConversation(currentConversationId)`
   - 从后端获取完整的消息列表（包括刚保存的 assistant 消息）
   - `ChatInterface` 组件渲染所有消息，包括 LLM Council 的三个阶段

## 相关文件

- `frontend/src/App.jsx` - 修复 complete 事件处理
- `backend/storage.py` - 存储逻辑（原本工作正常）
- `backend/main.py` - Streaming API 端点（原本工作正常）

## 影响范围

这个修复只影响前端在 streaming 完成后的重新加载行为，不涉及后端的存储逻辑或 API 格式。
