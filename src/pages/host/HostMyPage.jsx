import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HostHeader from '../../components/HostHeader'
import { useAuth } from '../../contexts/AuthContext'
import { getHostByUserId, getHostStats, updateHost } from '../../stores/hostStore'
import { getUnreadCountForHost } from '../../stores/chatStore'

export default function HostMyPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [host, setHost] = useState(null)
  const [stats, setStats] = useState(null)
  const [unreadChats, setUnreadChats] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // 프로필 폼 상태
  const [formData, setFormData] = useState({
    profileImage: '',
    hostName: '',
    introduction: '',
    availableHours: {
      start: '09:00',
      end: '18:00',
      allDay: false,
    }
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/host/login')
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading])

  const loadData = () => {
    const hostData = getHostByUserId(user.id)
    if (hostData) {
      setHost(hostData)
      const hostStats = getHostStats(hostData.id)
      setStats(hostStats)

      const unread = getUnreadCountForHost(hostData.id)
      setUnreadChats(unread)

      // 기존 프로필 데이터 로드
      setFormData({
        profileImage: hostData.profileImage || '',
        hostName: hostData.hostName || hostData.name || user.name || '',
        introduction: hostData.introduction || '',
        availableHours: hostData.availableHours || {
          start: '09:00',
          end: '18:00',
          allDay: false,
        }
      })
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleHoursChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      availableHours: {
        ...prev.availableHours,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!host) return

    setSaving(true)
    try {
      updateHost(host.id, {
        profileImage: formData.profileImage,
        hostName: formData.hostName,
        introduction: formData.introduction,
        availableHours: formData.availableHours,
      })
      setSuccessMessage('프로필이 저장되었습니다.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
    setSaving(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader stats={stats} unreadChats={unreadChats} />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">프로필 관리</h1>
          <p className="text-gray-500 mt-1">게스트에게 보여지는 호스트 프로필을 관리합니다</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로필 이미지 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">프로필 이미지</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-violet-600">
                      {formData.hostName?.[0] || user?.name?.[0] || 'H'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white hover:bg-violet-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  프로필 사진은 게스트에게 신뢰감을 줍니다.
                </p>
                <p className="text-xs text-gray-400">
                  권장 크기: 200x200px, 최대 5MB (JPG, PNG)
                </p>
              </div>
            </div>
          </div>

          {/* 호스트 정보 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">호스트 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">호스트명</label>
                <input
                  type="text"
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleChange}
                  placeholder="게스트에게 보여질 이름"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">공간 이름 또는 호스트 이름을 입력하세요</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">한줄 소개</label>
                <textarea
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleChange}
                  placeholder="공간과 서비스에 대해 간단히 소개해주세요"
                  rows={3}
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{formData.introduction.length}/100</p>
              </div>
            </div>
          </div>

          {/* 연락 가능 시간 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">연락 가능 시간</h2>
            <div className="space-y-4">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.availableHours.allDay
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.availableHours.allDay}
                  onChange={(e) => handleHoursChange('allDay', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <div>
                  <p className="font-medium text-gray-900">언제나 연락 가능</p>
                  <p className="text-sm text-gray-500">24시간 연락 가능합니다</p>
                </div>
              </label>

              {!formData.availableHours.allDay && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">시작 시간</label>
                    <select
                      value={formData.availableHours.start}
                      onChange={(e) => handleHoursChange('start', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                      })}
                    </select>
                  </div>
                  <span className="text-gray-400 pt-8">~</span>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">종료 시간</label>
                    <select
                      value={formData.availableHours.end}
                      onChange={(e) => handleHoursChange('end', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return <option key={hour} value={`${hour}:00`}>{hour}:00</option>
                      })}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 focus:ring-4 focus:ring-violet-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>

        {/* 계정 정보 */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">이메일</span>
              <span className="text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">가입일</span>
              <span className="text-gray-900">2024.12.01</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">호스트 ID</span>
              <span className="text-gray-900 font-mono text-xs">{host?.id || '-'}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-violet-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-violet-800">
              <p className="font-medium mb-1">프로필 노출 안내</p>
              <p className="text-violet-600">프로필 정보는 견적서, 채팅, 공간 상세 페이지에서 게스트에게 노출됩니다.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
