export type UserRole = 'judge' | 'presenter' | 'admin'

export interface User {
  id: string
  name: string
  role: UserRole
  categoryId?: string  // 评分类别ID（仅述职人员使用）
  categoryName?: string  // 评分类别名称（仅述职人员使用）
  password?: string  // 可选,客户端获取时不包含密码
}

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
  categoryId?: string
  categoryName?: string
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
  categories: {
    categoryId: string | null
    categoryName: string
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
    categoryTotal: number
  }[]
  totalAverage: number
}
