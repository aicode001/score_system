-- 为users表添加category_id字段
-- 只有述职人员(presenter)需要关联评分类别，评委和管理员不需要

ALTER TABLE users 
ADD COLUMN  category_id VARCHAR(36) AFTER role;

-- 添加外键约束（如果不存在）
ALTER TABLE users 
ADD CONSTRAINT fk_user_category 
FOREIGN KEY (category_id) REFERENCES score_categories(id) ON DELETE SET NULL;

-- 说明：
-- 1. category_id字段为可选，允许为NULL
-- 2. 当删除评分类别时，关联用户的category_id会被设置为NULL
-- 3. 只有role='presenter'的用户需要设置category_id
-- 4. 评委(judge)和管理员(admin)的category_id为NULL
