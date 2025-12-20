import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '评分系统',
  description: '述职评分管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
