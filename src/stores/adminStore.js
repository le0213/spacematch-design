// Admin 관리자 Store

const ADMIN_KEY = 'spacematch_admin'
const ADMIN_SETTINGS_KEY = 'spacematch_admin_settings'
const REPORTS_KEY = 'spacematch_reports'
const ADMIN_REFUNDS_KEY = 'spacematch_admin_refunds'
const ADMIN_NOTIFICATIONS_KEY = 'spacematch_admin_notifications'
const ADMIN_SPACES_KEY = 'spacematch_admin_spaces'
const ADMIN_BUSINESS_KEY = 'spacematch_admin_business'
const ADMIN_AUTOQUOTES_KEY = 'spacematch_admin_autoquotes'

// Mock 관리자 계정
const ADMIN_ACCOUNTS = [
  { id: 'admin-1', email: 'admin@spacematch.kr', password: 'admin1234', name: '운영팀' }
]

// 초기 시스템 설정
const initialSettings = {
  quotePricePerUnit: 5000, // 견적 단가
  feeRate: 5, // 수수료율 (%)
  autoQuoteEnabled: true,
  notificationTemplates: {
    newRequest: '새로운 견적 요청이 도착했습니다.',
    paymentComplete: '결제가 완료되었습니다.',
    settlementComplete: '정산이 완료되었습니다.'
  },
  settingsHistory: [
    { date: '2024-12-01', admin: '운영팀', change: '서비스 오픈 초기 설정' }
  ]
}

// 초기 신고 데이터
const initialReports = [
  {
    id: 'rpt-1',
    reporterId: 'guest-1',
    reporterName: '김민수',
    reporterType: 'guest',
    targetId: 'host-2',
    targetName: '파티룸 호스트',
    targetType: 'host',
    reason: '외부 거래 유도',
    description: '카카오톡으로 직접 연락하라고 하며 수수료 없이 거래하자고 제안함',
    status: 'pending',
    createdAt: '2024-12-20T14:30:00Z'
  },
  {
    id: 'rpt-2',
    reporterId: 'host-1',
    reporterName: '스튜디오 호스트',
    reporterType: 'host',
    targetId: 'guest-3',
    targetName: '이준혁',
    targetType: 'guest',
    reason: '노쇼',
    description: '예약 후 연락 없이 나타나지 않음',
    status: 'reviewing',
    createdAt: '2024-12-19T10:00:00Z'
  },
  {
    id: 'rpt-3',
    reporterId: 'guest-2',
    reporterName: '박지영',
    reporterType: 'guest',
    targetId: 'host-3',
    targetName: '세미나실 호스트',
    targetType: 'host',
    reason: '허위 정보',
    description: '공간 사진과 실제 공간이 많이 다름',
    status: 'completed',
    action: 'warning',
    completedAt: '2024-12-18T16:00:00Z',
    createdAt: '2024-12-15T11:00:00Z'
  }
]

// 초기화
function initAdmin() {
  if (!localStorage.getItem(ADMIN_SETTINGS_KEY)) {
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(initialSettings))
  }
  if (!localStorage.getItem(REPORTS_KEY)) {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(initialReports))
  }
}

// 관리자 로그인
export function adminLogin(email, password) {
  const admin = ADMIN_ACCOUNTS.find(a => a.email === email && a.password === password)
  if (admin) {
    const adminData = { id: admin.id, email: admin.email, name: admin.name }
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData))
    return { success: true, admin: adminData }
  }
  return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
}

// 관리자 정보 조회
export function getAdminUser() {
  const adminData = localStorage.getItem(ADMIN_KEY)
  return adminData ? JSON.parse(adminData) : null
}

// 관리자 로그아웃
export function adminLogout() {
  localStorage.removeItem(ADMIN_KEY)
  return { success: true }
}

