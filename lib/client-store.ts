// 客户端数据获取函数 - 通过API与后端通信

// 登录验证
export async function login(name: string, password: string, role: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, role })
  })
  const data = await res.json()
  return data
}

export async function getUsers(role?: string, categoryId?: string) {
  let url = '/api/users'
  const params = new URLSearchParams()
  if (role) params.append('role', role)
  if (categoryId) params.append('categoryId', categoryId)
  if (params.toString()) url += `?${params.toString()}`
  
  const res = await fetch(url)
  const data = await res.json()
  return data.success ? data.data : []
}

export async function addUser(user: any) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  })
  const data = await res.json()
  return data
}

export async function updateUser(id: string, updates: any) {
  const res = await fetch('/api/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  })
  const data = await res.json()
  return data
}

export async function deleteUser(id: string) {
  const res = await fetch(`/api/users?id=${id}`, {
    method: 'DELETE'
  })
  const data = await res.json()
  return data
}

export async function getQuestions(categoryId?: string) {
  const url = categoryId ? `/api/questions?categoryId=${categoryId}` : '/api/questions'
  const res = await fetch(url)
  const data = await res.json()
  return data.success ? data.data : []
}

export async function addQuestion(question: any) {
  const res = await fetch('/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(question)
  })
  const data = await res.json()
  return data
}

export async function deleteQuestion(id: string) {
  const res = await fetch(`/api/questions?id=${id}`, {
    method: 'DELETE'
  })
  const data = await res.json()
  return data
}

export async function updateQuestion(id: string, updates: any) {
  const res = await fetch('/api/questions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  })
  const data = await res.json()
  return data
}

export async function getPeriods() {
  const res = await fetch('/api/periods')
  const data = await res.json()
  return data.success ? data.data : []
}

export async function addPeriod(period: any) {
  const res = await fetch('/api/periods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(period)
  })
  const data = await res.json()
  return data
}

export async function getScores(periodId: string) {
  const res = await fetch(`/api/scores?periodId=${periodId}`)
  const data = await res.json()
  return data.success ? data.data : []
}

export async function addScore(score: any) {
  const res = await fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(score)
  })
  const data = await res.json()
  return data
}

export async function getResults(periodId: string) {
  const res = await fetch(`/api/results?periodId=${periodId}`)
  const data = await res.json()
  return data.success ? data.data : []
}

export async function initDatabase() {
  const res = await fetch('/api/init')
  const data = await res.json()
  return data
}
export async function deletePeriod(id: string) {
  const res = await fetch(`/api/periods?id=${id}`, {
    method: 'DELETE'
  })
  const data = await res.json()
  return data
}

// 类别管理
export async function getCategories() {
  const res = await fetch('/api/categories')
  const data = await res.json()
  return data.success ? data.data : []
}

export async function addCategory(category: any) {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  })
  const data = await res.json()
  return data
}

export async function updateCategory(id: string, updates: any) {
  const res = await fetch('/api/categories', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  })
  const data = await res.json()
  return data
}

export async function deleteCategory(id: string) {
  const res = await fetch(`/api/categories?id=${id}`, {
    method: 'DELETE'
  })
  const data = await res.json()
  return data
}