'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { dataStore } from '@/lib/store'
import { ArrowLeft, Award } from 'lucide-react'

function PresenterPageContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [periods, setPeriods] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    if (userId) {
      const users = dataStore.getUsers()
      const user = users.find(u => u.id === userId)
      setCurrentUser(user)
    }
    
    const allPeriods = dataStore.getPeriods()
    setPeriods(allPeriods)
    if (allPeriods.length > 0) {
      setSelectedPeriod(allPeriods[0].id)
    }
  }, [userId])

  useEffect(() => {
    if (selectedPeriod && userId) {
      const allResults = dataStore.calculateResults(selectedPeriod)
      const myResult = allResults.find(r => r.presenterId === userId)
      setResults(myResult)
    }
  }, [selectedPeriod, userId])

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-800">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回首页
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">我的评分</h1>
            <p className="text-gray-600">述职人员: {currentUser.name}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择评分周期</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
          </div>

          {results && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg text-center">
                <Award className="w-12 h-12 mx-auto mb-3" />
                <h2 className="text-2xl font-bold mb-1">总平均分</h2>
                <div className="text-5xl font-bold">{results.totalAverage}</div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">各项评分详情</h3>
                {results.scores.map((scoreItem: any) => (
                  <div key={scoreItem.questionId} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-800">{scoreItem.questionTitle}</h4>
                      <span className="text-2xl font-bold text-green-600">{scoreItem.averageScore}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">评委评分:</p>
                      {scoreItem.judgeScores.map((js: any) => (
                        <div key={js.judgeId} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                          <span className="text-gray-700">{js.judgeName}</span>
                          <span className="font-medium text-gray-900">{js.score > 0 ? js.score.toFixed(1) : '未评分'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!results && (
            <div className="text-center py-12 text-gray-500">
              暂无评分数据
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PresenterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <PresenterPageContent />
    </Suspense>
  )
}
