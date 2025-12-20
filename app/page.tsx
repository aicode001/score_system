'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { User } from '@/types'
import { dataStore } from '@/lib/store'
import { Users, ClipboardList, Settings } from 'lucide-react'

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<'judge' | 'presenter' | 'admin'>('judge')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const users = dataStore.getUsersByRole(selectedRole)

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
            <div className="grid grid-cols-2 gap-3">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
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
          </div>

          {selectedUser && (
            <div className="mt-6">
              <Link
                href={`/${selectedRole}?userId=${selectedUser.id}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
              >
                进入系统
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
