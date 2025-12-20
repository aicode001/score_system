import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodId = searchParams.get('periodId')
    
    if (!periodId) {
      return NextResponse.json({ success: false, message: '缺少周期ID' }, { status: 400 })
    }
    
    const scores = await dataStore.getScores(periodId)
    return NextResponse.json({ success: true, data: scores })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const score = await dataStore.addScore(body)
    return NextResponse.json({ success: true, data: score })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
