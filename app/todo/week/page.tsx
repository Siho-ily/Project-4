"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeft, Calendar, TrendingUp, Target } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getTodos } from "@/lib/storage"
import type { Todo } from "@/types/todo"

interface WeeklyStats {
  totalTodos: number
  completedTasks: number
  totalTasks: number
  completionRate: number
  dailyStats: { [key: string]: { todos: number; completed: number; total: number } }
}

export default function WeeklyReportPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string>("")

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const userTodos = getTodos(user.id)
    setTodos(userTodos)

    // 현재 주의 시작일 계산
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // 일요일을 주의 시작으로
    setSelectedWeek(startOfWeek.toISOString().split("T")[0])
  }, [user, router])

  useEffect(() => {
    if (!selectedWeek || todos.length === 0) return

    const weekStart = new Date(selectedWeek)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    // 해당 주의 TODO들 필터링
    const weekTodos = todos.filter((todo) => {
      const todoDate = new Date(todo.createdAt)
      return todoDate >= weekStart && todoDate <= weekEnd
    })

    // 일별 통계 계산
    const dailyStats: { [key: string]: { todos: number; completed: number; total: number } } = {}

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]

      const dayTodos = weekTodos.filter((todo) => new Date(todo.createdAt).toDateString() === date.toDateString())

      const totalTasks = dayTodos.reduce((sum, todo) => sum + todo.tasks.length, 0)
      const completedTasks = dayTodos.reduce((sum, todo) => sum + todo.tasks.filter((task) => task.completed).length, 0)

      dailyStats[dateStr] = {
        todos: dayTodos.length,
        completed: completedTasks,
        total: totalTasks,
      }
    }

    // 주간 통계 계산
    const totalTodos = weekTodos.length
    const totalTasks = weekTodos.reduce((sum, todo) => sum + todo.tasks.length, 0)
    const completedTasks = weekTodos.reduce((sum, todo) => sum + todo.tasks.filter((task) => task.completed).length, 0)
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    setWeeklyStats({
      totalTodos,
      completedTasks,
      totalTasks,
      completionRate,
      dailyStats,
    })
  }, [selectedWeek, todos])

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    return days[date.getDay()]
  }

  const getWeekRange = (startDate: string) => {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-800">주간 기록</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 주간 선택 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">주간 선택</h2>
                <p className="text-sm text-gray-600">{selectedWeek && getWeekRange(selectedWeek)}</p>
              </div>
              <input
                type="date"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>
          </CardContent>
        </Card>

        {weeklyStats && (
          <>
            {/* 주간 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{weeklyStats.totalTodos}</div>
                  <div className="text-sm text-gray-600">작성한 TODO</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">{weeklyStats.totalTasks}</div>
                  <div className="text-sm text-gray-600">전체 할일</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{weeklyStats.completedTasks}</div>
                  <div className="text-sm text-gray-600">완료한 할일</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">{Math.round(weeklyStats.completionRate)}%</div>
                  <div className="text-sm text-gray-600">완료율</div>
                </CardContent>
              </Card>
            </div>

            {/* 일별 상세 */}
            <Card>
              <CardHeader>
                <CardTitle>일별 상세 기록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(weeklyStats.dailyStats).map(([date, stats]) => {
                    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

                    return (
                      <div key={date} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold">{getDayName(date)}</div>
                            <div className="text-sm text-gray-500">{new Date(date).getDate()}일</div>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span>TODO {stats.todos}개</span>
                            <span>할일 {stats.total}개</span>
                            <span className="text-green-600">완료 {stats.completed}개</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{Math.round(completionRate)}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 주간 분석 */}
            <Card>
              <CardHeader>
                <CardTitle>주간 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">📊 이번 주 성과</h4>
                    <p className="text-blue-700">
                      총 {weeklyStats.totalTodos}개의 TODO를 작성하고,
                      {weeklyStats.totalTasks}개의 할일 중 {weeklyStats.completedTasks}개를 완료했습니다. 완료율은{" "}
                      {Math.round(weeklyStats.completionRate)}%입니다.
                    </p>
                  </div>

                  {weeklyStats.completionRate >= 80 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">🎉 훌륭해요!</h4>
                      <p className="text-green-700">
                        이번 주 완료율이 80% 이상입니다. 계속해서 좋은 습관을 유지해보세요!
                      </p>
                    </div>
                  )}

                  {weeklyStats.completionRate < 50 && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">💪 화이팅!</h4>
                      <p className="text-orange-700">
                        이번 주는 조금 아쉬웠네요. 다음 주에는 더 작은 목표부터 시작해보는 것은 어떨까요?
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {(!weeklyStats || weeklyStats.totalTodos === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-600 mb-2">선택한 주에 작성된 TODO가 없습니다</p>
              <p className="text-gray-500 mb-4">다른 주를 선택하거나 새로운 TODO를 작성해보세요</p>
              <Link href="/todo/write">
                <Button>
                  <CheckCircle2 className="w-4 h-4 mr-2" />새 TODO 작성하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
