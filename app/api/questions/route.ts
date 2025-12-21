import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/store'

export async function GET() {
  try {
    const questions = await dataStore.getQuestions()
    return NextResponse.json({ success: true, data: questions })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const question = await dataStore.addQuestion(body)
    return NextResponse.json({ success: true, data: question })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, message: '缺少题目ID' }, { status: 400 })
    }
    
    await dataStore.deleteQuestion(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ success: false, message: '缺少题目ID' }, { status: 400 })
    }
    
    await dataStore.updateQuestion(id, updates)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