// 대시보드 통계
export function getDashboardStats() {
  // Mock 데이터 - 실제로는 다른 Store에서 집계
  return {
    today: {
      newRequests: 45,
      quotesIssued: 32,
      paymentsCompleted: 12,
      totalAmount: 8500000
    },
    weekly: [
      { day: '월', requests: 38, quotes: 28, payments: 10 },
      { day: '화', requests: 42, quotes: 35, payments: 15 },
      { day: '수', requests: 45, quotes: 32, payments: 12 },
      { day: '목', requests: 50, quotes: 40, payments: 18 },
      { day: '금', requests: 55, quotes: 45, payments: 20 },
      { day: '토', requests: 35, quotes: 25, payments: 8 },
      { day: '일', requests: 30, quotes: 20, payments: 5 }
    ]
  }
}

// 이상 징후 알림
export function getAlerts() {
  return [
    {
      id: 'alert-1',
      type: 'abuse',
      severity: 'high',
      message: '호스트 A: 1시간 내 견적 15건 발행 (어뷰징 의심)',
      createdAt: '2024-12-21T10:30:00Z'
    },
    {
      id: 'alert-2',
      type: 'report',
      severity: 'medium',
      message: '신고 3건 미처리',
      createdAt: '2024-12-21T09:00:00Z'
    },
    {
      id: 'alert-3',
      type: 'payment',
      severity: 'low',
      message: '결제 오류 1건 발생',
      createdAt: '2024-12-20T18:00:00Z'
    }
  ]
}

// 시스템 설정 조회
export function getSystemSettings() {
  initAdmin()
  return JSON.parse(localStorage.getItem(ADMIN_SETTINGS_KEY))
}

// 시스템 설정 저장
export function saveSystemSettings(newSettings) {
  initAdmin()
  const current = JSON.parse(localStorage.getItem(ADMIN_SETTINGS_KEY))
  const admin = getAdminUser()

  // 변경 이력 추가
  const historyEntry = {
    date: new Date().toISOString().slice(0, 10),
    admin: admin?.name || '운영팀',
    change: '설정 변경'
  }

  const updated = {
    ...current,
    ...newSettings,
    settingsHistory: [historyEntry, ...(current.settingsHistory || [])]
  }

  localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(updated))
  return { success: true, settings: updated }
}

