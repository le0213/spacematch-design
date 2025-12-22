// LocalStorage 기반 호스트 관리

const HOSTS_KEY = 'spacematch_hosts'
const SPACES_KEY = 'spacematch_spaces'
const WALLET_HISTORY_KEY = 'spacematch_wallet_history'

// 캐시 단가: 견적 발송 1건당 1,000원
export const QUOTE_COST = 1000

// ============ 지갑 거래 내역 관리 ============

// 거래 내역 가져오기
export function getWalletHistory(hostId, type = 'all') {
  const data = localStorage.getItem(WALLET_HISTORY_KEY)
  const history = data ? JSON.parse(data) : []

  let filtered = history.filter(h => h.hostId === hostId)

  if (type === 'cash') {
    filtered = filtered.filter(h => h.type === 'cash')
  } else if (type === 'points') {
    filtered = filtered.filter(h => h.type === 'points')
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// 거래 내역 추가
function addWalletHistory(hostId, data) {
  const history = JSON.parse(localStorage.getItem(WALLET_HISTORY_KEY) || '[]')

  history.push({
    id: `wh_${Date.now()}`,
    hostId,
    ...data,
    createdAt: new Date().toISOString()
  })

  localStorage.setItem(WALLET_HISTORY_KEY, JSON.stringify(history))
}

// Mock 지갑 거래 내역 초기화
export function initMockWalletHistory(hostId) {
  const existing = localStorage.getItem(WALLET_HISTORY_KEY)
  if (existing) return

  const mockHistory = [
    // 캐시 내역
    { hostId, type: 'cash', action: 'charge', amount: 50000, balance: 50000, description: '캐시 충전 (카드)', createdAt: '2024-11-15T10:00:00Z' },
    { hostId, type: 'cash', action: 'use', amount: -1000, balance: 49000, description: '견적 발송 - 스튜디오 촬영', createdAt: '2024-11-18T14:30:00Z' },
    { hostId, type: 'cash', action: 'use', amount: -1000, balance: 48000, description: '견적 발송 - 파티룸 예약', createdAt: '2024-11-20T09:15:00Z' },
    { hostId, type: 'cash', action: 'charge', amount: 30000, balance: 78000, description: '캐시 충전 (카드)', createdAt: '2024-12-01T11:00:00Z' },
    { hostId, type: 'cash', action: 'use', amount: -1000, balance: 77000, description: '견적 발송 - 세미나실', createdAt: '2024-12-05T16:45:00Z' },

    // 포인트 내역
    { hostId, type: 'points', action: 'earn', amount: 3000, balance: 3000, description: '신규 가입 보너스', createdAt: '2024-11-10T09:00:00Z' },
    { hostId, type: 'points', action: 'earn', amount: 2000, balance: 5000, description: '12월 프로모션 지급', createdAt: '2024-12-01T00:00:00Z' },
    { hostId, type: 'points', action: 'use', amount: -1000, balance: 4000, description: '견적 발송 - 연습실', createdAt: '2024-12-10T13:20:00Z' },
    { hostId, type: 'points', action: 'use', amount: -1000, balance: 3000, description: '견적 발송 - 루프탑', createdAt: '2024-12-15T10:30:00Z' },
  ]

  localStorage.setItem(WALLET_HISTORY_KEY, JSON.stringify(mockHistory))
}

// 잔액 확인 (견적 발송 가능 여부)
export function canAffordQuote(hostId) {
  const host = getHost(hostId)
  if (!host) return false
  return (host.cash + host.points) >= QUOTE_COST
}

// ============ 호스트 관리 ============

// 모든 호스트 가져오기
export function getAllHosts() {
  const data = localStorage.getItem(HOSTS_KEY)
  return data ? JSON.parse(data) : []
}

// 단일 호스트 가져오기
export function getHost(hostId) {
  const hosts = getAllHosts()
  return hosts.find(h => h.id === hostId)
}

// 사용자 ID로 호스트 가져오기
export function getHostByUserId(userId) {
  const hosts = getAllHosts()
  return hosts.find(h => h.userId === userId)
}

// 호스트 등록
export function createHost(hostData) {
  const hosts = getAllHosts()

  const newHost = {
    id: `host_${Date.now()}`,
    ...hostData,
    cash: 10000, // 초기 캐시 10,000원 지급
    points: 0,
    totalQuotesSent: 0,
    totalDeals: 0,
    rating: 0,
    reviewCount: 0,
    responseRate: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  hosts.push(newHost)
  localStorage.setItem(HOSTS_KEY, JSON.stringify(hosts))

  return newHost
}

// 호스트 정보 업데이트
export function updateHost(hostId, updates) {
  const hosts = getAllHosts()
  const index = hosts.findIndex(h => h.id === hostId)

  if (index === -1) {
    throw new Error('호스트를 찾을 수 없습니다.')
  }

  hosts[index] = {
    ...hosts[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(HOSTS_KEY, JSON.stringify(hosts))
  return hosts[index]
}

// 캐시 차감 (견적 발송 시)
export function deductCash(hostId, amount = QUOTE_COST, description = '견적 발송') {
  const host = getHost(hostId)
  if (!host) {
    throw new Error('호스트를 찾을 수 없습니다.')
  }

  // 포인트 우선 사용
  let remainingAmount = amount
  let pointsUsed = 0
  let cashUsed = 0

  if (host.points > 0) {
    pointsUsed = Math.min(host.points, remainingAmount)
    remainingAmount -= pointsUsed
  }

  if (remainingAmount > 0) {
    if (host.cash < remainingAmount) {
      throw new Error('캐시가 부족합니다. 충전 후 다시 시도해주세요.')
    }
    cashUsed = remainingAmount
  }

  const updatedHost = updateHost(hostId, {
    cash: host.cash - cashUsed,
    points: host.points - pointsUsed,
    totalQuotesSent: host.totalQuotesSent + 1,
  })

  // 거래 내역 기록
  if (pointsUsed > 0) {
    addWalletHistory(hostId, {
      type: 'points',
      action: 'use',
      amount: -pointsUsed,
      balance: updatedHost.points,
      description
    })
  }

  if (cashUsed > 0) {
    addWalletHistory(hostId, {
      type: 'cash',
      action: 'use',
      amount: -cashUsed,
      balance: updatedHost.cash,
      description
    })
  }

  return updatedHost
}

// 캐시 충전
export function addCash(hostId, amount, description = '캐시 충전') {
  const host = getHost(hostId)
  if (!host) {
    throw new Error('호스트를 찾을 수 없습니다.')
  }

  const updatedHost = updateHost(hostId, {
    cash: host.cash + amount,
  })

  addWalletHistory(hostId, {
    type: 'cash',
    action: 'charge',
    amount: amount,
    balance: updatedHost.cash,
    description
  })

  return updatedHost
}

// 포인트 지급
export function addPoints(hostId, amount, description = '포인트 지급') {
  const host = getHost(hostId)
  if (!host) {
    throw new Error('호스트를 찾을 수 없습니다.')
  }

  const updatedHost = updateHost(hostId, {
    points: host.points + amount,
  })

  addWalletHistory(hostId, {
    type: 'points',
    action: 'earn',
    amount: amount,
    balance: updatedHost.points,
    description
  })

  return updatedHost
}

// ============ 공간 관리 ============

// 모든 공간 가져오기
export function getAllSpaces() {
  const data = localStorage.getItem(SPACES_KEY)
  return data ? JSON.parse(data) : []
}

// 호스트의 공간 가져오기
export function getSpacesByHost(hostId) {
  const spaces = getAllSpaces()
  return spaces.filter(s => s.hostId === hostId)
}

// 단일 공간 가져오기
export function getSpace(spaceId) {
  const spaces = getAllSpaces()
  return spaces.find(s => s.id === spaceId)
}

// 공간 등록
export function createSpace(spaceData) {
  const spaces = getAllSpaces()

  const newSpace = {
    id: `space_${Date.now()}`,
    ...spaceData,
    quoteEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  spaces.push(newSpace)
  localStorage.setItem(SPACES_KEY, JSON.stringify(spaces))

  return newSpace
}

// 공간 업데이트
export function updateSpace(spaceId, updates) {
  const spaces = getAllSpaces()
  const index = spaces.findIndex(s => s.id === spaceId)

  if (index === -1) {
    throw new Error('공간을 찾을 수 없습니다.')
  }

  spaces[index] = {
    ...spaces[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(SPACES_KEY, JSON.stringify(spaces))
  return spaces[index]
}

// ============ Mock 데이터 생성 ============

// 호스트용 Mock 공간 생성
export function generateMockSpaces(hostId) {
  const mockSpaces = [
    {
      hostId,
      name: '프리미엄 청소 서비스',
      category: '청소',
      description: '입주/이사 청소, 정기 청소, 특수 청소 전문',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
      basePrice: 100000,
      quoteEnabled: true,
    },
    {
      hostId,
      name: '에어컨 청소 전문',
      category: '에어컨',
      description: '벽걸이, 스탠드, 시스템 에어컨 분해 청소',
      image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop',
      basePrice: 80000,
      quoteEnabled: true,
    },
  ]

  const createdSpaces = mockSpaces.map(space => createSpace(space))
  return createdSpaces
}

// ============ 통계 ============

// 호스트 통계 가져오기
export function getHostStats(hostId) {
  const host = getHost(hostId)
  if (!host) return null

  // quoteStore에서 견적 정보 가져오기
  const quotesData = localStorage.getItem('spacematch_quotes')
  const quotes = quotesData ? JSON.parse(quotesData) : []
  const hostQuotes = quotes.filter(q => q.hostId === hostId)

  // paymentStore에서 결제 정보 가져오기
  const paymentsData = localStorage.getItem('spacematch_payments')
  const payments = paymentsData ? JSON.parse(paymentsData) : []
  const hostPayments = payments.filter(p => p.hostId === hostId && p.status === '결제완료')

  // requestStore에서 대기 중인 요청 수 가져오기
  const requestsData = localStorage.getItem('spacematch_requests')
  const requests = requestsData ? JSON.parse(requestsData) : []
  const pendingRequests = requests.filter(r => r.status === '대기중')

  return {
    cash: host.cash,
    points: host.points,
    totalBalance: host.cash + host.points,
    totalQuotesSent: hostQuotes.length,
    pendingRequests: pendingRequests.length,
    completedDeals: hostPayments.length,
    totalRevenue: hostPayments.reduce((sum, p) => sum + p.amount, 0),
    rating: host.rating,
    reviewCount: host.reviewCount,
    responseRate: host.responseRate,
  }
}

// 금액 포맷팅
export function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

export default {
  getAllHosts,
  getHost,
  getHostByUserId,
  createHost,
  updateHost,
  deductCash,
  addCash,
  addPoints,
  getWalletHistory,
  initMockWalletHistory,
  canAffordQuote,
  getAllSpaces,
  getSpacesByHost,
  getSpace,
  createSpace,
  updateSpace,
  generateMockSpaces,
  getHostStats,
  formatPrice,
  QUOTE_COST,
}
