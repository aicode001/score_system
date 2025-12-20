export type UserRole = 'judge' | 'presenter' | 'admin'

export interface User {
  id: string
  name: string
  role: UserRole
  password?: string  // 可选,客户端获取时不包含密码
}

export interface ScoreQuestion {
  id: string
  title: string
  minScore: number
  maxScore: number
  step: number
}

export interface Score {
  id: string
  questionId: string
  judgeId: string
  presenterId: string
  periodId: string
  value: number
  createdAt: Date
}

export interface ScorePeriod {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: 'active' | 'closed'
}

export interface ScoreResult {
  presenterId: string
  presenterName: string
  scores: {
    questionId: string
    questionTitle: string
    averageScore: number
    judgeScores: {
      judgeId: string
      judgeName: string
      score: number
    }[]
  }[]
  totalAverage: number
}
