import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Guest Header - 공간을 찾는 사람용
export function GuestHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-xl text-gray-900">스페이스매치</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/my-requests"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                내 요청
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                로그아웃
              </button>
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-violet-600 font-medium text-sm">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              로그인/회원가입
            </Link>
          )}
          <Link
            to="/host"
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          >
            호스트전환
          </Link>
        </div>
      </div>
    </header>
  )
}

// Host Header - 호스트용
export function HostHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/host')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/host" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-xl text-gray-900">스페이스매치</span>
          <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-600 text-xs font-medium rounded">
            호스트센터
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user?.role === 'host' ? (
            <>
              <Link
                to="/host/dashboard"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                대시보드
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                로그아웃
              </button>
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-violet-600 font-medium text-sm">
                  {user.name?.charAt(0) || 'H'}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/host/login"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                로그인
              </Link>
              <Link
                to="/host/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-full hover:bg-violet-700 transition-colors"
              >
                호스트 시작하기
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default GuestHeader
