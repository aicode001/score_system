'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getUsers, getPeriods, getQuestions, getScores, addScore } from '@/lib/client-store'
import ScoreSlider from '@/components/ScoreSlider'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'

function JudgePageContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [periods, setPeriods] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [presenters, setPresenters] = useState<any[]>([])
  const [selectedPresenter, setSelectedPresenter] = useState<string>('')
  const [questions, setQuestions] = useState<any[]>([])
  const [scores, setScores] = useState<{ [key: string]: number }>({})
  const [savedStatus, setSavedStatus] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      if (userId) {
        const users = await getUsers()
        const user = users.find((u: any) => u.id === userId)
        setCurrentUser(user)
      }
      
      const allPeriods = await getPeriods()
      setPeriods(allPeriods)
      if (allPeriods.length > 0) {
        setSelectedPeriod(allPeriods[0].id)
      }

      const allPresenters = await getUsers('presenter')
      setPresenters(allPresenters)
      if (allPresenters.length > 0) {
        setSelectedPresenter(allPresenters[0].id)
      }

      const allQuestions = await getQuestions()
      setQuestions(allQuestions)

      const initialScores: { [key: string]: number } = {}
      allQuestions.forEach((q: any) => {
        initialScores[q.id] = q.minScore
      })
      setScores(initialScores)
      setLoading(false)
    }
    loadData()
  }, [userId])

  useEffect(() => {
    async function loadScores() {
      if (selectedPeriod && selectedPresenter && userId && questions.length > 0) {
        const existingScores = await getScores(selectedPeriod)
        const newScores: { [key: string]: number } = {}
        const saved: { [key: string]: boolean } = {}
        
        questions.forEach((q: any) => {
          const existingScore = existingScores.find(
            (s: any) => s.questionId === q.id && 
                 s.judgeId === userId && 
                 s.presenterId === selectedPresenter
          )
          newScores[q.id] = existingScore?.value || q.minScore
          saved[q.id] = !!existingScore
        })
        
        setScores(newScores)
        setSavedStatus(saved)
      }
    }
    loadScores()
  }, [selectedPeriod, selectedPresenter, userId, questions])

  const handleScoreChange = (questionId: string, value: number) => {
    setScores(prev => ({ ...prev, [questionId]: value }))
    setSavedStatus(prev => ({ ...prev, [questionId]: false }))
  }

  const handleSaveScore = async (questionId: string) => {
    if (!userId || !selectedPeriod || !selectedPresenter) return

    await addScore({
      questionId,
      judgeId: userId,
      presenterId: selectedPresenter,
      periodId: selectedPeriod,
      value: scores[questionId],
    })

    setSavedStatus(prev => ({ ...prev, [questionId]: true }))
    
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [questionId]: false }))
    }, 2000)
  }

  const handleSaveAll = () => {
    questions.forEach(q => {
      handleSaveScore(q.id)
    })
  }

  if (loading || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回首页
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">评委打分</h1>
            <p className="text-gray-600">当前评委: {currentUser.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择评分周期</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {periods.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择述职人员</label>
              <select
                value={selectedPresenter}
                onChange={(e) => setSelectedPresenter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {presenters.map(presenter => (
                  <option key={presenter.id} value={presenter.id}>
                    {presenter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-gray-50 p-6 rounded-lg">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-1">
                    {index + 1}. {question.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    评分范围: {question.minScore} - {question.maxScore} 分
                  </p>
                </div>
                
                <ScoreSlider
                  min={question.minScore}
                  max={question.maxScore}
                  step={question.step}
                  value={scores[question.id] || question.minScore}
                  onChange={(value) => handleScoreChange(question.id, value)}
                  label="当前分数"
                />

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleSaveScore(question.id)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                      savedStatus[question.id]
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {savedStatus[question.id] ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        已保存
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSaveAll}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              保存所有评分
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JudgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <JudgePageContent />
    </Suspense>
  )
}
