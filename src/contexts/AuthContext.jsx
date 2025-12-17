import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// LocalStorage keys
const STORAGE_KEYS = {
  USER: 'spacematch_user',
  USERS: 'spacematch_users',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 초기 로드 시 저장된 사용자 확인
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.USER)
      }
    }
    setLoading(false)
  }, [])

  // 회원가입
  const signup = (userData) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')

    // 이메일 중복 체크
    if (users.find(u => u.email === userData.email)) {
      throw new Error('이미 가입된 이메일입니다.')
    }

    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      role: userData.role || 'guest',
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

    // 자동 로그인
    const { password, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  }

  // 로그인
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const foundUser = users.find(u => u.email === email && u.password === password)

    if (!foundUser) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    }

    const { password: _, ...userWithoutPassword } = foundUser
    setUser(userWithoutPassword)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  }

  // 로그아웃
  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }

  // 사용자 정보 업데이트
  const updateUser = (updates) => {
    if (!user) return

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const userIndex = users.findIndex(u => u.id === user.id)

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    }

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isGuest: user?.role === 'guest',
    isHost: user?.role === 'host',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
