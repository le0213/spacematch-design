import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUnreadCount } from '../stores/notificationStore'

// Guest Header - 공간을 찾는 사람용
export function GuestHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // 안읽은 알림 수 (user_mock_1로 조회)
  const unreadNotifications = user ? getUnreadCount('user_mock_1') : 0

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/')
  }

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
                to="/quotes"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                받은 견적
              </Link>
              <Link
                to="/payments"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                결제 내역
              </Link>
              {/* 알림 아이콘 */}
              <Link
                to="/notifications"
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="알림"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>
              {/* 프로필 드롭다운 */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center hover:bg-violet-200 transition-colors"
                >
                  <span className="text-violet-600 font-medium text-sm">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.name || '사용자'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/mypage"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      마이페이지
                    </Link>
                    <Link
                      to="/refunds"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      취소/환불 내역
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
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
