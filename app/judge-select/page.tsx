'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCategories, getUsers } from '@/lib/client-store'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { ScoreCategory } from '@/types'

function JudgeSelectContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('userId')
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [categories, setCategories] = useState<ScoreCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      if (userId) {
        const users = await getUsers()
        const user = users.find((u: any) => u.id === userId)
        setCurrentUser(user)
      }
      
      const allCategories = await getCategories()
      setCategories(allCategories)
      setLoading(false)
    }
    loadData()
  }, [userId])

  const handleSelectCategory = (categoryId: string) => {
    router.push(`/judge?userId=${userId}&categoryId=${categoryId}`)
  }

  if (loading || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回首页
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">选择评分类别</h1>
            <p className="text-gray-600 mb-4">当前评委: {currentUser.name}</p>
            <p className="text-gray-500">暂无评分类别，请联系管理员添加</p>
          </div>
        </div>
      </div>
    )
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
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">选择评分类别</h1>
            <p className="text-gray-600">当前评委: {currentUser.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleSelectCategory(category.id)}
                className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-start">
                  <ClipboardList className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JudgeSelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <JudgeSelectContent />
    </Suspense>
  )
}
