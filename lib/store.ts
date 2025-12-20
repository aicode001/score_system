import { User, ScoreQuestion, Score, ScorePeriod, ScoreResult } from '@/types'

class DataStore {
  private users: User[] = []
  private questions: ScoreQuestion[] = []
  private scores: Score[] = []
  private periods: ScorePeriod[] = []

  constructor() {
    this.initializeDefaultData()
  }

  private initializeDefaultData() {
    this.users = [
      { id: '1', name: '管理员', role: 'admin' },
      { id: '2', name: '评委张三', role: 'judge' },
      { id: '3', name: '评委李四', role: 'judge' },
      { id: '4', name: '述职人员王五', role: 'presenter' },
      { id: '5', name: '述职人员赵六', role: 'presenter' },
    ]

    this.questions = [
      { id: '1', title: '工作完成质量', minScore: 0, maxScore: 10, step: 0.1 },
      { id: '2', title: '团队协作能力', minScore: 0, maxScore: 10, step: 0.1 },
      { id: '3', title: '创新能力', minScore: 0, maxScore: 10, step: 0.1 },
    ]

    this.periods = [
      {
        id: '1',
        name: '2025年第一季度',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
        status: 'active',
      },
    ]
  }

  getUsers(): User[] {
    return [...this.users]
  }

  getUsersByRole(role: UserRole): User[] {
    return this.users.filter(u => u.role === role)
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
    }
    this.users.push(newUser)
    return newUser
  }

  deleteUser(id: string): void {
    this.users = this.users.filter(u => u.id !== id)
  }

  getQuestions(): ScoreQuestion[] {
    return [...this.questions]
  }

  addQuestion(question: Omit<ScoreQuestion, 'id'>): ScoreQuestion {
    const newQuestion: ScoreQuestion = {
      ...question,
      id: Date.now().toString(),
    }
    this.questions.push(newQuestion)
    return newQuestion
  }

  updateQuestion(id: string, question: Partial<ScoreQuestion>): void {
    const index = this.questions.findIndex(q => q.id === id)
    if (index !== -1) {
      this.questions[index] = { ...this.questions[index], ...question }
    }
  }

  deleteQuestion(id: string): void {
    this.questions = this.questions.filter(q => q.id !== id)
  }

  getPeriods(): ScorePeriod[] {
    return [...this.periods]
  }

  addPeriod(period: Omit<ScorePeriod, 'id'>): ScorePeriod {
    const newPeriod: ScorePeriod = {
      ...period,
      id: Date.now().toString(),
    }
    this.periods.push(newPeriod)
    return newPeriod
  }

  updatePeriod(id: string, period: Partial<ScorePeriod>): void {
    const index = this.periods.findIndex(p => p.id === id)
    if (index !== -1) {
      this.periods[index] = { ...this.periods[index], ...period }
    }
  }

  addScore(score: Omit<Score, 'id' | 'createdAt'>): Score {
    const existingIndex = this.scores.findIndex(
      s => s.questionId === score.questionId && 
           s.judgeId === score.judgeId && 
           s.presenterId === score.presenterId &&
           s.periodId === score.periodId
    )

    const newScore: Score = {
      ...score,
      id: existingIndex !== -1 ? this.scores[existingIndex].id : Date.now().toString(),
      createdAt: new Date(),
    }

    if (existingIndex !== -1) {
      this.scores[existingIndex] = newScore
    } else {
      this.scores.push(newScore)
    }

    return newScore
  }

  getScores(periodId: string): Score[] {
    return this.scores.filter(s => s.periodId === periodId)
  }

  calculateResults(periodId: string): ScoreResult[] {
    const periodScores = this.scores.filter(s => s.periodId === periodId)
    const presenters = this.getUsersByRole('presenter')
    const judges = this.getUsersByRole('judge')

    return presenters.map(presenter => {
      const presenterScores = periodScores.filter(s => s.presenterId === presenter.id)
      
      const scoresByQuestion = this.questions.map(question => {
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
}

export const dataStore = new DataStore()
