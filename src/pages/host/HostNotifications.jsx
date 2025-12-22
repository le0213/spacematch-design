import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HostHeader from '../../components/HostHeader'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  formatTimeAgo,
  getNotificationIcon,
  NOTIFICATION_TYPES
} from '../../stores/notificationStore'

export default function HostNotifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const hostId = 'host-1'

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = () => {
    setNotifications(getNotifications(hostId))
    setUnreadCount(getUnreadCount(hostId))
  }

  const handleNotificationClick = (notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      markAsRead(hostId, notification.id)
      loadNotifications()
    }

    // 링크가 있으면 이동
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead(hostId)
    loadNotifications()
  }

  const getTypeColor = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.NEW_REQUEST:
        return 'bg-blue-100'
      case NOTIFICATION_TYPES.NEW_MESSAGE:
        return 'bg-green-100'
      case NOTIFICATION_TYPES.PAYMENT_COMPLETE:
        return 'bg-emerald-100'
      case NOTIFICATION_TYPES.SETTLEMENT_COMPLETE:
        return 'bg-violet-100'
      case NOTIFICATION_TYPES.AUTO_QUOTE:
        return 'bg-amber-100'
      case NOTIFICATION_TYPES.SYSTEM:
      default:
        return 'bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">알림</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-sm font-semibold bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              전체 읽음
            </button>
          )}
        </div>

        {/* 알림 리스트 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-gray-500">알림이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-violet-50/50' : ''
                  }`}
                >
                  {/* 아이콘 */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${getTypeColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${notification.isRead ? 'text-gray-900' : 'text-violet-900'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-violet-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* 화살표 (링크가 있는 경우) */}
                  {notification.link && (
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 알림 타입 범례 */}
        <div className="mt-6 p-4 bg-gray-100 rounded-xl">
          <p className="text-sm font-medium text-gray-700 mb-3">알림 유형</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span className="text-gray-600">새 견적 요청</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span className="text-gray-600">새 채팅 메시지</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <span className="text-gray-600">결제 완료</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span className="text-gray-600">정산 완료</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="text-gray-600">바로견적 발행</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <span className="text-gray-600">시스템 알림</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
