'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { getUsers, login } from '@/lib/client-store'
import { Users, ClipboardList, Settings, Lock } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'judge' | 'presenter' | 'admin'>('judge')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [password, setPassword] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      const data = await getUsers(selectedRole)
      setUsers(data)
      setLoading(false)
    }
    fetchUsers()
    setSelectedUser(null)
    setPassword('')
    setLoginError('')
  }, [selectedRole])

  const handleLogin = async () => {
    if (!selectedUser) {
      setLoginError('请选择用户')
      return
    }
    if (!password) {
      setLoginError('请输入密码')
      return
    }

    setIsLoggingIn(true)
    setLoginError('')

    const result = await login(selectedUser.name, password, selectedRole)
    
    setIsLoggingIn(false)

    if (result.success) {
      // 登录成功,跳转到对应页面
      router.push(`/${selectedRole}?userId=${result.data.id}`)
    } else {
      setLoginError(result.message || '登录失败')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">述职评分系统</h1>
          <p className="text-gray-600">请选择您的角色和身份</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">选择角色</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setSelectedRole('judge')
                  setSelectedUser(null)
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRole === 'judge'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="font-medium">评委端</div>
              </button>
             {
                1==2 && (
                <button
                onClick={() => {
                  setSelectedRole('presenter')
                  setSelectedUser(null)
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRole === 'presenter'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <ClipboardList className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="font-medium">述职人员</div>
              </button>
                )
             }  
              <button
                onClick={() => {
                  setSelectedRole('admin')
                  setSelectedUser(null)
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRole === 'admin'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <Settings className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="font-medium">管理员</div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">选择用户</label>
            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无用户,请先访问 <a href="/api/init" className="text-blue-600 underline">/api/init</a> 初始化数据
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user)
                      setPassword('')
                      setLoginError('')
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedUser?.id === user.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">{user.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="请输入密码 (默认: 123456)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {loginError && (
                <p className="mt-2 text-sm text-red-600">{loginError}</p>
              )}
            </div>
          )}

          {selectedUser && (
            <div className="mt-6">
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={`block w-full font-medium py-3 px-6 rounded-lg text-center transition-colors ${
                  isLoggingIn
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoggingIn ? '登录中...' : '进入系统'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
