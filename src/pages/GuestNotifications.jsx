import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GuestHeader } from '../components/Header'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  formatTimeAgo,
  getNotificationIcon,
  NOTIFICATION_TYPES,
} from '../stores/notificationStore'

export default function GuestNotifications() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }

    if (user) {
      loadNotifications()
    }
  }, [user, authLoading])

  const loadNotifications = () => {
    // user_mock_1로 조회 (실제로는 user.id 사용)
    const userNotifications = getNotifications('user_mock_1')
    setNotifications(userNotifications)
    setLoading(false)
  }

  const handleMarkAsRead = (notificationId) => {
    markAsRead('user_mock_1', notificationId)
    loadNotifications()
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead('user_mock_1')
    loadNotifications()
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GuestHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">알림</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-violet-600 hover:text-violet-700"
            >
              전체 읽음
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500">알림이 없습니다</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-violet-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !notification.isRead ? 'bg-violet-100' : 'bg-gray-100'
                  }`}>
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="px-1.5 py-0.5 bg-violet-600 text-white text-xs font-medium rounded flex-shrink-0">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-0.5 ${
                      !notification.isRead ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Arrow */}
                  {notification.link && (
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Settings Link */}
        <div className="mt-6 text-center">
          <button className="text-sm text-gray-500 hover:text-gray-700">
            알림 설정
          </button>
        </div>
      </main>
    </div>
  )
}
