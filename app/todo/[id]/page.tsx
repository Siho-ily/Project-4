"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, Edit, Trash2, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getTodo, updateTodo, deleteTodo } from "@/lib/storage"
import type { Todo } from "@/types/todo"

export default function TodoDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [todo, setTodo] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const todoData = getTodo(params.id)
    if (!todoData || todoData.userId !== user.id) {
      router.push("/todo/list")
      return
    }

    setTodo(todoData)
    setLoading(false)
  }, [user, params.id, router])

  const toggleTask = (taskIndex: number) => {
    if (!todo) return

    const updatedTodo = {
      ...todo,
      tasks: todo.tasks.map((task, index) => (index === taskIndex ? { ...task, completed: !task.completed } : task)),
      updatedAt: new Date().toISOString(),
    }

    updateTodo(updatedTodo)
    setTodo(updatedTodo)
  }

  const handleDelete = () => {
    if (!todo) return

    if (confirm("정말로 이 TODO를 삭제하시겠습니까?")) {
      deleteTodo(todo.id)
      router.push("/todo/list")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">TODO를 찾을 수 없습니다.</p>
            <Link href="/todo/list">
              <Button>목록으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedTasks = todo.tasks.filter((task) => task.completed).length
  const totalTasks = todo.tasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/todo/list">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">TODO 상세</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/todo/${todo.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                수정
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 제목과 날짜 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{todo.title}</h1>
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-4 h-4" />
                  작성일: {new Date(todo.createdAt).toLocaleDateString("ko-KR")}
                </div>
                {todo.updatedAt !== todo.createdAt && (
                  <div>수정일: {new Date(todo.updatedAt).toLocaleDateString("ko-KR")}</div>
                )}
              </div>
            </div>

            {/* 진행률 */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">진행률</span>
                <span className="text-sm text-gray-600">
                  {completedTasks}/{totalTasks} 완료
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-center mt-2 text-lg font-semibold text-blue-600">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 내용 */}
        {todo.content && (
          <Card>
            <CardHeader>
              <CardTitle>내용</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{todo.content}</p>
            </CardContent>
          </Card>
        )}

        {/* 할일 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>할일 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todo.tasks.map((task, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    task.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(index)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <span className={`flex-1 ${task.completed ? "text-green-700 line-through" : "text-gray-800"}`}>
                    {task.text}
                  </span>
                  {task.completed && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">완료</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 회고 */}
        {todo.reflection && (
          <Card>
            <CardHeader>
              <CardTitle>회고</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{todo.reflection}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
