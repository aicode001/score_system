import mysql from 'mysql2/promise'

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// 初始化数据库表结构
export async function initDatabase() {
  const connection = await pool.getConnection()
  
  try {
    // 创建用户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role ENUM('judge', 'presenter', 'admin') NOT NULL,
        password VARCHAR(255) NOT NULL DEFAULT '123456',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 创建评分题目表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS score_questions (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        min_score DECIMAL(10,1) NOT NULL,
        max_score DECIMAL(10,1) NOT NULL,
        step DECIMAL(10,1) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 创建评分周期表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS score_periods (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('active', 'closed') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 创建评分记录表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id VARCHAR(36) PRIMARY KEY,
        question_id VARCHAR(36) NOT NULL,
        judge_id VARCHAR(36) NOT NULL,
        presenter_id VARCHAR(36) NOT NULL,
        period_id VARCHAR(36) NOT NULL,
        value DECIMAL(10,1) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_score (question_id, judge_id, presenter_id, period_id),
        FOREIGN KEY (question_id) REFERENCES score_questions(id) ON DELETE CASCADE,
        FOREIGN KEY (judge_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (presenter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (period_id) REFERENCES score_periods(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    console.log('数据库表初始化成功')
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  } finally {
    connection.release()
  }
}

export default pool
