import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/store'

export async function GET() {
  try {
    const periods = await dataStore.getPeriods()
    return NextResponse.json({ success: true, data: periods })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const period = await dataStore.addPeriod({
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate)
    })
    return NextResponse.json({ success: true, data: period })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
