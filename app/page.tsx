"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Search, Plus, Calendar, TrendingUp, Target } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getTodos } from "@/lib/storage"
import type { Todo } from "@/types/todo"

export default function HomePage() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all")

  useEffect(() => {
    if (user) {
      const userTodos = getTodos(user.id)
      // 최신순 정렬 (등록일 기준 내림차순)
      const sortedTodos = userTodos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setTodos(sortedTodos)
    } else {
      setTodos([])
    }
  }, [user])

  useEffect(() => {
    let filtered = todos

    // 검색 필터
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          todo.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          todo.tasks.some((task) => task.text.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // 완료 상태 필터
    if (filter === "completed") {
      filtered = filtered.filter((todo) => todo.tasks.every((task) => task.completed))
    } else if (filter === "pending") {
      filtered = filtered.filter((todo) => todo.tasks.some((task) => !task.completed))
    }

    setFilteredTodos(filtered)
  }, [searchTerm, todos, filter])

  // 통계 계산
  const totalTodos = todos.length
  const completedTodos = todos.filter((todo) => todo.tasks.every((task) => task.completed)).length
  const totalTasks = todos.reduce((sum, todo) => sum + todo.tasks.length, 0)
  const completedTasks = todos.reduce((sum, todo) => sum + todo.tasks.filter((task) => task.completed).length, 0)
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-dashed">
            <CardContent className="pt-8 pb-8">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-2">Todo Journal에 오신 것을 환영합니다!</h1>
              <p className="text-muted-foreground mb-6">
                일일 TODO와 회고를 기록하고 관리해보세요. 로그인하여 시작하세요.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/auth/register">
                  <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    시작하기
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg">
                    로그인
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 통계 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">총 TODO</p>
                <p className="text-2xl font-bold">{totalTodos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-orange-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">전체 할일</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">완료한 할일</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">완료율</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="제목, 내용, 할일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                전체
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
              >
                진행중
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
              >
                완료
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TODO 목록 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">TODO 목록 {searchTerm && `(${filteredTodos.length}개 검색 결과)`}</h2>
        <Link href="/todo/write">
          <Button>
            <Plus className="mr-2 h-4 w-4" />새 TODO 작성
          </Button>
        </Link>
      </div>

      {filteredTodos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            {searchTerm ? (
              <>
                <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
                <p className="text-muted-foreground">다른 키워드로 검색해보세요</p>
              </>
            ) : todos.length === 0 ? (
              <>
                <p className="text-lg font-medium mb-2">아직 작성된 TODO가 없습니다</p>
                <p className="text-muted-foreground mb-4">첫 번째 TODO를 작성해보세요</p>
                <Link href="/todo/write">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />첫 번째 TODO 작성하기
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">해당 조건의 TODO가 없습니다</p>
                <p className="text-muted-foreground">다른 필터를 선택해보세요</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTodos.map((todo) => {
            const completedTasksCount = todo.tasks.filter((task) => task.completed).length
            const totalTasksCount = todo.tasks.length
            const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0
            const isCompleted = completedTasksCount === totalTasksCount && totalTasksCount > 0

            return (
              <Card key={todo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <Link href={`/todo/${todo.id}`} className="flex-1">
                      <h3 className="text-xl font-semibold hover:text-primary transition-colors">{todo.title}</h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          완료
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(todo.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>

                  {todo.content && <p className="text-muted-foreground mb-4 line-clamp-2">{todo.content}</p>}

                  {/* 할일 미리보기 */}
                  <div className="mb-4">
                    <div className="flex gap-2 flex-wrap">
                      {todo.tasks.slice(0, 4).map((task, index) => (
                        <Badge
                          key={index}
                          variant={task.completed ? "default" : "outline"}
                          className={task.completed ? "bg-green-100 text-green-800" : ""}
                        >
                          {task.text}
                        </Badge>
                      ))}
                      {todo.tasks.length > 4 && <Badge variant="outline">+{todo.tasks.length - 4}개 더</Badge>}
                    </div>
                  </div>

                  {/* 진행률 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">진행률</span>
                      <span className="font-medium">
                        {completedTasksCount}/{totalTasksCount} ({Math.round(progressPercentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
