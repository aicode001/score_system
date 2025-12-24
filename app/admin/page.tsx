'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getUsers, addUser, updateUser, deleteUser, getQuestions, addQuestion, updateQuestion, deleteQuestion, getPeriods, addPeriod, getResults
    ,deletePeriod, getCategories, addCategory, updateCategory, deleteCategory } from '@/lib/client-store'
import { ArrowLeft, Plus, Trash2, Edit2, Users, ClipboardList, Calendar, BarChart, Download, FolderOpen } from 'lucide-react'
import { User, ScoreQuestion, ScorePeriod, ScoreCategory } from '@/types'

function AdminPageContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'categories' | 'questions' | 'periods' | 'results'>('users')
  
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<ScoreCategory[]>([])
  const [questions, setQuestions] = useState<ScoreQuestion[]>([])
  const [periods, setPeriods] = useState<ScorePeriod[]>([])
  const [results, setResults] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const [showUserModal, setShowUserModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showPeriodModal, setShowPeriodModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingCategory, setEditingCategory] = useState<ScoreCategory | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<ScoreQuestion | null>(null)

  const [newUser, setNewUser] = useState({ name: '', role: 'judge' as any, password: '123456' })
  const [newCategory, setNewCategory] = useState({ name: '', description: '', sortOrder: 0 })
  const [newQuestion, setNewQuestion] = useState({ title: '', description: '', categoryId: '', minScore: 0, maxScore: 10, step: 0.1 })
  const [newPeriod, setNewPeriod] = useState({ name: '', startDate: '', endDate: '', status: 'active' as any })

  useEffect(() => {
    async function loadUser() {
      if (userId) {
        const allUsers = await getUsers()
        const user = allUsers.find((u: any) => u.id === userId)
        setCurrentUser(user)
      }
    }
    loadUser()
    loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    const [allUsers, allCategories, allQuestions, allPeriods] = await Promise.all([
      getUsers(),
      getCategories(),
      getQuestions(),
      getPeriods()
    ])
    setUsers(allUsers)
    setCategories(allCategories)
    setQuestions(allQuestions)
    setPeriods(allPeriods)
    
    if (allPeriods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(allPeriods[0].id)
      const periodResults = await getResults(allPeriods[0].id)
      setResults(periodResults)
    }
    setLoading(false)
  }

  useEffect(() => {
    async function loadResults() {
      if (selectedPeriod) {
        const periodResults = await getResults(selectedPeriod)
        console.log("periodResults",periodResults)
        setResults(periodResults)
      }
    }
    loadResults()
  }, [selectedPeriod])

  const handleAddUser = async () => {
    if (editingUser) {
      // 编辑用户
      const updates: any = {
        name: newUser.name,
        role: newUser.role
      }
      // 只有当密码不为空时才更新密码
      if (newUser.password && newUser.password.trim() !== '') {
        updates.password = newUser.password
      }
      await updateUser(editingUser.id, updates)
      setEditingUser(null)
    } else {
      // 添加用户
      await addUser(newUser)
    }
    setNewUser({ name: '', role: 'judge', password: '123456' })
    setShowUserModal(false)
    loadData()
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setNewUser({ 
      name: user.name, 
      role: user.role,
      password: '' // 留空,表示不修改密码
    })
    setShowUserModal(true)
  }

  const handleDeleteUser = async (id: string) => {
    if (confirm('确定要删除此用户吗?')) {
      await deleteUser(id)
      loadData()
    }
  }

  const handleAddCategory = async () => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, newCategory)
      setEditingCategory(null)
    } else {
      await addCategory(newCategory)
    }
    setNewCategory({ name: '', description: '', sortOrder: 0 })
    setShowCategoryModal(false)
    loadData()
  }

  const handleEditCategory = (category: ScoreCategory) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder
    })
    setShowCategoryModal(true)
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm('确定要删除此类别吗？关联的题目将不再属于任何类别。')) {
      await deleteCategory(id)
      loadData()
    }
  }

  const handleAddQuestion = async () => {
    if (editingQuestion) {
      // 编辑题目
      await updateQuestion(editingQuestion.id, newQuestion)
      setEditingQuestion(null)
    } else {
      // 添加题目
      await addQuestion(newQuestion)
    }
    setNewQuestion({ title: '', description: '', categoryId: '', minScore: 0, maxScore: 10, step: 0.1 })
    setShowQuestionModal(false)
    loadData()
  }

  const handleEditQuestion = (question: ScoreQuestion) => {
    setEditingQuestion(question)
    setNewQuestion({
      title: question.title,
      description: question.description || '',
      categoryId: question.categoryId || '',
      minScore: question.minScore,
      maxScore: question.maxScore,
      step: question.step
    })
    setShowQuestionModal(true)
  }

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('确定要删除此题目吗?')) {
      await deleteQuestion(id)
      loadData()
    }
  }

  const handleAddPeriod = async () => {
    await addPeriod({
      ...newPeriod,
      startDate: new Date(newPeriod.startDate),
      endDate: new Date(newPeriod.endDate),
    })
    setNewPeriod({ name: '', startDate: '', endDate: '', status: 'active' })
    setShowPeriodModal(false)
    loadData()
  }

  const handleDeletePeriod = async (id: string) => {
    if (confirm('确定要删除此评分周期吗？所有关联的评分记录都将被删除！')) {
      await deletePeriod(id)
      loadData()
    }
  }

  const handleExportScores = () => {
    if (!selectedPeriod) {
      alert('请先选择评分周期')
      return
    }
    
    // 创建下载链接
    const url = `/api/export?periodId=${selectedPeriod}`
    const link = document.createElement('a')
    link.href = url
    link.download = '评分数据.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-800">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回首页
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">系统管理</h1>
            <p className="text-gray-600">管理员: {currentUser.name}</p>
          </div>

          <div className="flex space-x-2 mb-6 border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              用户管理
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <FolderOpen className="w-5 h-5 inline mr-2" />
              评分类别
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <ClipboardList className="w-5 h-5 inline mr-2" />
              题目管理
            </button>
            <button
              onClick={() => setActiveTab('periods')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'periods'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              周期管理
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'results'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <BarChart className="w-5 h-5 inline mr-2" />
              评分统计
            </button>
          </div>

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">用户列表</h2>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加用户
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">默认密码</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            user.role === 'judge' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'presenter' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {user.role === 'judge' ? '评委' : user.role === 'presenter' ? '述职人员' : '管理员'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">123456</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-800"
                              title="编辑用户"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-800"
                              title="删除用户"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">评分类别</h2>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加类别
                </button>
              </div>
              <div className="space-y-4">
                {categories.map((c, index) => (
                  <div key={c.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 mb-1">{index + 1}. {c.name}</h3>
                        {c.description && (
                          <p className="text-sm text-gray-500 mb-2 italic">{c.description}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          排序: {c.sortOrder}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(c)}
                          className="text-blue-600 hover:text-blue-800"
                          title="编辑类别"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="text-red-600 hover:text-red-800"
                          title="删除类别"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">评分题目</h2>
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加题目
                </button>
              </div>
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-800">{index + 1}. {q.title}</h3>
                          {q.categoryName && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {q.categoryName}
                            </span>
                          )}
                        </div>
                        {q.description && (
                          <p className="text-sm text-gray-500 mb-2 italic">{q.description}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          评分范围: {q.minScore} - {q.maxScore} 分 (步长: {q.step})
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="text-blue-600 hover:text-blue-800"
                          title="编辑题目"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-600 hover:text-red-800"
                          title="删除题目"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'periods' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">评分周期</h2>
                <button
                  onClick={() => setShowPeriodModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加周期
                </button>
              </div>
              <div className="space-y-4">
                {periods.map(p => (
                  <div key={p.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">{p.name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.status === 'active' ? '进行中' : '已结束'}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-end">
                       <button
                        onClick={() => handleDeletePeriod(p.id)}
                        className="text-red-600 hover:text-red-800"
                        title="删除周期"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              <div className="mb-6 flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择评分周期</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {periods.map(period => (
                      <option key={period.id} value={period.id}>
                        {period.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleExportScores}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
                  title="导出评分数据"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出数据
                </button>
              </div>

              <div className="space-y-6">
                {results.map(result => (
                  <div key={result.presenterId} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">{result.presenterName}</h3>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">总平均分</div>
                        <div className="text-3xl font-bold text-purple-600">{result.totalAverage}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {result.categories.map((category: any) => (
                        <div key={category.categoryId || 'uncategorized'} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-lg font-bold text-gray-700">{category.categoryName}</h4>
                            <span className="text-2xl font-bold text-blue-600">{category.categoryTotal}</span>
                          </div>
                          
                          <div className="space-y-3">
                            {category.scores.map((scoreItem: any) => (
                              <div key={scoreItem.questionId} className="bg-white p-4 rounded">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-gray-700">{scoreItem.questionTitle}</span>
                                  <span className="text-xl font-bold text-gray-900">{scoreItem.averageScore}</span>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                  {scoreItem.judgeScores.map((js: any) => (
                                    <div key={js.judgeId} className="flex justify-between">
                                      <span>{js.judgeName}:</span>
                                      <span>{js.score > 0 ? js.score.toFixed(1) : '未评分'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? '编辑用户' : '添加用户'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="judge">评委</option>
                  <option value="presenter">述职人员</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码 {editingUser && <span className="text-xs text-gray-500">(留空则不修改)</span>}
                </label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder={editingUser ? "留空保持原密码" : "默认密码: 123456"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {editingUser ? '修改密码后用户需使用新密码登录' : '用户可以使用此密码登录'}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false)
                  setEditingUser(null)
                  setNewUser({ name: '', role: 'judge', password: '123456' })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingUser ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingCategory ? '编辑评分类别' : '添加评分类别'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类别名称</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="请输入类别名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  类别描述 <span className="text-xs text-gray-500">(选填)</span>
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="评委可以看到此描述（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input
                  type="number"
                  value={newCategory.sortOrder}
                  onChange={(e) => setNewCategory({ ...newCategory, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="数字越小越靠前"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setEditingCategory(null)
                  setNewCategory({ name: '', description: '', sortOrder: 0 })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingCategory ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingQuestion ? '编辑评分题目' : '添加评分题目'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">题目名称</label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="请输入题目名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  具体描述 <span className="text-xs text-gray-500">(选填)</span>
                </label>
                <textarea
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="评委可以看到此描述（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  评分类别 <span className="text-xs text-gray-500">(选填)</span>
                </label>
                <select
                  value={newQuestion.categoryId}
                  onChange={(e) => setNewQuestion({ ...newQuestion, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">无类别</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最小分</label>
                  <input
                    type="number"
                    value={newQuestion.minScore}
                    onChange={(e) => setNewQuestion({ ...newQuestion, minScore: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最大分</label>
                  <input
                    type="number"
                    value={newQuestion.maxScore}
                    onChange={(e) => setNewQuestion({ ...newQuestion, maxScore: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">步长</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newQuestion.step}
                    onChange={(e) => setNewQuestion({ ...newQuestion, step: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowQuestionModal(false)
                  setEditingQuestion(null)
                  setNewQuestion({ title: '', description: '', categoryId: '', minScore: 0, maxScore: 10, step: 0.1 })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingQuestion ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">添加评分周期</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">周期名称</label>
                <input
                  type="text"
                  value={newPeriod.name}
                  onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                <input
                  type="date"
                  value={newPeriod.startDate}
                  onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                <input
                  type="date"
                  value={newPeriod.endDate}
                  onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPeriodModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddPeriod}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <AdminPageContent />
    </Suspense>
  )
}
