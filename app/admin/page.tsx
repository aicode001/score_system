'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { dataStore } from '@/lib/store'
import { ArrowLeft, Plus, Trash2, Edit2, Users, ClipboardList, Calendar, BarChart } from 'lucide-react'
import { User, ScoreQuestion, ScorePeriod } from '@/types'

function AdminPageContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'periods' | 'results'>('users')
  
  const [users, setUsers] = useState<User[]>([])
  const [questions, setQuestions] = useState<ScoreQuestion[]>([])
  const [periods, setPeriods] = useState<ScorePeriod[]>([])
  const [results, setResults] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')

  const [showUserModal, setShowUserModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showPeriodModal, setShowPeriodModal] = useState(false)

  const [newUser, setNewUser] = useState({ name: '', role: 'judge' as any })
  const [newQuestion, setNewQuestion] = useState({ title: '', minScore: 0, maxScore: 10, step: 0.1 })
  const [newPeriod, setNewPeriod] = useState({ name: '', startDate: '', endDate: '', status: 'active' as any })

  useEffect(() => {
    if (userId) {
      const allUsers = dataStore.getUsers()
      const user = allUsers.find(u => u.id === userId)
      setCurrentUser(user)
    }
    loadData()
  }, [userId])

  const loadData = () => {
    setUsers(dataStore.getUsers())
    setQuestions(dataStore.getQuestions())
    const allPeriods = dataStore.getPeriods()
    setPeriods(allPeriods)
    if (allPeriods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(allPeriods[0].id)
      setResults(dataStore.calculateResults(allPeriods[0].id))
    }
  }

  useEffect(() => {
    if (selectedPeriod && activeTab === 'results') {
      setResults(dataStore.calculateResults(selectedPeriod))
    }
  }, [selectedPeriod, activeTab])

  const handleAddUser = () => {
    dataStore.addUser(newUser)
    setNewUser({ name: '', role: 'judge' })
    setShowUserModal(false)
    loadData()
  }

  const handleDeleteUser = (id: string) => {
    if (confirm('确定要删除此用户吗?')) {
      dataStore.deleteUser(id)
      loadData()
    }
  }

  const handleAddQuestion = () => {
    dataStore.addQuestion(newQuestion)
    setNewQuestion({ title: '', minScore: 0, maxScore: 10, step: 0.1 })
    setShowQuestionModal(false)
    loadData()
  }

  const handleDeleteQuestion = (id: string) => {
    if (confirm('确定要删除此题目吗?')) {
      dataStore.deleteQuestion(id)
      loadData()
    }
  }

  const handleAddPeriod = () => {
    dataStore.addPeriod({
      ...newPeriod,
      startDate: new Date(newPeriod.startDate),
      endDate: new Date(newPeriod.endDate),
    })
    setNewPeriod({ name: '', startDate: '', endDate: '', status: 'active' })
    setShowPeriodModal(false)
    loadData()
  }

  if (!currentUser) {
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

          <div className="flex space-x-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              用户管理
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 font-medium transition-colors ${
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
              className={`px-6 py-3 font-medium transition-colors ${
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
              className={`px-6 py-3 font-medium transition-colors ${
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
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <div key={q.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">{index + 1}. {q.title}</h3>
                      <p className="text-sm text-gray-600">
                        评分范围: {q.minScore} - {q.maxScore} 分 (步长: {q.step})
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                          {p.startDate.toLocaleDateString()} - {p.endDate.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.status === 'active' ? '进行中' : '已结束'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              <div className="mb-6">
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

              <div className="space-y-6">
                {results.map(result => (
                  <div key={result.presenterId} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{result.presenterName}</h3>
                      <div className="text-3xl font-bold text-purple-600">{result.totalAverage}</div>
                    </div>
                    
                    <div className="space-y-3">
                      {result.scores.map((scoreItem: any) => (
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
          )}
        </div>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">添加用户</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="judge">评委</option>
                  <option value="presenter">述职人员</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">添加评分题目</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">题目名称</label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
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
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                确定
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
