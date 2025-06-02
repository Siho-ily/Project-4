"use client"

import { useState, useEffect, createContext, useContext } from "react"
import type { User } from "@/types/todo"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  register: (name: string, email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const foundUser = users.find((u: User) => u.email === email && u.password === password)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const register = (name: string, email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    if (users.find((u: User) => u.email === email)) {
      return false
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))
    setUser(newUser)
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  if (!context) {
    return { user, login, register, logout }
  }
  return context
}
