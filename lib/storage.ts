import type { Todo } from "@/types/todo"

export function getTodos(userId: string): Todo[] {
  if (typeof window === "undefined") return []

  const todos = localStorage.getItem("todos")
  if (!todos) return []

  const allTodos: Todo[] = JSON.parse(todos)
  return allTodos.filter((todo) => todo.userId === userId)
}

export function getTodo(id: string): Todo | null {
  if (typeof window === "undefined") return null

  const todos = localStorage.getItem("todos")
  if (!todos) return null

  const allTodos: Todo[] = JSON.parse(todos)
  return allTodos.find((todo) => todo.id === id) || null
}

export function saveTodo(todo: Todo): void {
  if (typeof window === "undefined") return

  const todos = localStorage.getItem("todos")
  const allTodos: Todo[] = todos ? JSON.parse(todos) : []

  allTodos.push(todo)
  localStorage.setItem("todos", JSON.stringify(allTodos))
}

export function updateTodo(updatedTodo: Todo): void {
  if (typeof window === "undefined") return

  const todos = localStorage.getItem("todos")
  if (!todos) return

  const allTodos: Todo[] = JSON.parse(todos)
  const index = allTodos.findIndex((todo) => todo.id === updatedTodo.id)

  if (index !== -1) {
    allTodos[index] = updatedTodo
    localStorage.setItem("todos", JSON.stringify(allTodos))
  }
}

export function deleteTodo(id: string): void {
  if (typeof window === "undefined") return

  const todos = localStorage.getItem("todos")
  if (!todos) return

  const allTodos: Todo[] = JSON.parse(todos)
  const filteredTodos = allTodos.filter((todo) => todo.id !== id)

  localStorage.setItem("todos", JSON.stringify(filteredTodos))
}
