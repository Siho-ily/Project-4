"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle2,
  Home,
  Calendar,
  BarChart3,
  Sun,
  Moon,
  User,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/hooks/use-theme"

export function Navigation() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "홈", icon: Home },
    { href: "/todo/list", label: "TODO목록", icon: Calendar },
    { href: "/todo/week", label: "주간 기록", icon: BarChart3 },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Todo Journal</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-4">
            {/* 테마 토글 */}
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* 사용자 메뉴 */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/todo/write" className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4" />새 TODO 작성
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    로그인
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    회원가입
                  </Button>
                </Link>
              </div>
            )}

            {/* 모바일 메뉴 버튼 */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-2 py-2 text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {!user && (
                <>
                  <div className="border-t pt-2 mt-2">
                    <Link
                      href="/auth/login"
                      className="flex items-center space-x-2 px-2 py-2 text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>로그인</span>
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex items-center space-x-2 px-2 py-2 text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>회원가입</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
