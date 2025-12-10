# 国际化功能使用说明

## 功能概述
LLM Council现已支持中英文双语切换功能，用户可以在界面右上角选择自己喜欢的语言。

## 技术实现

### 使用的库
- **react-i18next**: React官方推荐的国际化解决方案
- **i18next**: 核心国际化框架
- **i18next-browser-languagedetector**: 自动检测浏览器语言偏好

### 语言文件位置
```
frontend/public/locales/
├── en/
│   └── translation.json  # 英文翻译
└── zh/
    └── translation.json  # 中文翻译
```

### 核心文件
- **src/i18n.js**: i18next 配置和初始化
- **src/main.jsx**: 导入i18n初始化文件
- **src/components/LanguageSelector.jsx**: 语言切换组件

## 如何使用

### 1. 切换语言
在应用界面右上角，Config按钮左侧，可以看到一个下拉菜单：
- **English**: 切换到英文界面
- **中文**: 切换到中文界面

您的语言偏好会自动保存到浏览器中，下次访问时会自动应用。

### 2. 当前支持的语言
- **English**: 完整的英文界面
- **中文 (简体中文)**: 完整的中文界面

## 开发指南

### 添加新文本
当你需要在代码中添加新的用户可见文本时，请按照以下步骤：

1. **在组件中导入useTranslation钩子**：
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  // ...
}
```

2. **使用t()函数包裹文本**：
```javascript
// ❌ 不要这样做
<div>Submit</div>

// ✅ 应该这样做
<div>{t('submit')}</div>
```

3. **在翻译文件中添加对应的键值对**：

**英文文件** (`public/locales/en/translation.json`):
```json
{
  "submit": "Submit",
  "cancel": "Cancel"
}
```

**中文文件** (`public/locales/zh/translation.json`):
```json
{
  "submit": "提交",
  "cancel": "取消"
}
```

### 处理变量插值
如果你的文本包含动态变量，使用双花括号：

```javascript
// 在代码中
t('message_count', { count: messageCount });

// 在翻译文件中
{
  "message_count": "{{count}} messages"
}
```

### 添加新语言
要添加新语言支持（例如日语）：

1. **创建新的翻译目录**：
```bash
mkdir -p public/locales/ja
```

2. **创建翻译文件** `public/locales/ja/translation.json`

3. **在组件中添加语言选项**（修改 `LanguageSelector.jsx`）：
```javascript
<option value="ja">日本語</option>
```

4. **更新i18n配置**（如有需要）

## 已国际化组件

以下所有组件已完成国际化：

1. **App.jsx**: 主应用组件
2. **ChatInterface.jsx**: 聊天界面
3. **Stage1.jsx**: 阶段1显示
4. **Stage2.jsx**: 阶段2显示
5. **Stage3.jsx**: 阶段3显示
6. **Sidebar.jsx**: 侧边栏
7. **ModelSelector.jsx**: 模型选择器
8. **ConfigPanel.jsx**: 配置面板
9. **Collapsible.jsx**: 可折叠组件
10. **api.js**: API错误消息

## 注意事项

### 1. 模型名称保持原样
模型标识符（如 `openai/gpt-4o`）不会被翻译，保持英文原文。

### 2. 特殊符号和图标
特殊符号如 `▼`, `▶`, `↻` 在各种语言中保持不变。

### 3. 语言检测优先级
应用会按以下顺序检测用户语言：
1. localStorage中保存的偏好设置
2. 浏览器语言设置
3. 默认语言（English）

### 4. 后端错误处理
后端API返回的错误消息现在也会根据用户选择的语言显示。

### 5. 无需重启
切换语言会立即生效，无需重启应用。

## 测试清单

要确保国际化功能正常工作，请检查：

- [ ] 所有界面元素都能正确显示英文和中文
- [ ] 切换语言后所有文本都立即更新
- [ ] 刷新页面后能保持之前选择的语言
- [ ] 所有动态内容（如消息数量）正确显示
- [ ] 所有按钮、标题、提示文本都已翻译
- [ ] 错误消息能正确显示对应语言
- [ ] 侧边栏、聊天界面、模型选择器、配置面板都支持双语

## 常见问题

### Q: 为什么我修改了翻译文件但没有生效？
A: 请确保：
1. 修改的是正确的语言文件（en/ 或 zh/）
2. 键名与代码中使用的完全一致（区分大小写）
3. 变量名使用双花括号 `{{variable}}`
4. 保存文件后刷新浏览器（可能受缓存影响）

### Q: 如何在组件外部使用翻译（例如在API文件）？
A: 可以直接导入i18n实例：
```javascript
import i18n from './i18n';
i18n.t('error_message');
```

### Q: 可以自动提取需要翻译的文本吗？
A: 可以使用工具如 i18next-scanner 自动扫描代码并提取所有使用 t() 函数的键。

## 性能考虑

- 翻译文件按需加载，初始加载速度很快
- 语言文件体积小（约5KB），对应用性能影响很小
- 使用localStorage缓存语言偏好，避免重复加载

## 已知问题

暂无已知问题。如果您发现任何遗漏的未翻译文本，请报告。

## 版本信息

**国际化功能版本**: 1.0
**最后更新**: 2025-12-10
**维护者**: Claude

## 贡献指南

如果您想改进翻译或添加新语言：

1. Fork 项目
2. 创建翻译文件
3. 提交 Pull Request
4. 在PR描述中注明添加了哪些翻译或语言

---

**注意**: 本功能使用AI辅助生成翻译，欢迎母语者审校和改进翻译质量！
