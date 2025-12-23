import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GuestHeader } from '../components/Header'
import { getUnreadCount } from '../stores/notificationStore'

export default function GuestMyPage() {
  const { user, logout, updateUser, loading } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  })
  const [saving, setSaving] = useState(false)

  // 안읽은 알림 수
  const unreadNotifications = user ? getUnreadCount(user.id) : 0

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUser({
        name: formData.name,
        phone: formData.phone,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('프로필 업데이트에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GuestHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: '받은 견적',
      to: '/quotes',
      description: '호스트로부터 받은 견적 목록',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      label: '결제 내역',
      to: '/payments',
      description: '결제한 거래 내역 확인',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      ),
      label: '취소/환불 내역',
      to: '/refunds',
      description: '취소 및 환불 진행 상태',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      label: '알림',
      to: '/notifications',
      description: '견적, 메시지, 결제 알림',
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">마이페이지</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">프로필</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-violet-600 hover:text-violet-700"
              >
                수정
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                  disabled={saving}
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">이름</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">연락처</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">이메일</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">이메일은 변경할 수 없습니다</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-20 text-sm text-gray-500">이름</span>
                <span className="text-gray-900">{user.name || '-'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-20 text-sm text-gray-500">연락처</span>
                <span className="text-gray-900">{user.phone || '-'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-20 text-sm text-gray-500">이메일</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>
          )}
        </div>

        {/* Menu Section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          {menuItems.map((item, idx) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                idx !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-500">{item.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 text-gray-600 hover:text-gray-900 text-center border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors"
        >
          로그아웃
        </button>
      </main>
    </div>
  )
}
