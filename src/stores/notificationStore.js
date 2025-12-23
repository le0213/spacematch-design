// 알림 센터 Store

const NOTIFICATION_KEY = 'spacematch_notifications'

// 알림 타입
export const NOTIFICATION_TYPES = {
  // 호스트용
  NEW_REQUEST: 'new_request',      // 새 견적 요청
  NEW_MESSAGE: 'new_message',      // 새 채팅 메시지
  PAYMENT_COMPLETE: 'payment',     // 결제 완료
  SETTLEMENT_COMPLETE: 'settlement', // 정산 완료
  AUTO_QUOTE: 'auto_quote',        // 바로견적 발행
  SYSTEM: 'system',                // 시스템 알림
  // 게스트용
  QUOTE_RECEIVED: 'quote_received', // 견적 도착
  BOOKING_REMINDER: 'booking_reminder', // 이용 예정 리마인더
  REFUND_COMPLETE: 'refund_complete', // 환불 완료
  CANCEL_COMPLETE: 'cancel_complete', // 취소 완료
}

// 초기 Mock 데이터
const initialNotifications = {
  // 게스트 Mock 알림
  'user_mock_1': [
    {
      id: 'noti-g1',
      type: NOTIFICATION_TYPES.QUOTE_RECEIVED,
      title: '새 견적이 도착했습니다',
      content: '강남 프리미엄 회의실에서 견적을 발송했습니다.',
      link: '/quotes',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: 'noti-g2',
      type: NOTIFICATION_TYPES.NEW_MESSAGE,
      title: '새 메시지가 있습니다',
      content: '홍대 스튜디오 호스트가 응답했습니다.',
      link: '/chat/quote_mock_1',
      isRead: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      id: 'noti-g3',
      type: NOTIFICATION_TYPES.PAYMENT_COMPLETE,
      title: '결제가 완료되었습니다',
      content: '성수 파티룸 예약이 확정되었습니다.',
      link: '/payments',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'noti-g4',
      type: NOTIFICATION_TYPES.BOOKING_REMINDER,
      title: '이용 예정 알림',
      content: '내일 14:00에 강남 회의실 이용이 예정되어 있습니다.',
      link: '/payments',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
  ],
  // 호스트 Mock 알림
  'host-1': [
    {
      id: 'noti-1',
      type: NOTIFICATION_TYPES.NEW_REQUEST,
      title: '새로운 견적 요청',
      content: '김민수님이 12/28 강남역 주변 스터디룸 견적을 요청했습니다.',
      link: '/host/requests/req-1',
      isRead: false,
      createdAt: '2024-12-21T10:30:00Z'
    },
    {
      id: 'noti-2',
      type: NOTIFICATION_TYPES.PAYMENT_COMPLETE,
      title: '결제 완료',
      content: '박지영님이 "강남 스튜디오 A" 이용 대금 180,000원을 결제했습니다.',
      link: '/host/payments',
      isRead: false,
      createdAt: '2024-12-20T15:20:00Z'
    },
    {
      id: 'noti-3',
      type: NOTIFICATION_TYPES.AUTO_QUOTE,
      title: '바로견적 발송 완료',
      content: '이준혁님에게 바로견적이 자동 발송되었습니다. (5,000캐시 차감)',
      link: '/host/auto-quote',
      isRead: true,
      createdAt: '2024-12-20T09:00:00Z'
    },
    {
      id: 'noti-4',
      type: NOTIFICATION_TYPES.NEW_MESSAGE,
      title: '새 메시지',
      content: '최서연님: 주차 가능한지 확인 부탁드려요',
      link: '/host/chats/chat-2',
      isRead: true,
      createdAt: '2024-12-19T18:45:00Z'
    },
    {
      id: 'noti-5',
      type: NOTIFICATION_TYPES.SETTLEMENT_COMPLETE,
      title: '정산 완료',
      content: '11월 정산금 807,500원이 입금되었습니다.',
      link: '/host/settlements',
      isRead: true,
      createdAt: '2024-12-05T10:00:00Z'
    },
    {
      id: 'noti-6',
      type: NOTIFICATION_TYPES.SYSTEM,
      title: '서비스 공지',
      content: '스페이스매치 앱이 업데이트 되었습니다. 새로운 기능을 확인해보세요!',
      link: null,
      isRead: true,
      createdAt: '2024-12-01T09:00:00Z'
    }
  ]
}

// 초기화
function initNotifications() {
  if (!localStorage.getItem(NOTIFICATION_KEY)) {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(initialNotifications))
  }
}

// 알림 목록 조회
export function getNotifications(userId) {
  initNotifications()
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATION_KEY))
  return (notifications[userId] || []).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  )
}

// 안읽은 알림 수
export function getUnreadCount(userId) {
  initNotifications()
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATION_KEY))
  const userNotifications = notifications[userId] || []
  return userNotifications.filter(n => !n.isRead).length
}

// 읽음 처리
export function markAsRead(userId, notificationId) {
  initNotifications()
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATION_KEY))
  const userNotifications = notifications[userId] || []

  const notification = userNotifications.find(n => n.id === notificationId)
  if (notification) {
    notification.isRead = true
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications))
  }

  return { success: true }
}

// 전체 읽음 처리
export function markAllAsRead(userId) {
  initNotifications()
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATION_KEY))
  const userNotifications = notifications[userId] || []

  userNotifications.forEach(n => {
    n.isRead = true
  })

  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications))
  return { success: true }
}

// 알림 추가
export function addNotification(userId, notification) {
  initNotifications()
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATION_KEY))

  if (!notifications[userId]) {
    notifications[userId] = []
  }

  const newNotification = {
    id: `noti-${Date.now()}`,
    type: notification.type || NOTIFICATION_TYPES.SYSTEM,
    title: notification.title,
    content: notification.content,
    link: notification.link || null,
    isRead: false,
    createdAt: new Date().toISOString()
  }

  notifications[userId].unshift(newNotification)
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications))

  return { success: true, notification: newNotification }
}

// 알림 삭제
export function deleteNotification(userId, notificationId) {
  initNotifications()
  const notifications = JSON.parse(localStorage.getItem(NOTIFICATION_KEY))

  if (notifications[userId]) {
    notifications[userId] = notifications[userId].filter(n => n.id !== notificationId)
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications))
  }

  return { success: true }
}

// 시간 포맷팅 (상대 시간)
export function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

// 알림 아이콘 가져오기
export function getNotificationIcon(type) {
  switch (type) {
    case NOTIFICATION_TYPES.NEW_REQUEST:
      return '📋'
    case NOTIFICATION_TYPES.NEW_MESSAGE:
      return '💬'
    case NOTIFICATION_TYPES.PAYMENT_COMPLETE:
      return '💳'
    case NOTIFICATION_TYPES.SETTLEMENT_COMPLETE:
      return '💰'
    case NOTIFICATION_TYPES.AUTO_QUOTE:
      return '⚡'
    // 게스트용
    case NOTIFICATION_TYPES.QUOTE_RECEIVED:
      return '📋'
    case NOTIFICATION_TYPES.BOOKING_REMINDER:
      return '🔔'
    case NOTIFICATION_TYPES.REFUND_COMPLETE:
      return '💰'
    case NOTIFICATION_TYPES.CANCEL_COMPLETE:
      return '❌'
    case NOTIFICATION_TYPES.SYSTEM:
    default:
      return '🔔'
  }
}
