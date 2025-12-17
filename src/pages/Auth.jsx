import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const redirect = searchParams.get('redirect') || '/'

  // URL path로 모드 결정 (/login, /signup, /host/login, /host/signup)
  const isHostPath = location.pathname.includes('/host')
  const isSignupPath = location.pathname.includes('/signup')

  const [isLogin, setIsLogin] = useState(!isSignupPath)
  const [autoLogin, setAutoLogin] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, signup, loginWithKakao, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setIsLogin(!isSignupPath)
    setError('')
    setFormData({
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
      phone: '',
    })
  }, [isSignupPath])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // 로그인
        await login(formData.email, formData.password)
        // 자동 로그인 설정 저장
        if (autoLogin) {
          localStorage.setItem('autoLogin', 'true')
        }
        navigate(redirect)
      } else {
        // 회원가입
        if (formData.password !== formData.passwordConfirm) {
          throw new Error('비밀번호가 일치하지 않습니다.')
        }
        if (formData.password.length < 6) {
          throw new Error('비밀번호는 6자 이상이어야 합니다.')
        }
        if (!formData.name.trim()) {
          throw new Error('이름을 입력해주세요.')
        }

        await signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: isHostPath ? 'host' : 'guest',
        })
        navigate(redirect)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchToSignup = () => {
    const basePath = isHostPath ? '/host/signup' : '/signup'
    navigate(basePath)
  }

  const switchToLogin = () => {
    const basePath = isHostPath ? '/host/login' : '/login'
    navigate(basePath)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link to={isHostPath ? '/host' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">스페이스매치</span>
            {isHostPath && (
              <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-600 text-xs font-medium rounded">
                호스트
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? '로그인' : '회원가입'}
            </h1>
            <p className="text-gray-500">
              {isLogin
                ? '스페이스매치에 오신 것을 환영합니다'
                : '간편하게 가입하고 시작하세요'}
            </p>
          </div>

          {isLogin ? (
            /* 로그인 폼 */
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="이메일"
                    className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-base"
                  />
                </div>

                {/* Password */}
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="비밀번호"
                    className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-base"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {loading ? '로그인 중...' : '로그인'}
                </button>
              </form>

              {/* Auto Login & Find Account */}
              <div className="flex items-center justify-between mt-4 px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoLogin}
                    onChange={(e) => setAutoLogin(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-600">자동 로그인</span>
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <button type="button" className="hover:text-gray-700 hover:underline">
                    아이디 찾기
                  </button>
                  <span className="text-gray-300">|</span>
                  <button type="button" className="hover:text-gray-700 hover:underline">
                    비밀번호 찾기
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-400">간편 로그인</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                {/* Kakao */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await loginWithKakao()
                    } catch (err) {
                      setError(err.message)
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-[#FEE500] text-gray-900 font-medium rounded-lg hover:bg-[#FDD800] transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                  </svg>
                  <span>카카오로 시작하기</span>
                </button>

                {/* Naver */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      // Naver login - placeholder
                      setError('네이버 로그인은 준비 중입니다.')
                    } catch (err) {
                      setError(err.message)
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-[#03C75A] text-white font-medium rounded-lg hover:bg-[#02b350] transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.273 12.845L7.376 0H0v24h7.726V11.155L16.624 24H24V0h-7.727v12.845z"/>
                  </svg>
                  <span>네이버로 시작하기</span>
                </button>

                {/* Google */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await loginWithGoogle()
                    } catch (err) {
                      setError(err.message)
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google로 시작하기</span>
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={switchToSignup}
                  className="w-full py-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-gray-500">아직 계정이 없다면?</span>
                  <span className="text-violet-600 font-semibold">이메일 회원가입</span>
                </button>
              </div>
            </>
          ) : (
            /* 회원가입 폼 */
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    이메일
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-base"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="6자 이상 입력"
                    className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-base"
                  />
                </div>

                {/* Password Confirm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                    placeholder="비밀번호를 다시 입력"
                    className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-base"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    이름
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="이름을 입력해주세요"
                    className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-base"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    연락처 <span className="text-gray-400 font-normal">(선택)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-base"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
                >
                  {loading ? '가입 중...' : '가입하기'}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <span className="text-gray-500 text-sm">이미 계정이 있으신가요?</span>
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="ml-2 text-violet-600 font-semibold text-sm hover:underline"
                >
                  로그인
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
