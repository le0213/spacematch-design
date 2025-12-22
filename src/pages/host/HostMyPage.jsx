import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HostHeader from '../../components/HostHeader'
import { useAuth } from '../../contexts/AuthContext'
import { getHostStats, formatPrice } from '../../stores/hostStore'

export default function HostMyPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })

  useEffect(() => {
    if (user?.id) {
      const hostStats = getHostStats(user.id)
      setStats(hostStats)
      setEditForm({ name: user.name || '', phone: user.phone || '' })
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/host/login')
  }

  const handleEditSave = () => {
    alert('프로필이 수정되었습니다. (Mock)')
    setShowEditModal(false)
  }

  const menuItems = [
    {
      path: '/host/spaces',
      label: '공간 관리',
      desc: '등록된 공간 확인 및 관리',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600'
    },
    {
      path: '/host/wallet',
      label: '캐시/포인트',
      desc: '잔액 확인 및 충전',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-violet-50 text-violet-600'
    },
    {
      path: '/host/settlements',
      label: '정산 관리',
      desc: '정산 내역 및 계좌 관리',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-green-50 text-green-600'
    },
    {
      path: '/host/payments',
      label: '결제 내역',
      desc: '받은 결제 내역 확인',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-amber-50 text-amber-600'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader stats={stats} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">마이페이지</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-violet-600">
                {user?.name?.[0] || 'H'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user?.name || '호스트'}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400 mt-1">가입일: 2024.12.01</p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100"
            >
              프로필 수정
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-500">캐시</p>
              <p className="text-xl font-bold text-violet-600">{formatPrice(stats?.cash || 0)}원</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">포인트</p>
              <p className="text-xl font-bold text-violet-600">{formatPrice(stats?.points || 0)}P</p>
            </div>
          </div>
        </div>

        {/* Quick Menu */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">바로가기</h3>
          <div className="grid grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h3 className="font-semibold text-gray-900 px-6 py-4 border-b border-gray-100">계정 설정</h3>
          <div className="divide-y divide-gray-100">
            <Link
              to="/host/notifications"
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-gray-700">알림 설정</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-6 py-4 text-left hover:bg-gray-50"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-red-600">로그아웃</span>
            </button>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">프로필 수정</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">업체명</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 outline-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
