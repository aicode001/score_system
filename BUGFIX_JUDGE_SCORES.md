# 评委打分数据加载修复说明

## 🐛 问题描述

评委打分时,切换评分周期或述职人员后,对应的分数没有从数据库重新加载并显示。滑块位置保持不变。

## 🔍 问题原因

发现了**两个关键问题**:

### 问题 1: useEffect 依赖项问题 (app/judge/page.tsx)

在原来的代码中,`useEffect` 的依赖项包含了 `questions` 数组对象:

```typescript
useEffect(() => {
  // ...
}, [selectedPeriod, selectedPresenter, userId, questions])
```

由于 `questions` 是一个对象数组,React 进行的是引用比较,导致数据加载逻辑可能不正确触发。

### 问题 2: ScoreSlider 组件状态同步问题 ⚠️ **根本原因**

**这是主要问题!** `ScoreSlider` 组件使用了内部状态 `currentValue`:

```typescript
const [currentValue, setCurrentValue] = useState(value)
```

组件只在**初始化时**设置 `currentValue = value`,当父组件传入的 `value` prop 改变时,组件内部的 `currentValue` **不会自动更新**!

这就是为什么切换述职人员或周期后,滑块位置和显示的数值都不变的原因。

## ✅ 修复方案

### 修复 1: 优化 useEffect 依赖项 (app/judge/page.tsx)

移除 `questions` 数组依赖,改为在函数内部检查:

```typescript
useEffect(() => {
  async function loadScores() {
    // 先检查所有必需条件
    if (!selectedPeriod || !selectedPresenter || !userId || questions.length === 0) {
      return
    }
    
    // 加载评分数据...
  }
  
  loadScores()
}, [selectedPeriod, selectedPresenter, userId])
```

### 修复 2: ScoreSlider 组件同步外部 value ⭐ **关键修复**

**添加 useEffect 监听 value 变化**:

```typescript
export default function ScoreSlider({ min, max, step, value, onChange, label }: ScoreSliderProps) {
  const [currentValue, setCurrentValue] = useState(value)

  // 🔥 关键修复:当外部 value 变化时,同步更新内部状态
  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    setCurrentValue(newValue)
    onChange(newValue)
  }
  
  // ...
}
```

现在当父组件传入新的 `value` 时,滑块会立即更新!

## 🧪 测试步骤

### 步骤 1: 准备测试数据

1. 确保数据库已初始化(访问 `/api/init`)
2. 确保有多个评分周期
3. 确保有多个述职人员

### 步骤 2: 测试切换述职人员

1. 以评委身份登录(如: 评委张三, 密码: 123456)
2. 选择第一个述职人员(如: 述职人员王五)
3. 为每个题目打分,例如:
   - 题目1: 8.5 分
   - 题目2: 9.0 分
   - 题目3: 7.5 分
4. 点击"保存所有评分"
5. **切换到第二个述职人员**(如: 述职人员赵六)
6. ✅ **验证**: 所有分数应该重置为默认最小值(0分)
7. 为第二个述职人员打分:
   - 题目1: 6.5 分
   - 题目2: 7.0 分
   - 题目3: 8.5 分
8. 保存评分
9. **再切换回第一个述职人员**(述职人员王五)
10. ✅ **验证**: 应该显示之前保存的分数(8.5, 9.0, 7.5)

### 步骤 3: 测试切换评分周期

1. 确保管理员已创建多个评分周期
2. 在当前周期为某个述职人员打分并保存
3. **切换到另一个评分周期**
4. ✅ **验证**: 分数应该重置(新周期没有评分记录)
5. 在新周期打分并保存
6. **切换回第一个周期**
7. ✅ **验证**: 应该显示该周期之前保存的分数

### 步骤 4: 检查控制台日志

打开浏览器开发者工具(F12),查看 Console 标签页:

应该看到类似的日志:
```
加载评分数据: {selectedPeriod: "xxx", selectedPresenter: "yyy", userId: "zzz"}
获取到的评分: [{...}, {...}]
题目 工作完成质量: 加载已有分数 8.5
题目 团队协作能力: 加载已有分数 9
题目 创新能力: 加载已有分数 7.5
```

或者(如果是新记录):
```
加载评分数据: {selectedPeriod: "xxx", selectedPresenter: "yyy", userId: "zzz"}
获取到的评分: []
题目 工作完成质量: 使用默认分数 0
题目 团队协作能力: 使用默认分数 0
题目 创新能力: 使用默认分数 0
```

## 📝 预期行为

### ✅ 正确行为

1. **切换述职人员时**:
   - 如果之前为该人员打过分 → 显示已保存的分数
   - 如果之前没有打过分 → 显示默认最小分数

2. **切换评分周期时**:
   - 如果在该周期为当前述职人员打过分 → 显示已保存的分数
   - 如果在该周期没有打过分 → 显示默认最小分数

3. **保存按钮状态**:
   - 已保存的分数 → 按钮显示"已保存"(绿色)2秒
   - 修改后未保存 → 按钮显示"保存"(蓝色)

### ❌ 错误行为(已修复)

1. 切换述职人员或周期后,分数不变
2. 显示的是上一个人员/周期的分数
3. 滑块位置不更新

## 🔧 代码变更摘要

### 文件 1: `components/ScoreSlider.tsx` ⭐ **最重要**

**变更**:
1. 添加 `useEffect` 导入
2. 添加 `useEffect` 监听 `value` prop 的变化
3. 当 `value` 改变时,同步更新内部状态 `currentValue`

**修复前**:
```typescript
import React, { useState } from 'react'

export default function ScoreSlider({ min, max, step, value, onChange, label }) {
  const [currentValue, setCurrentValue] = useState(value)
  // value 变化时,currentValue 不会更新! ❌
}
```

**修复后**:
```typescript
import React, { useState, useEffect } from 'react'

export default function ScoreSlider({ min, max, step, value, onChange, label }) {
  const [currentValue, setCurrentValue] = useState(value)
  
  // 监听 value 变化,同步更新内部状态 ✅
  useEffect(() => {
    setCurrentValue(value)
  }, [value])
}
```

### 文件 2: `app/judge/page.tsx`

**变更**:
1. 优化 `useEffect` 依赖项,只包含 `selectedPeriod`, `selectedPresenter`, `userId`
2. 在函数内部检查 `questions.length`
3. 添加调试日志
4. 添加错误处理 try-catch

## 🎯 验证清单

- [ ] 切换述职人员,分数正确加载
- [ ] 切换评分周期,分数正确加载
- [ ] 保存评分后,再次切换回来能看到保存的分数
- [ ] 控制台日志正确显示加载信息
- [ ] 没有 JavaScript 错误
- [ ] 滑块位置与显示的数值一致

## 💡 后续优化建议

1. **添加加载状态**:
   ```typescript
   const [loadingScores, setLoadingScores] = useState(false)
   ```
   在加载时显示 loading 提示

2. **添加过渡动画**:
   切换时添加淡入淡出效果,提升用户体验

3. **缓存优化**:
   缓存已加载的评分数据,避免重复请求

4. **移除调试日志**:
   生产环境应该移除 console.log

## 📞 如果问题仍然存在

1. 清除浏览器缓存并刷新页面
2. 检查控制台是否有错误信息
3. 验证 `/api/scores?periodId=xxx` API 返回数据是否正确
4. 检查数据库中 scores 表的数据
