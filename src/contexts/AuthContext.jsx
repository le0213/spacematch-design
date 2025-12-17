import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 초기 로드 시 세션 확인
  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          phone: session.user.user_metadata?.phone || '',
          role: session.user.user_metadata?.role || 'guest',
        })
      }
      setLoading(false)
    })

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            phone: session.user.user_metadata?.phone || '',
            role: session.user.user_metadata?.role || 'guest',
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 회원가입
  const signup = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone || '',
          role: userData.role || 'guest',
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    // 이메일 확인 없이 바로 로그인 처리 (개발용)
    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || 'guest',
      }
    }

    return data
  }

  // 로그인
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || email.split('@')[0],
      phone: data.user.user_metadata?.phone || '',
      role: data.user.user_metadata?.role || 'guest',
    }
  }

  // 로그아웃
  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
  }

  // 사용자 정보 업데이트
  const updateUser = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.user) {
      setUser(prev => ({
        ...prev,
        ...updates,
      }))
    }
  }

  // 소셜 로그인 (카카오)
  const loginWithKakao = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // 소셜 로그인 (구글)
  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    updateUser,
    loginWithKakao,
    loginWithGoogle,
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
