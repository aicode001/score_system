import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const categoryId = searchParams.get('categoryId')
    
    let users
    if (role && categoryId) {
      users = await dataStore.getUsersByRoleAndCategory(role as any, categoryId)
    } else if (role) {
      users = await dataStore.getUsersByRole(role as any)
    } else {
      users = await dataStore.getUsers()
    }
    
    return NextResponse.json({ success: true, data: users })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user = await dataStore.addUser(body)
    return NextResponse.json({ success: true, data: user })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, role, password, categoryId } = body
    
    if (!id) {
      return NextResponse.json({ success: false, message: '缺少用户ID' }, { status: 400 })
    }
    
    await dataStore.updateUser(id, { name, role, password, categoryId })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, message: '缺少用户ID' }, { status: 400 })
    }
    
    await dataStore.deleteUser(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

