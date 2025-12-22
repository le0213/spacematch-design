// Admin 관리자 Store

const ADMIN_KEY = 'spacematch_admin'
const ADMIN_SETTINGS_KEY = 'spacematch_admin_settings'
const REPORTS_KEY = 'spacematch_reports'

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
