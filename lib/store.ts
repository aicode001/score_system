import { User, ScoreQuestion, Score, ScorePeriod, ScoreResult, UserRole } from '@/types'
import pool from './db'
import { v4 as uuidv4 } from 'uuid'

class DataStore {
  // 用户管理
  async getUsers(): Promise<User[]> {
    const [rows]: any = await pool.query('SELECT id, name, role, created_at FROM users ORDER BY created_at DESC')
    return rows as User[]
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const [rows]: any = await pool.query('SELECT id, name, role, created_at FROM users WHERE role = ? ORDER BY created_at DESC', [role])
    return rows as User[]
  }

  async getUserById(id: string): Promise<User | null> {
    const [rows]: any = await pool.query('SELECT id, name, role, created_at FROM users WHERE id = ?', [id])
    return rows.length > 0 ? rows[0] : null
  }

  async verifyUser(name: string, password: string, role: UserRole): Promise<User | null> {
    const [rows]: any = await pool.query(
      'SELECT id, name, role FROM users WHERE name = ? AND password = ? AND role = ?',
      [name, password, role]
    )
    return rows.length > 0 ? rows[0] : null
  }

  async addUser(user: Omit<User, 'id'> & { password?: string }): Promise<User> {
    const id = uuidv4()
    const password = user.password || '123456'
    await pool.query(
      'INSERT INTO users (id, name, role, password) VALUES (?, ?, ?, ?)',
      [id, user.name, user.role, password]
    )
    return { id, name: user.name, role: user.role }
  }

