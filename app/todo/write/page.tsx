"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { saveTodo } from "@/lib/storage"
import type { Todo, Task } from "@/types/todo"

export default function TodoWritePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tasks, setTasks] = useState<Task[]>([{ text: "", completed: false }])
  const [reflection, setReflection] = useState("")
  const [loading, setLoading] = useState(false)

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

    if (!user) {
      router.push("/auth/login")
      return
    }

    if (!title.trim()) {
      alert("제목을 입력해주세요.")
      return
    }

    const validTasks = tasks.filter((task) => task.text.trim() !== "")
    if (validTasks.length === 0) {
      alert("최소 하나의 할일을 입력해주세요.")
      return
    }

    setLoading(true)

    try {
      const todo: Todo = {
        id: Date.now().toString(),
        userId: user.id,
        title: title.trim(),
        content: content.trim(),
        tasks: validTasks,
        reflection: reflection.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      saveTodo(todo)
      router.push(`/todo/${todo.id}`)
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

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
              <h1 className="text-xl font-bold text-gray-800">새 TODO 작성</h1>
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
                placeholder="오늘의 TODO 제목을 입력하세요"
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
                placeholder="오늘의 계획이나 목표를 자세히 적어보세요"
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
              <CardTitle>회고 (선택사항)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="오늘 하루를 돌아보며 느낀 점이나 개선할 점을 적어보세요"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-4">
            <Link href="/todo/list">
              <Button type="button" variant="outline">
                취소
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
