export interface Task {
  text: string
  completed: boolean
}

export interface Todo {
  id: string
  userId: string
  title: string
  content: string
  tasks: Task[]
  reflection: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}
