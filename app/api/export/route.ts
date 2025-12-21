export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/store'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const periodId = searchParams.get('periodId')

    if (!periodId) {
      return NextResponse.json(
        { success: false, message: '缺少评分周期ID' },
        { status: 400 }
      )
    }

    // 获取数据
    const results = await dataStore.calculateResults(periodId)
    const questions = await dataStore.getQuestions()
    const periods = await dataStore.getPeriods()
    const judges = await dataStore.getUsersByRole('judge')
    const period = periods.find(p => p.id === periodId)

    if (!period) {
      return NextResponse.json(
        { success: false, message: '找不到该评分周期' },
        { status: 404 }
      )
    }

    // 生成CSV内容
    let csv = '\uFEFF' // UTF-8 BOM for Excel compatibility
    
    // 标题行
    csv += `评分周期,${period.name}\n`
    csv += `时间范围,${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}\n`
    csv += `导出时间,${new Date().toLocaleString()}\n\n`

    // 按评委分组导出
    judges.forEach((judge, judgeIndex) => {
      if (judgeIndex > 0) csv += '\n' // 评委之间空一行
      
      csv += `评委,${judge.name}\n`
      
      // 表头
      csv += '述职人员,'
      questions.forEach(q => {
        csv += `${q.title},`
      })
      csv += '总分\n'
      
      // 每个述职人员的数据
      results.forEach(result => {
        csv += `${result.presenterName},`
        
        let totalScore = 0
        let scoreCount = 0
        
        // 该评委对每个问题的评分
        result.scores.forEach(scoreItem => {
          const judgeScore = scoreItem.judgeScores.find(js => js.judgeId === judge.id)
          if (judgeScore && judgeScore.score > 0) {
            csv += `${judgeScore.score.toFixed(1)},`
            totalScore += judgeScore.score
            scoreCount++
          } else {
            csv += '未评分,'
          }
        })
        
        // 该评委给该述职人员的总分（总和，不是平均）
        const judgeTotal = scoreCount > 0 ? totalScore.toFixed(1) : '未评分'
        csv += `${judgeTotal}\n`
      })
    })

    // 返回CSV文件
    const filename = `评分数据_${period.name}_${new Date().getTime()}.csv`
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    console.error('导出失败:', error)
    return NextResponse.json(
      { success: false, message: '导出失败' },
      { status: 500 }
    )
  }
}
