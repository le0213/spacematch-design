// LocalStorage 기반 견적 요청 관리

const STORAGE_KEY = 'spacematch_requests'

// ============ Mock 데이터 초기화 ============

const initialMockRequests = [
  {
    id: 'req_mock_1',
    userId: 'user_mock_1',
    category: '스튜디오',
    location: '강남구',
    date: '2024-12-28',
    time: '14:00',
    duration: '4시간',
    people: 10,
    budget: '20만원 이하',
    query: '제품 촬영용 스튜디오를 찾고 있습니다. 자연광이 들어오면 좋겠고, 배경지 교체가 가능했으면 합니다.',
    summary: '12월 28일 촬영 가능한 스튜디오를 찾고...',
    userName: '김촬영',
    status: '대기중',
    viewedBy: [],
    viewedAt: {},
    isAutoQuote: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req_mock_2',
    userId: 'user_mock_2',
    category: '회의실',
    location: '서초구',
    date: '2024-12-30',
    time: '10:00',
    duration: '6시간',
    people: 20,
    budget: '30만원 이하',
    query: '연말 팀 워크샵을 위한 회의실이 필요합니다. 빔프로젝터와 화이트보드가 필수이고, 다과 서비스가 있으면 좋겠습니다.',
    summary: '연말 팀 워크샵 회의실 필요...',
    userName: '박워크샵',
    status: '대기중',
    viewedBy: ['host-1'],
    viewedAt: { 'host-1': new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    isAutoQuote: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req_mock_3',
    userId: 'user_mock_3',
    category: '파티룸',
    location: '마포구',
    date: '2024-12-31',
    time: '18:00',
    duration: '5시간',
    people: 15,
    budget: '25만원 이하',
    query: '송년회 파티룸을 찾습니다. 음향 시스템이 좋아야 하고, 간단한 조리 가능한 주방이 있으면 좋겠어요.',
    summary: '송년회 파티룸, 음향 시스템 필수...',
    userName: '이파티',
    status: '견적서 발송 완료',
    viewedBy: ['host-1'],
    viewedAt: { 'host-1': new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    isAutoQuote: false,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req_mock_4',
    userId: 'user_mock_4',
    category: '연습실',
    location: '성동구',
    date: '2025-01-05',
    time: '13:00',
    duration: '3시간',
    people: 5,
    budget: '10만원 이하',
    query: '밴드 연습을 위한 방음 연습실이 필요합니다. 드럼, 앰프 등 기본 장비가 있으면 좋겠습니다.',
    summary: '밴드 연습용 방음 연습실...',
    userName: '최밴드',
    status: '대기중',
    viewedBy: [],
    viewedAt: {},
    isAutoQuote: true,
    autoQuoteSentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'req_mock_5',
    userId: 'user_mock_5',
    category: '세미나실',
    location: '강남구',
    date: '2025-01-10',
    time: '09:00',
    duration: '8시간',
    people: 50,
    budget: '50만원 이상',
    query: '기업 세미나 개최를 위한 대형 세미나실이 필요합니다. 무선 마이크 2개, 대형 스크린, 녹화 장비가 필수입니다.',
    summary: '기업 세미나용 대형 세미나실...',
    userName: '정세미나',
    status: '대기중',
    viewedBy: ['host-1'],
    viewedAt: { 'host-1': new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    isAutoQuote: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req_mock_6',
    userId: 'user_mock_6',
    category: '스튜디오',
    location: '용산구',
    date: '2025-01-15',
    time: '11:00',
    duration: '6시간',
    people: 8,
    budget: '40만원 이하',
    query: '유튜브 촬영을 위한 스튜디오입니다. 그린스크린과 조명 장비가 필요하고, 편집실이 있으면 좋겠습니다.',
    summary: '유튜브 촬영 스튜디오, 그린스크린...',
    userName: '윤유튜브',
    status: '견적서 발송 완료',
    viewedBy: ['host-1'],
    viewedAt: { 'host-1': new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
    isAutoQuote: true,
    autoQuoteSentAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  }
]

// 초기화 함수
function initRequests() {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockRequests))
  }
}

// ============ 기본 CRUD ============

// 모든 요청 가져오기
export function getAllRequests() {
  initRequests()
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// 사용자별 요청 가져오기
export function getUserRequests(userId) {
  const requests = getAllRequests()
  return requests.filter(r => r.userId === userId)
}

// 단일 요청 가져오기
export function getRequest(requestId) {
  const requests = getAllRequests()
  return requests.find(r => r.id === requestId)
}

// 새 요청 생성
export function createRequest(requestData) {
  initRequests()
  const requests = getAllRequests()

  const newRequest = {
    id: `req_${Date.now()}`,
    ...requestData,
    status: '대기중', // 대기중 | 견적서 발송 완료
    viewedBy: [],
    viewedAt: {},
    isAutoQuote: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  requests.push(newRequest)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))

  return newRequest
}

// 요청 업데이트
export function updateRequest(requestId, updates) {
  initRequests()
  const requests = getAllRequests()
  const index = requests.findIndex(r => r.id === requestId)

  if (index === -1) {
    throw new Error('요청을 찾을 수 없습니다.')
  }

  requests[index] = {
    ...requests[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
  return requests[index]
}

// 요청 삭제
export function deleteRequest(requestId) {
  initRequests()
  const requests = getAllRequests()
  const filtered = requests.filter(r => r.id !== requestId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

// ============ 상태 관리 ============

// 상태별 요청 가져오기
export function getRequestsByStatus(userId, status) {
  const requests = getUserRequests(userId)
  if (status === '전체') return requests
  return requests.filter(r => r.status === status)
}

// Mock: 대기 중인 요청들 (호스트가 볼 수 있는)
export function getPendingRequestsForHost() {
  const requests = getAllRequests()
  return requests.filter(r => r.status === '대기중')
}

// ============ 조회 상태 관리 ============

// 요청을 확인했다고 표시
export function markRequestAsViewed(requestId, hostId) {
  initRequests()
  const requests = getAllRequests()
  const index = requests.findIndex(r => r.id === requestId)

  if (index === -1) {
    throw new Error('요청을 찾을 수 없습니다.')
  }

  const request = requests[index]

  // 이미 확인한 호스트면 무시
  if (request.viewedBy && request.viewedBy.includes(hostId)) {
    return request
  }

  // viewedBy 배열에 호스트 추가
  const viewedBy = request.viewedBy || []
  viewedBy.push(hostId)

  // viewedAt 객체에 호스트별 확인 시간 기록
  const viewedAt = request.viewedAt || {}
  viewedAt[hostId] = new Date().toISOString()

  requests[index] = {
    ...request,
    viewedBy,
    viewedAt,
    updatedAt: new Date().toISOString()
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
  return requests[index]
}

// 호스트가 확인하지 않은 요청들 (신규요청)
export function getUnviewedRequests(hostId) {
  const requests = getAllRequests()
  return requests.filter(r => {
    const viewedBy = r.viewedBy || []
    return !viewedBy.includes(hostId)
  })
}

// 호스트가 확인했지만 견적 미발송 요청들
export function getViewedButNotQuotedRequests(hostId) {
  const requests = getAllRequests()

  // 호스트가 발송한 견적 가져오기
  const quotesData = localStorage.getItem('spacematch_quotes')
  const quotes = quotesData ? JSON.parse(quotesData) : []
  const quotedRequestIds = quotes
    .filter(q => q.hostId === hostId)
    .map(q => q.requestId)

  return requests.filter(r => {
    const viewedBy = r.viewedBy || []
    // 확인했고, 아직 대기중이고, 견적 미발송
    return viewedBy.includes(hostId) &&
           r.status === '대기중' &&
           !quotedRequestIds.includes(r.id)
  })
}

// ============ 통계 ============

// 호스트용 요청 통계
export function getRequestStats(hostId) {
  const allRequests = getAllRequests()

  // 호스트가 발송한 견적 가져오기
  const quotesData = localStorage.getItem('spacematch_quotes')
  const quotes = quotesData ? JSON.parse(quotesData) : []
  const hostQuotes = quotes.filter(q => q.hostId === hostId)
  const quotedRequestIds = hostQuotes.map(q => q.requestId)

  // 전체 견적 (호스트가 발송한)
  const totalQuotes = hostQuotes.length

  // 신규 요청 (확인하지 않은)
  const newRequests = allRequests.filter(r => {
    const viewedBy = r.viewedBy || []
    return !viewedBy.includes(hostId) && r.status === '대기중'
  }).length

  // 견적 미발송 (확인했지만 발송 안함)
  const notQuoted = allRequests.filter(r => {
    const viewedBy = r.viewedBy || []
    return viewedBy.includes(hostId) &&
           r.status === '대기중' &&
           !quotedRequestIds.includes(r.id)
  }).length

  // 바로견적 발송 건수
  const autoQuotes = hostQuotes.filter(q => q.isAutoQuote).length

  return {
    totalQuotes,
    newRequests,
    notQuoted,
    autoQuotes
  }
}

// 호스트용 전체 요청 목록 (필터 지원)
export function getRequestsForHost(hostId, filter = 'all') {
  const allRequests = getAllRequests()

  // 호스트가 발송한 견적 가져오기
  const quotesData = localStorage.getItem('spacematch_quotes')
  const quotes = quotesData ? JSON.parse(quotesData) : []
  const quotedRequestIds = quotes
    .filter(q => q.hostId === hostId)
    .map(q => q.requestId)

  let filtered = allRequests

  switch (filter) {
    case 'pending':
      // 대기중인 요청
      filtered = allRequests.filter(r => r.status === '대기중')
      break
    case 'quoted':
      // 견적 발송 완료
      filtered = allRequests.filter(r => quotedRequestIds.includes(r.id))
      break
    case 'new':
      // 신규 요청 (미확인)
      filtered = allRequests.filter(r => {
        const viewedBy = r.viewedBy || []
        return !viewedBy.includes(hostId) && r.status === '대기중'
      })
      break
    case 'not_quoted':
      // 견적 미발송 (확인했지만 발송 안함)
      filtered = allRequests.filter(r => {
        const viewedBy = r.viewedBy || []
        return viewedBy.includes(hostId) &&
               r.status === '대기중' &&
               !quotedRequestIds.includes(r.id)
      })
      break
    default:
      // 전체
      break
  }

  // 최신순 정렬
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// ============ 유틸리티 ============

// 시간 경과 표시
export function getTimeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
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

export default {
  getAllRequests,
  getUserRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  getRequestsByStatus,
  getPendingRequestsForHost,
  markRequestAsViewed,
  getUnviewedRequests,
  getViewedButNotQuotedRequests,
  getRequestStats,
  getRequestsForHost,
  getTimeAgo
}
