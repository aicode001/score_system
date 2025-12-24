-- 添加评分类别表
CREATE TABLE IF NOT EXISTS score_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 为score_questions表添加category_id字段（如果不存在）
ALTER TABLE score_questions 
ADD COLUMN IF NOT EXISTS category_id VARCHAR(36) AFTER description,
ADD COLUMN IF NOT EXISTS description TEXT AFTER title;

-- 添加外键约束（如果不存在）
-- 注意：如果外键已存在会报错，可以忽略
ALTER TABLE score_questions 
ADD CONSTRAINT fk_question_category 
FOREIGN KEY (category_id) REFERENCES score_categories(id) ON DELETE SET NULL;

-- 插入默认评分类别示例（可选）
INSERT INTO score_categories (id, name, description, sort_order) VALUES
(UUID(), '基础能力评分', '包括工作完成质量、专业技能等基础评分项', 1),
(UUID(), '综合素质评分', '包括团队协作、创新能力等综合素质评分项', 2);