// 신고 목록 조회
export function getReports(filter = 'all') {
  initAdmin()
  let reports = JSON.parse(localStorage.getItem(REPORTS_KEY)) || []

  if (filter !== 'all') {
    reports = reports.filter(r => r.status === filter)
  }

  return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// 신고 처리
export function processReport(reportId, action) {
  initAdmin()
  const reports = JSON.parse(localStorage.getItem(REPORTS_KEY)) || []

  const report = reports.find(r => r.id === reportId)
  if (report) {
    report.status = 'completed'
    report.action = action
    report.completedAt = new Date().toISOString()
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
    return { success: true }
  }

  return { success: false, message: '신고를 찾을 수 없습니다.' }
}

// Mock 게스트 목록
export function getGuestList() {
  return [
    { id: 'guest-1', name: '김민수', email: 'minsu@example.com', requestCount: 5, paymentCount: 3, createdAt: '2024-11-15' },
    { id: 'guest-2', name: '박지영', email: 'jiyoung@example.com', requestCount: 3, paymentCount: 2, createdAt: '2024-11-20' },
    { id: 'guest-3', name: '이준혁', email: 'junhyuk@example.com', requestCount: 8, paymentCount: 5, createdAt: '2024-10-01' },
    { id: 'guest-4', name: '최서연', email: 'seoyeon@example.com', requestCount: 2, paymentCount: 1, createdAt: '2024-12-01' },
    { id: 'guest-5', name: '정민호', email: 'minho@example.com', requestCount: 4, paymentCount: 2, createdAt: '2024-12-10' }
  ]
}

// Mock 호스트 목록
export function getHostList() {
  return [
    { id: 'host-1', name: '스튜디오 호스트', email: 'studio@example.com', spaceCount: 2, cashBalance: 50000, quoteCount: 45, createdAt: '2024-10-01' },
    { id: 'host-2', name: '파티룸 호스트', email: 'party@example.com', spaceCount: 1, cashBalance: 30000, quoteCount: 28, createdAt: '2024-10-15', flagged: true },
    { id: 'host-3', name: '세미나실 호스트', email: 'seminar@example.com', spaceCount: 3, cashBalance: 80000, quoteCount: 62, createdAt: '2024-09-01' },
    { id: 'host-4', name: '루프탑 호스트', email: 'rooftop@example.com', spaceCount: 1, cashBalance: 20000, quoteCount: 15, createdAt: '2024-11-20' }
  ]
}

// Mock 거래 목록
export function getTransactionList() {
  return [
    { id: 'tx-1', guestName: '김민수', hostName: '스튜디오 호스트', spaceName: '강남 스튜디오 A', amount: 180000, status: 'completed', paidAt: '2024-12-20T15:30:00Z' },
    { id: 'tx-2', guestName: '박지영', hostName: '파티룸 호스트', spaceName: '홍대 파티룸', amount: 320000, status: 'completed', paidAt: '2024-12-19T10:00:00Z' },
    { id: 'tx-3', guestName: '이준혁', hostName: '세미나실 호스트', spaceName: '성수 세미나실', amount: 240000, status: 'pending', paidAt: null },
    { id: 'tx-4', guestName: '최서연', hostName: '스튜디오 호스트', spaceName: '강남 스튜디오 A', amount: 150000, status: 'refunded', paidAt: '2024-12-15T14:00:00Z', refundedAt: '2024-12-17T10:00:00Z' }
  ]
}

// Mock 견적 목록
export function getQuoteList() {
  return [
    { id: 'qt-1', hostName: '스튜디오 호스트', guestName: '김민수', spaceName: '강남 스튜디오 A', amount: 180000, status: 'accepted', createdAt: '2024-12-19T10:00:00Z' },
    { id: 'qt-2', hostName: '파티룸 호스트', guestName: '박지영', spaceName: '홍대 파티룸', amount: 320000, status: 'pending', createdAt: '2024-12-20T14:00:00Z', flagged: true },
    { id: 'qt-3', hostName: '세미나실 호스트', guestName: '이준혁', spaceName: '성수 세미나실', amount: 240000, status: 'rejected', createdAt: '2024-12-18T09:00:00Z' },
    { id: 'qt-4', hostName: '스튜디오 호스트', guestName: '최서연', spaceName: '강남 스튜디오 A', amount: 150000, status: 'accepted', createdAt: '2024-12-17T11:00:00Z' },
    { id: 'qt-5', hostName: '파티룸 호스트', guestName: '정민호', spaceName: '홍대 파티룸', amount: 280000, status: 'pending', createdAt: '2024-12-21T08:00:00Z', flagged: true }
  ]
}

// Mock 요청 목록
export function getRequestList() {
  return [
    { id: 'req-1', guestName: '김민수', region: '강남역', date: '2024-12-28', people: 10, purpose: '워크샵', status: 'quoted', createdAt: '2024-12-15T10:00:00Z' },
    { id: 'req-2', guestName: '박지영', region: '홍대', date: '2024-12-25', people: 30, purpose: '파티', status: 'waiting', createdAt: '2024-12-18T14:00:00Z' },
    { id: 'req-3', guestName: '이준혁', region: '성수', date: '2024-12-30', people: 50, purpose: '세미나', status: 'quoted', createdAt: '2024-12-19T09:00:00Z' },
    { id: 'req-4', guestName: '최서연', region: '강남역', date: '2025-01-05', people: 15, purpose: '회의', status: 'waiting', createdAt: '2024-12-20T16:00:00Z' },
    { id: 'req-5', guestName: '정민호', region: '신촌', date: '2025-01-10', people: 20, purpose: '스터디', status: 'waiting', createdAt: '2024-12-21T11:00:00Z' }
  ]
}

// 가격 포맷팅
export function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

// 날짜 포맷팅
export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 날짜+시간 포맷팅
export function formatDateTime(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ===== 환불 관리 =====

// 초기 환불 데이터
const initialRefunds = [
  {
    id: 'refund-1',
    paymentId: 'pay-101',
    guestId: 'guest-1',
    guestName: '김민수',
    hostId: 'host-1',
    hostName: '스튜디오 호스트',
    spaceName: '강남 스튜디오 A',
    originalAmount: 180000,
    refundAmount: 180000,
    reason: '개인 사정',
    description: '갑작스러운 일정 변경으로 이용이 어렵습니다.',
    usageDate: '2024-12-28',
    status: '취소요청',
    requestedAt: '2024-12-21T10:00:00Z',
    processedAt: null
  },
  {
    id: 'refund-2',
    paymentId: 'pay-102',
    guestId: 'guest-2',
    guestName: '박지영',
    hostId: 'host-2',
    hostName: '파티룸 호스트',
    spaceName: '홍대 파티룸',
    originalAmount: 320000,
    refundAmount: 224000,
    reason: '호스트 귀책',
    description: '호스트가 예약 시간에 공간을 열어주지 않음',
    usageDate: '2024-12-25',
    status: '환불진행중',
    requestedAt: '2024-12-20T14:00:00Z',
    processedAt: null
  },
  {
    id: 'refund-3',
    paymentId: 'pay-103',
    guestId: 'guest-3',
    guestName: '이준혁',
    hostId: 'host-3',
    hostName: '세미나실 호스트',
    spaceName: '성수 세미나실',
    originalAmount: 240000,
    refundAmount: 240000,
    reason: '공간 상태 불량',
    description: '냉난방 시설이 고장나 있었음',
    usageDate: '2024-12-18',
    status: '환불완료',
    requestedAt: '2024-12-17T09:00:00Z',
    processedAt: '2024-12-18T11:00:00Z'
  },
  {
    id: 'refund-4',
    paymentId: 'pay-104',
    guestId: 'guest-4',
    guestName: '최서연',
    hostId: 'host-1',
    hostName: '스튜디오 호스트',
    spaceName: '강남 스튜디오 A',
    originalAmount: 150000,
    refundAmount: 0,
    reason: '단순 변심',
    description: '당일 취소 요청',
    usageDate: '2024-12-15',
    status: '환불거절',
    rejectReason: '당일 취소는 환불 불가 정책에 따라 거절',
    requestedAt: '2024-12-15T08:00:00Z',
    processedAt: '2024-12-15T10:00:00Z'
  }
]

export function getRefundList(filter = 'all') {
  let refunds = JSON.parse(localStorage.getItem(ADMIN_REFUNDS_KEY))
  if (!refunds) {
    localStorage.setItem(ADMIN_REFUNDS_KEY, JSON.stringify(initialRefunds))
    refunds = initialRefunds
  }

  if (filter !== 'all') {
    refunds = refunds.filter(r => r.status === filter)
  }

  return refunds.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
}

export function getRefundStats() {
  const refunds = getRefundList()
  const today = new Date().toISOString().slice(0, 10)
  const thisMonth = new Date().toISOString().slice(0, 7)

  return {
    pending: refunds.filter(r => r.status === '취소요청').length,
    todayProcessed: refunds.filter(r =>
      r.processedAt && r.processedAt.slice(0, 10) === today
    ).length,
    monthlyAmount: refunds
      .filter(r => r.status === '환불완료' && r.processedAt?.slice(0, 7) === thisMonth)
      .reduce((sum, r) => sum + r.refundAmount, 0)
  }
}

export function processRefund(refundId, action, rejectReason = '') {
  const refunds = JSON.parse(localStorage.getItem(ADMIN_REFUNDS_KEY)) || []
  const refund = refunds.find(r => r.id === refundId)

  if (refund) {
    if (action === 'approve') {
      refund.status = '환불완료'
    } else if (action === 'reject') {
      refund.status = '환불거절'
      refund.rejectReason = rejectReason
    }
    refund.processedAt = new Date().toISOString()
    localStorage.setItem(ADMIN_REFUNDS_KEY, JSON.stringify(refunds))
    return { success: true }
  }
  return { success: false, message: '환불 요청을 찾을 수 없습니다.' }
}

// ===== 알림 관리 =====

const initialAdminNotifications = [
  {
    id: 'noti-1',
    title: '서비스 점검 안내',
    content: '12월 25일 오전 2시~6시 서비스 점검이 예정되어 있습니다.',
    target: 'all',
    type: '공지',
    status: 'sent',
    readRate: 45,
    sentAt: '2024-12-20T10:00:00Z',
    createdAt: '2024-12-20T09:30:00Z'
  },
  {
    id: 'noti-2',
    title: '신규 가입 혜택 안내',
    content: '첫 견적 요청 시 5,000원 할인 쿠폰을 드립니다!',
    target: 'guest',
    type: '마케팅',
    status: 'sent',
    readRate: 32,
    sentAt: '2024-12-18T14:00:00Z',
    createdAt: '2024-12-18T13:00:00Z'
  },
  {
    id: 'noti-3',
    title: '정산 완료 알림',
    content: '12월 2주차 정산이 완료되었습니다.',
    target: 'host',
    type: '시스템',
    status: 'sent',
    readRate: 78,
    sentAt: '2024-12-16T09:00:00Z',
    createdAt: '2024-12-16T09:00:00Z'
  },
  {
    id: 'noti-4',
    title: '연말 프로모션 안내',
    content: '연말을 맞아 특별 할인 프로모션을 진행합니다.',
    target: 'all',
    type: '마케팅',
    status: 'scheduled',
    scheduledAt: '2024-12-24T10:00:00Z',
    createdAt: '2024-12-21T11:00:00Z'
  }
]

const notificationTemplates = [
  { id: 'tpl-1', name: '견적 도착', content: '새로운 견적이 도착했습니다. 확인해보세요!' },
  { id: 'tpl-2', name: '결제 완료', content: '결제가 완료되었습니다. 이용 안내를 확인해주세요.' },
  { id: 'tpl-3', name: '정산 완료', content: '정산이 완료되었습니다. 정산 내역을 확인해주세요.' },
  { id: 'tpl-4', name: '리뷰 요청', content: '공간 이용은 어떠셨나요? 리뷰를 남겨주세요.' }
]

export function getAdminNotificationList(filter = 'all') {
  let notifications = JSON.parse(localStorage.getItem(ADMIN_NOTIFICATIONS_KEY))
  if (!notifications) {
    localStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(initialAdminNotifications))
    notifications = initialAdminNotifications
  }

  if (filter === 'sent') {
    notifications = notifications.filter(n => n.status === 'sent')
  } else if (filter === 'scheduled') {
    notifications = notifications.filter(n => n.status === 'scheduled')
  }

  return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getNotificationTemplates() {
  return notificationTemplates
}

export function sendNotification(notification) {
  const notifications = JSON.parse(localStorage.getItem(ADMIN_NOTIFICATIONS_KEY)) || []

  const newNotification = {
    id: `noti-${Date.now()}`,
    ...notification,
    status: notification.scheduledAt ? 'scheduled' : 'sent',
    sentAt: notification.scheduledAt ? null : new Date().toISOString(),
    readRate: 0,
    createdAt: new Date().toISOString()
  }

  notifications.unshift(newNotification)
  localStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(notifications))
  return { success: true, notification: newNotification }
}

// ===== 공간 관리 =====

const initialSpaces = [
  {
    id: 'space-1',
    spaceCloudId: 'sc_gangnam_studio_001',
    name: '강남 스튜디오 A',
    hostId: 'host-1',
    hostName: '스튜디오 호스트',
    location: '서울 강남구 테헤란로 123',
    region: '강남',
    capacity: 20,
    pricePerHour: 50000,
    rating: 4.9,
    reviewCount: 128,
    quoteEnabled: true,
    status: 'active',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    amenities: ['빔프로젝터', '화이트보드', 'WiFi', '에어컨', '주차'],
    quoteCount: 45,
    transactionCount: 12,
    totalRevenue: 2400000,
    createdAt: '2024-10-01T10:00:00Z'
  },
  {
    id: 'space-2',
    spaceCloudId: 'sc_hongdae_party_001',
    name: '홍대 파티룸',
    hostId: 'host-2',
    hostName: '파티룸 호스트',
    location: '서울 마포구 홍익로 45',
    region: '홍대',
    capacity: 30,
    pricePerHour: 80000,
    rating: 4.7,
    reviewCount: 89,
    quoteEnabled: true,
    status: 'active',
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'],
    amenities: ['음향시스템', '조명', '주방', 'WiFi', '에어컨'],
    quoteCount: 28,
    transactionCount: 8,
    totalRevenue: 1920000,
    createdAt: '2024-10-15T14:00:00Z'
  },
  {
    id: 'space-3',
    spaceCloudId: 'sc_seongsu_seminar_001',
    name: '성수 세미나실',
    hostId: 'host-3',
    hostName: '세미나실 호스트',
    location: '서울 성동구 성수이로 88',
    region: '성수',
    capacity: 50,
    pricePerHour: 120000,
    rating: 4.8,
    reviewCount: 156,
    quoteEnabled: true,
    status: 'active',
    images: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'],
    amenities: ['빔프로젝터', '마이크', 'WiFi', '에어컨', '주차', '휴게공간'],
    quoteCount: 62,
    transactionCount: 18,
    totalRevenue: 4320000,
    createdAt: '2024-09-01T09:00:00Z'
  },
  {
    id: 'space-4',
    spaceCloudId: 'sc_gangnam_studio_002',
    name: '강남 스튜디오 B',
    hostId: 'host-1',
    hostName: '스튜디오 호스트',
    location: '서울 강남구 테헤란로 125',
    region: '강남',
    capacity: 10,
    pricePerHour: 30000,
    rating: 4.6,
    reviewCount: 42,
    quoteEnabled: false,
    status: 'inactive',
    images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800'],
    amenities: ['빔프로젝터', 'WiFi', '에어컨'],
    quoteCount: 15,
    transactionCount: 5,
    totalRevenue: 450000,
    createdAt: '2024-11-01T11:00:00Z'
  }
]

export function getSpaceList(filter = {}) {
  let spaces = JSON.parse(localStorage.getItem(ADMIN_SPACES_KEY))
  if (!spaces) {
    localStorage.setItem(ADMIN_SPACES_KEY, JSON.stringify(initialSpaces))
    spaces = initialSpaces
  }

  if (filter.status && filter.status !== 'all') {
    spaces = spaces.filter(s => s.status === filter.status)
  }
  if (filter.region && filter.region !== 'all') {
    spaces = spaces.filter(s => s.region === filter.region)
  }
  if (filter.search) {
    const term = filter.search.toLowerCase()
    spaces = spaces.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.hostName.toLowerCase().includes(term)
    )
  }

  return spaces.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getSpaceStats() {
  const spaces = getSpaceList()
  return {
    total: spaces.length,
    active: spaces.filter(s => s.status === 'active').length,
    inactive: spaces.filter(s => s.status === 'inactive').length
  }
}

export function updateSpaceStatus(spaceId, status) {
  const spaces = JSON.parse(localStorage.getItem(ADMIN_SPACES_KEY)) || []
  const space = spaces.find(s => s.id === spaceId)

  if (space) {
    space.status = status
    localStorage.setItem(ADMIN_SPACES_KEY, JSON.stringify(spaces))
    return { success: true }
  }
  return { success: false, message: '공간을 찾을 수 없습니다.' }
}

// ===== 사업자 검증 관리 =====

const initialBusinessVerifications = [
  {
    id: 'biz-1',
    hostId: 'host-1',
    hostName: '스튜디오 호스트',
    email: 'studio@example.com',
    ownerType: '개인',
    ownerName: '김호스트',
    businessName: '김호스트 스튜디오',
    businessNumber: '123-45-67890',
    businessAddress: '서울 강남구 테헤란로 123',
    bankName: '국민은행',
    accountHolder: '김호스트',
    accountNumber: '123-456-789012',
    businessVerified: true,
    accountVerified: true,
    submittedAt: '2024-10-01T10:00:00Z',
    verifiedAt: '2024-10-02T14:00:00Z'
  },
  {
    id: 'biz-2',
    hostId: 'host-2',
    hostName: '파티룸 호스트',
    email: 'party@example.com',
    ownerType: '법인',
    ownerName: '(주)파티룸',
    businessName: '(주)파티룸',
    businessNumber: '234-56-78901',
    businessAddress: '서울 마포구 홍익로 45',
    bankName: '신한은행',
    accountHolder: '(주)파티룸',
    accountNumber: '234-567-890123',
    businessVerified: false,
    accountVerified: false,
    submittedAt: '2024-12-20T09:00:00Z',
    verifiedAt: null
  },
  {
    id: 'biz-3',
    hostId: 'host-3',
    hostName: '세미나실 호스트',
    email: 'seminar@example.com',
    ownerType: '개인',
    ownerName: '박호스트',
    businessName: '박호스트 세미나',
    businessNumber: '345-67-89012',
    businessAddress: '서울 성동구 성수이로 88',
    bankName: '우리은행',
    accountHolder: '박호스트',
    accountNumber: '345-678-901234',
    businessVerified: true,
    accountVerified: true,
    submittedAt: '2024-09-01T11:00:00Z',
    verifiedAt: '2024-09-02T10:00:00Z'
  },
  {
    id: 'biz-4',
    hostId: 'host-4',
    hostName: '루프탑 호스트',
    email: 'rooftop@example.com',
    ownerType: '개인',
    ownerName: '이호스트',
    businessName: null,
    businessNumber: null,
    businessAddress: null,
    bankName: '카카오뱅크',
    accountHolder: '이호스트',
    accountNumber: '456-789-012345',
    businessVerified: false,
    accountVerified: false,
    rejectReason: '사업자등록번호 미제출',
    submittedAt: '2024-11-20T14:00:00Z',
    verifiedAt: null
  }
]

export function getBusinessVerificationList(filter = 'all') {
  let verifications = JSON.parse(localStorage.getItem(ADMIN_BUSINESS_KEY))
  if (!verifications) {
    localStorage.setItem(ADMIN_BUSINESS_KEY, JSON.stringify(initialBusinessVerifications))
    verifications = initialBusinessVerifications
  }

  if (filter === 'pending') {
    verifications = verifications.filter(v => !v.businessVerified || !v.accountVerified)
  } else if (filter === 'verified') {
    verifications = verifications.filter(v => v.businessVerified && v.accountVerified)
  } else if (filter === 'rejected') {
    verifications = verifications.filter(v => v.rejectReason)
  }

  return verifications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
}

export function getBusinessVerificationStats() {
  const verifications = getBusinessVerificationList()
  return {
    pending: verifications.filter(v => !v.businessVerified || !v.accountVerified).length,
    verified: verifications.filter(v => v.businessVerified && v.accountVerified).length,
    rejected: verifications.filter(v => v.rejectReason).length
  }
}

export function verifyBusiness(verificationId, type, approved, rejectReason = '') {
  const verifications = JSON.parse(localStorage.getItem(ADMIN_BUSINESS_KEY)) || []
  const verification = verifications.find(v => v.id === verificationId)

  if (verification) {
    if (type === 'business') {
      verification.businessVerified = approved
    } else if (type === 'account') {
      verification.accountVerified = approved
    }

    if (!approved) {
      verification.rejectReason = rejectReason
    } else if (verification.businessVerified && verification.accountVerified) {
      verification.verifiedAt = new Date().toISOString()
      verification.rejectReason = null
    }

    localStorage.setItem(ADMIN_BUSINESS_KEY, JSON.stringify(verifications))
    return { success: true }
  }
  return { success: false, message: '검증 정보를 찾을 수 없습니다.' }
}

// ===== 바로견적 모니터링 =====

const initialAutoQuoteStats = {
  hosts: [
    {
      id: 'host-1',
      hostName: '스튜디오 호스트',
      enabled: true,
      matchingConditions: { regions: ['강남', '서초'], purposes: ['회의', '워크샵'] },
      templateName: '기본 견적 템플릿',
      todaySent: 12,
      successRate: 22,
      lastSentAt: '2024-12-21T15:30:00Z',
      flagged: false
    },
    {
      id: 'host-2',
      hostName: '파티룸 호스트',
      enabled: true,
      matchingConditions: { regions: ['홍대', '마포'], purposes: ['파티', '생일'] },
      templateName: '파티룸 특가',
      todaySent: 18,
      successRate: 15,
      lastSentAt: '2024-12-21T16:00:00Z',
      flagged: true,
      flagReason: '1시간 내 10건 이상 발송'
    },
    {
      id: 'host-3',
      hostName: '세미나실 호스트',
      enabled: true,
      matchingConditions: { regions: ['성수', '강남'], purposes: ['세미나', '강연'] },
      templateName: '세미나 패키지',
      todaySent: 8,
      successRate: 28,
      lastSentAt: '2024-12-21T14:00:00Z',
      flagged: false
    }
  ],
  logs: [
    { id: 'log-1', hostName: '파티룸 호스트', guestName: '정민호', requestContent: '홍대 20명 파티', quoteAmount: 280000, status: 'pending', sentAt: '2024-12-21T16:00:00Z' },
    { id: 'log-2', hostName: '스튜디오 호스트', guestName: '최서연', requestContent: '강남 15명 회의', quoteAmount: 150000, status: 'accepted', sentAt: '2024-12-21T15:30:00Z' },
    { id: 'log-3', hostName: '세미나실 호스트', guestName: '이준혁', requestContent: '성수 50명 세미나', quoteAmount: 600000, status: 'pending', sentAt: '2024-12-21T14:00:00Z' },
    { id: 'log-4', hostName: '파티룸 호스트', guestName: '박지영', requestContent: '홍대 30명 파티', quoteAmount: 320000, status: 'rejected', sentAt: '2024-12-21T13:30:00Z' },
    { id: 'log-5', hostName: '스튜디오 호스트', guestName: '김민수', requestContent: '강남 10명 워크샵', quoteAmount: 180000, status: 'accepted', sentAt: '2024-12-21T10:00:00Z' }
  ]
}

export function getAutoQuoteStats() {
  let stats = JSON.parse(localStorage.getItem(ADMIN_AUTOQUOTES_KEY))
  if (!stats) {
    localStorage.setItem(ADMIN_AUTOQUOTES_KEY, JSON.stringify(initialAutoQuoteStats))
    stats = initialAutoQuoteStats
  }

  const summary = {
    totalHosts: stats.hosts.filter(h => h.enabled).length,
    todaySent: stats.hosts.reduce((sum, h) => sum + h.todaySent, 0),
    avgSuccessRate: Math.round(
      stats.hosts.reduce((sum, h) => sum + h.successRate, 0) / stats.hosts.length
    )
  }

  return { ...stats, summary }
}

export function getAutoQuoteHosts() {
  const stats = getAutoQuoteStats()
  return stats.hosts
}

export function getAutoQuoteLogs() {
  const stats = getAutoQuoteStats()
  return stats.logs
}

export function suspendAutoQuote(hostId) {
  const stats = JSON.parse(localStorage.getItem(ADMIN_AUTOQUOTES_KEY)) || initialAutoQuoteStats
  const host = stats.hosts.find(h => h.id === hostId)

  if (host) {
    host.enabled = false
    host.suspendedAt = new Date().toISOString()
    localStorage.setItem(ADMIN_AUTOQUOTES_KEY, JSON.stringify(stats))
    return { success: true }
  }
  return { success: false, message: '호스트를 찾을 수 없습니다.' }
}
