# 评分类别功能说明

## 功能概述

新增了评分类别功能，允许管理员配置不同的评分类别，评委在打分前需要先选择要评分的类别。

## 主要变更

### 1. 数据库变更

添加了新的表和字段：

- 新增 `score_categories` 表：存储评分类别信息
- `score_questions` 表新增 `category_id` 字段：题目关联到类别
- `score_questions` 表新增 `description` 字段：题目详细描述（TEXT类型）

### 2. 数据库升级

**重要：** 需要运行数据库迁移脚本来更新表结构。

#### 方法一：使用SQL脚本
```bash
mysql -u用户名 -p 数据库名 < scripts/add_categories.sql
```

#### 方法二：手动执行SQL（如果脚本执行失败）
```sql
-- 创建评分类别表
CREATE TABLE IF NOT EXISTS score_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 修改题目表
ALTER TABLE score_questions 
ADD COLUMN category_id VARCHAR(36) AFTER description;

ALTER TABLE score_questions 
MODIFY COLUMN description TEXT;
```

### 3. 使用流程

#### 管理员配置

1. 登录管理员账号
2. 进入"评分类别"标签页
3. 点击"添加类别"创建评分类别（如：基础能力评分、综合素质评分等）
4. 在"题目管理"中，为每个题目关联所属类别（可选）

#### 评委使用

1. 评委登录后，会先进入"选择评分类别"页面
2. 选择要评分的类别后，进入打分页面
3. 该页面只显示该类别下的题目
4. 完成打分后，可返回重新选择其他类别继续打分

### 4. 特性说明

- **类别管理**：管理员可以添加、编辑、删除评分类别
- **题目关联**：题目可以关联到类别，也可以不关联（显示为"无类别"）
- **灵活配置**：支持排序字段，控制类别显示顺序
- **向后兼容**：未关联类别的题目仍然可以正常使用
- **级联处理**：删除类别时，关联题目的类别ID会被设为NULL，不影响题目本身

### 5. 注意事项

1. 如果没有配置任何类别，评委仍可直接进入打分页面
2. 删除类别不会删除题目，只会解除关联关系
3. 类别的排序数字越小，显示越靠前
4. 题目的"具体描述"字段现在支持更长的文本内容（TEXT类型）

## API 变更

### 新增 API

- `GET /api/categories` - 获取所有类别
- `POST /api/categories` - 添加类别
- `PUT /api/categories` - 更新类别
- `DELETE /api/categories?id=xxx` - 删除类别

### 修改 API

- `GET /api/questions?categoryId=xxx` - 支持按类别筛选题目

## 页面变更

- 新增：`/judge-select` - 评委选择类别页面
- 修改：`/judge` - 支持类别参数，筛选题目
- 修改：`/admin` - 新增"评分类别"管理标签页

## 数据类型定义

```typescript
export interface ScoreCategory {
  id: string
  name: string
  description?: string
  sortOrder: number
}

export interface ScoreQuestion {
  id: string
  title: string
  description?: string
  categoryId?: string      // 新增
  categoryName?: string    // 新增
  minScore: number
  maxScore: number
  step: number
}
```
