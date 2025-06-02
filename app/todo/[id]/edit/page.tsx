"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getTodo, updateTodo } from "@/lib/storage"
import type { Todo, Task } from "@/types/todo"

export default function TodoEditPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [todo, setTodo] = useState<Todo | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [reflection, setReflection] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
    setTitle(todoData.title)
    setContent(todoData.content)
    setTasks(todoData.tasks)
    setReflection(todoData.reflection)
    setLoading(false)
  }, [user, params.id, router])

  const addTask = () => {
    setTasks([...tasks, { text: "", completed: false }])
  }

  const removeTask = (index: number) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index))
    }
  }

  const updateTask = (index: number, text: string) => {
    const newTasks = [...tasks]
    newTasks[index].text = text
    setTasks(newTasks)
  }

  const toggleTask = (index: number) => {
    const newTasks = [...tasks]
    newTasks[index].completed = !newTasks[index].completed
    setTasks(newTasks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!todo || !user) return

    if (!title.trim()) {
      alert("제목을 입력해주세요.")
      return
    }

    const validTasks = tasks.filter((task) => task.text.trim() !== "")
    if (validTasks.length === 0) {
      alert("최소 하나의 할일을 입력해주세요.")
      return
    }

    setSaving(true)

    try {
      const updatedTodo: Todo = {
        ...todo,
        title: title.trim(),
        content: content.trim(),
        tasks: validTasks,
        reflection: reflection.trim(),
        updatedAt: new Date().toISOString(),
      }

      updateTodo(updatedTodo)
      router.push(`/todo/${todo.id}`)
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/todo/${todo.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                상세로
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">TODO 수정</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <Card>
            <CardHeader>
              <CardTitle>제목</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="TODO 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
                required
              />
            </CardContent>
          </Card>

          {/* 내용 */}
          <Card>
            <CardHeader>
              <CardTitle>내용</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* 할일 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                할일 목록
                <Button type="button" onClick={addTask} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  할일 추가
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(index)} />
                    <Input
                      type="text"
                      placeholder={`할일 ${index + 1}`}
                      value={task.text}
                      onChange={(e) => updateTask(index, e.target.value)}
                      className="flex-1"
                    />
                    {tasks.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 회고 */}
          <Card>
            <CardHeader>
              <CardTitle>회고</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="회고를 입력하세요"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-4">
            <Link href={`/todo/${todo.id}`}>
              <Button type="button" variant="outline">
                취소
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
