"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Search, Plus, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getTodos } from "@/lib/storage"
import type { Todo } from "@/types/todo"

export default function TodoListPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [todos, setTodos] = useState<Todo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const showSearch = searchParams.get("search") === "true"

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const userTodos = getTodos(user.id)
    // 최신순 정렬 (등록일 기준 내림차순)
    const sortedTodos = userTodos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setTodos(sortedTodos)
    setFilteredTodos(sortedTodos)
  }, [user, router])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTodos(todos)
    } else {
      const filtered = todos.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          todo.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          todo.tasks.some((task) => task.text.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredTodos(filtered)
    }
  }, [searchTerm, todos])

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
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">TODO 목록</h1>
            </div>
          </div>
          <Link href="/todo/write">
            <Button>
              <Plus className="w-4 h-4 mr-2" />새 TODO 작성
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* 검색 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="제목, 내용, 할일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* TODO 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{searchTerm ? `검색 결과 (${filteredTodos.length}개)` : `전체 TODO (${todos.length}개)`}</span>
              <div className="text-sm text-gray-500">최신순</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                {searchTerm ? (
                  <>
                    <p className="text-lg mb-2">검색 결과가 없습니다</p>
                    <p>다른 키워드로 검색해보세요</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg mb-2">아직 작성된 TODO가 없습니다</p>
                    <Link href="/todo/write">
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />첫 번째 TODO 작성하기
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTodos.map((todo) => (
                  <Link key={todo.id} href={`/todo/${todo.id}`}>
                    <div className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-xl text-gray-800">{todo.title}</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {new Date(todo.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3">{todo.content}</p>

                      {/* 할일 미리보기 */}
                      <div className="mb-3">
                        <div className="flex gap-2 flex-wrap">
                          {todo.tasks.slice(0, 4).map((task, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded ${
                                task.completed
                                  ? "bg-green-100 text-green-800 line-through"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {task.text}
                            </span>
                          ))}
                          {todo.tasks.length > 4 && (
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                              +{todo.tasks.length - 4}개 더
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 진행률 */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${todo.tasks.length > 0 ? (todo.tasks.filter((t) => t.completed).length / todo.tasks.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span>
                          {todo.tasks.filter((t) => t.completed).length}/{todo.tasks.length} 완료
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
