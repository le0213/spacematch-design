import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  getAdminNotificationList,
  getNotificationTemplates,
  sendNotification,
  formatDateTime
} from '../../stores/adminStore'

const typeColors = {
  '공지': 'bg-blue-100 text-blue-700',
  '마케팅': 'bg-green-100 text-green-700',
  '긴급': 'bg-red-100 text-red-700',
  '시스템': 'bg-gray-100 text-gray-700'
}

const statusColors = {
  '발송완료': 'bg-green-100 text-green-700',
  '예약됨': 'bg-amber-100 text-amber-700',
  '발송실패': 'bg-red-100 text-red-700'
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [templates, setTemplates] = useState([])
  const [activeTab, setActiveTab] = useState('history')
  const [showModal, setShowModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [newNotification, setNewNotification] = useState({
    target: 'all',
    targetUsers: '',
    type: '공지',
    title: '',
    content: '',
    link: '',
    sendType: 'immediate',
    scheduledAt: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setNotifications(getAdminNotificationList())
    setTemplates(getNotificationTemplates())
  }

  const handleSend = () => {
    if (!newNotification.title.trim() || !newNotification.content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    if (newNotification.target === 'specific' && !newNotification.targetUsers.trim()) {
      alert('대상 사용자를 입력해주세요.')
      return
    }

    if (newNotification.sendType === 'scheduled' && !newNotification.scheduledAt) {
      alert('예약 발송 시간을 선택해주세요.')
      return
    }

    setSending(true)
    const result = sendNotification({
      ...newNotification,
      sentAt: newNotification.sendType === 'immediate' ? new Date().toISOString() : null,
      scheduledAt: newNotification.sendType === 'scheduled' ? newNotification.scheduledAt : null,
      status: newNotification.sendType === 'immediate' ? '발송완료' : '예약됨'
    })

    if (result.success) {
      alert(newNotification.sendType === 'immediate' ? '알림이 발송되었습니다.' : '알림이 예약되었습니다.')
      setShowModal(false)
      setNewNotification({
        target: 'all',
        targetUsers: '',
        type: '공지',
        title: '',
        content: '',
        link: '',
        sendType: 'immediate',
        scheduledAt: ''
      })
      loadData()
    }
    setSending(false)
  }

  const openNewModal = () => {
    setNewNotification({
      target: 'all',
      targetUsers: '',
      type: '공지',
      title: '',
      content: '',
      link: '',
      sendType: 'immediate',
      scheduledAt: ''
    })
    setShowModal(true)
  }

  const sentCount = notifications.filter(n => n.status === '발송완료').length
  const scheduledCount = notifications.filter(n => n.status === '예약됨').length
  const avgReadRate = notifications.length > 0
    ? Math.round(notifications.reduce((sum, n) => sum + (n.readRate || 0), 0) / notifications.length)
    : 0

  const tabs = [
    { key: 'history', label: '발송 내역' },
    { key: 'scheduled', label: '예약 알림' },
    { key: 'templates', label: '템플릿 관리' }
  ]

  const filteredNotifications = activeTab === 'scheduled'
    ? notifications.filter(n => n.status === '예약됨')
    : activeTab === 'history'
    ? notifications.filter(n => n.status !== '예약됨')
    : notifications

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">알림 관리</h1>
          <button
            onClick={openNewModal}
            className="px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 알림
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">발송 완료</p>
                <p className="text-2xl font-bold text-gray-900">{sentCount}건</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">예약 대기</p>
                <p className="text-2xl font-bold text-gray-900">{scheduledCount}건</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">평균 읽음률</p>
                <p className="text-2xl font-bold text-gray-900">{avgReadRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-violet-600 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'templates' ? (
            <div className="p-6">
              <div className="space-y-4">
                {templates.map(template => (
                  <div key={template.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[template.type]}`}>
                            {template.type}
                          </span>
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-1">템플릿 내용:</p>
                          <p className="text-sm text-gray-600">{template.content}</p>
                        </div>
                      </div>
                      <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                        수정
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">유형</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">제목</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">대상</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">발송일</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">읽음률</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredNotifications.map(notification => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{notification.id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[notification.type]}`}>
                          {notification.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{notification.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {notification.target === 'all' ? '전체' :
                         notification.target === 'guests' ? '게스트' :
                         notification.target === 'hosts' ? '호스트' : '특정 사용자'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {notification.status === '예약됨'
                          ? `예약: ${formatDateTime(notification.scheduledAt)}`
                          : formatDateTime(notification.sentAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {notification.status === '발송완료' ? (
                          <span className="text-sm font-medium text-gray-900">{notification.readRate}%</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColors[notification.status]}`}>
                          {notification.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredNotifications.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        {activeTab === 'scheduled' ? '예약된 알림이 없습니다.' : '발송된 알림이 없습니다.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">새 알림 발송</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* 대상 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">발송 대상</label>
                <select
                  value={newNotification.target}
                  onChange={(e) => setNewNotification({ ...newNotification, target: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
                >
                  <option value="all">전체</option>
                  <option value="guests">게스트만</option>
                  <option value="hosts">호스트만</option>
                  <option value="specific">특정 사용자</option>
                </select>
              </div>

              {newNotification.target === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">대상 사용자 (이메일/ID)</label>
                  <input
                    type="text"
                    value={newNotification.targetUsers}
                    onChange={(e) => setNewNotification({ ...newNotification, targetUsers: e.target.value })}
                    placeholder="user@example.com, user2@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
                  />
                </div>
              )}

              {/* 알림 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">알림 유형</label>
                <div className="flex gap-2">
                  {['공지', '마케팅', '긴급', '시스템'].map(type => (
                    <button
                      key={type}
                      onClick={() => setNewNotification({ ...newNotification, type })}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        newNotification.type === type
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="알림 제목을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                <textarea
                  value={newNotification.content}
                  onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
                  placeholder="알림 내용을 입력하세요"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none resize-none"
                />
              </div>

              {/* 링크 (선택) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">연결 링크 (선택)</label>
                <input
                  type="text"
                  value={newNotification.link}
                  onChange={(e) => setNewNotification({ ...newNotification, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
                />
              </div>

              {/* 발송 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">발송 방식</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendType"
                      value="immediate"
                      checked={newNotification.sendType === 'immediate'}
                      onChange={(e) => setNewNotification({ ...newNotification, sendType: e.target.value })}
                      className="w-4 h-4 text-violet-600"
                    />
                    <span className="text-sm text-gray-700">즉시 발송</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendType"
                      value="scheduled"
                      checked={newNotification.sendType === 'scheduled'}
                      onChange={(e) => setNewNotification({ ...newNotification, sendType: e.target.value })}
                      className="w-4 h-4 text-violet-600"
                    />
                    <span className="text-sm text-gray-700">예약 발송</span>
                  </label>
                </div>
              </div>

              {newNotification.sendType === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">예약 시간</label>
                  <input
                    type="datetime-local"
                    value={newNotification.scheduledAt}
                    onChange={(e) => setNewNotification({ ...newNotification, scheduledAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
                  />
                </div>
              )}

              {/* 발송 버튼 */}
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {sending ? '발송 중...' : newNotification.sendType === 'immediate' ? '즉시 발송' : '예약 발송'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
