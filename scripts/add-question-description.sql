-- 为评分题目表添加描述字段
USE score_system;

ALTER TABLE score_questions 
ADD COLUMN description TEXT AFTER title;