  async updateUser(id: string, updates: { name?: string; role?: string; password?: string }): Promise<void> {
    const updateFields: string[] = []
    const values: any[] = []

    if (updates.name) {
      updateFields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.role) {
      updateFields.push('role = ?')
      values.push(updates.role)
    }
    if (updates.password) {
      updateFields.push('password = ?')
      values.push(updates.password)
    }

    if (updateFields.length > 0) {
      values.push(id)
      await pool.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      )
    }
  }

  async updateUserPassword(id: string, newPassword: string): Promise<void> {
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id])
  }

  async deleteUser(id: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE id = ?', [id])
  }

  // 题目管理
  async getQuestions(): Promise<ScoreQuestion[]> {
    const [rows]: any = await pool.query('SELECT * FROM score_questions ORDER BY created_at')
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      minScore: parseFloat(row.min_score),
      maxScore: parseFloat(row.max_score),
      step: parseFloat(row.step)
    }))
  }

  async addQuestion(question: Omit<ScoreQuestion, 'id'>): Promise<ScoreQuestion> {
    const id = uuidv4()
    await pool.query(
      'INSERT INTO score_questions (id, title, min_score, max_score, step) VALUES (?, ?, ?, ?, ?)',
      [id, question.title, question.minScore, question.maxScore, question.step]
    )
    return { id, ...question }
  }

  async updateQuestion(id: string, question: Partial<ScoreQuestion>): Promise<void> {
    const updates: string[] = []
    const values: any[] = []

    if (question.title) {
      updates.push('title = ?')
      values.push(question.title)
    }
    if (question.minScore !== undefined) {
      updates.push('min_score = ?')
      values.push(question.minScore)
    }
    if (question.maxScore !== undefined) {
      updates.push('max_score = ?')
      values.push(question.maxScore)
    }
    if (question.step !== undefined) {
      updates.push('step = ?')
      values.push(question.step)
    }

    if (updates.length > 0) {
      values.push(id)
      await pool.query(
        `UPDATE score_questions SET ${updates.join(', ')} WHERE id = ?`,
        values
      )
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    await pool.query('DELETE FROM score_questions WHERE id = ?', [id])
  }

  // 周期管理
  async getPeriods(): Promise<ScorePeriod[]> {
    const [rows]: any = await pool.query('SELECT * FROM score_periods ORDER BY start_date DESC')
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      status: row.status
    }))
  }

  async addPeriod(period: Omit<ScorePeriod, 'id'>): Promise<ScorePeriod> {
    const id = uuidv4()
    await pool.query(
      'INSERT INTO score_periods (id, name, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
      [id, period.name, period.startDate, period.endDate, period.status]
    )
    return { id, ...period }
  }

  async updatePeriod(id: string, period: Partial<ScorePeriod>): Promise<void> {
    const updates: string[] = []
    const values: any[] = []

    if (period.name) {
      updates.push('name = ?')
      values.push(period.name)
    }
    if (period.startDate) {
      updates.push('start_date = ?')
      values.push(period.startDate)
    }
    if (period.endDate) {
      updates.push('end_date = ?')
      values.push(period.endDate)
    }
    if (period.status) {
      updates.push('status = ?')
      values.push(period.status)
    }

    if (updates.length > 0) {
      values.push(id)
      await pool.query(
        `UPDATE score_periods SET ${updates.join(', ')} WHERE id = ?`,
        values
      )
    }
  }

  // 评分管理
  async addScore(score: Omit<Score, 'id' | 'createdAt'>): Promise<Score> {
    const id = uuidv4()
    await pool.query(
      `INSERT INTO scores (id, question_id, judge_id, presenter_id, period_id, value)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE value = ?, updated_at = CURRENT_TIMESTAMP`,
      [id, score.questionId, score.judgeId, score.presenterId, score.periodId, score.value, score.value]
    )
    return { id, ...score, createdAt: new Date() }
  }

  async getScores(periodId: string): Promise<Score[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM scores WHERE period_id = ?',
      [periodId]
    )
    return rows.map((row: any) => ({
      id: row.id,
      questionId: row.question_id,
      judgeId: row.judge_id,
      presenterId: row.presenter_id,
      periodId: row.period_id,
      value: parseFloat(row.value),
      createdAt: new Date(row.created_at)
    }))
  }

  async calculateResults(periodId: string): Promise<ScoreResult[]> {
    const scores = await this.getScores(periodId)
    const presenters = await this.getUsersByRole('presenter')
    const judges = await this.getUsersByRole('judge')
    const questions = await this.getQuestions()

    return presenters.map(presenter => {
      const presenterScores = scores.filter(s => s.presenterId === presenter.id)
      
      const scoresByQuestion = questions.map(question => {
        const questionScores = presenterScores.filter(s => s.questionId === question.id)
        
        const judgeScores = judges.map(judge => {
          const judgeScore = questionScores.find(s => s.judgeId === judge.id)
          return {
            judgeId: judge.id,
            judgeName: judge.name,
            score: judgeScore?.value || 0,
          }
        })

        const validScores = judgeScores.filter(js => js.score > 0)
        const averageScore = validScores.length > 0
          ? validScores.reduce((sum, js) => sum + js.score, 0) / validScores.length
          : 0

        return {
          questionId: question.id,
          questionTitle: question.title,
          averageScore: parseFloat(averageScore.toFixed(1)),
          judgeScores,
        }
      })

      const totalAverage = scoresByQuestion.length > 0
        ? scoresByQuestion.reduce((sum, sq) => sum + sq.averageScore, 0) / scoresByQuestion.length
        : 0

      return {
        presenterId: presenter.id,
        presenterName: presenter.name,
        scores: scoresByQuestion,
        totalAverage: parseFloat(totalAverage.toFixed(1)),
      }
    })
  }

  // 初始化默认数据
  async initializeDefaultData(): Promise<void> {
    const users = await this.getUsers()
    if (users.length === 0) {
      // 添加默认用户(默认密码都是 123456)
      await this.addUser({ name: '管理员', role: 'admin', password: '123456' })
      await this.addUser({ name: '评委张三', role: 'judge', password: '123456' })
      await this.addUser({ name: '评委李四', role: 'judge', password: '123456' })
      await this.addUser({ name: '述职人员王五', role: 'presenter', password: '123456' })
      await this.addUser({ name: '述职人员赵六', role: 'presenter', password: '123456' })
    }

    const questions = await this.getQuestions()
    if (questions.length === 0) {
      // 添加默认题目
      await this.addQuestion({ title: '工作完成质量', minScore: 0, maxScore: 10, step: 0.1 })
      await this.addQuestion({ title: '团队协作能力', minScore: 0, maxScore: 10, step: 0.1 })
      await this.addQuestion({ title: '创新能力', minScore: 0, maxScore: 10, step: 0.1 })
    }

    const periods = await this.getPeriods()
    if (periods.length === 0) {
      // 添加默认周期
      await this.addPeriod({
        name: '2025年第一季度',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
        status: 'active',
      })
    }
  }
}

export const dataStore = new DataStore()
