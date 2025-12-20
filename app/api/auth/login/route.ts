import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, password, role } = body
    
    if (!name || !password || !role) {
      return NextResponse.json({ 
        success: false, 
        message: '请填写完整信息' 
      }, { status: 400 })
    }
    
    const user = await dataStore.verifyUser(name, password, role)
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: '用户名或密码错误' 
      }, { status: 401 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: user 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 })
  }
}
