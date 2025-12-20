import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/db'
import { dataStore } from '@/lib/store'

export async function GET() {
  try {
    // 初始化数据库表结构
    await initDatabase()
    
    // 初始化默认数据
    await dataStore.initializeDefaultData()
    
    return NextResponse.json({ 
      success: true, 
      message: '数据库初始化成功' 
    })
  } catch (error: any) {
    console.error('初始化失败:', error)
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 })
  }
}
