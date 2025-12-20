import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodId = searchParams.get('periodId')
    
    if (!periodId) {
      return NextResponse.json({ success: false, message: '缺少周期ID' }, { status: 400 })
    }
    
    const results = await dataStore.calculateResults(periodId)
    return NextResponse.json({ success: true, data: results })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
