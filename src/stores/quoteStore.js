// LocalStorage 기반 견적 관리

const STORAGE_KEY = 'spacematch_quotes'

// 모든 견적 가져오기
export function getAllQuotes() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// 요청별 견적 가져오기
export function getQuotesByRequest(requestId) {
  const quotes = getAllQuotes()
  return quotes.filter(q => q.requestId === requestId)
}

// 사용자(게스트)가 받은 모든 견적
export function getQuotesForUser(userId) {
  const quotes = getAllQuotes()
  return quotes.filter(q => q.guestId === userId)
}

// 호스트가 발송한 모든 견적
export function getQuotesByHost(hostId) {
  const quotes = getAllQuotes()
  return quotes.filter(q => q.hostId === hostId)
}

// 단일 견적 가져오기
export function getQuote(quoteId) {
  const quotes = getAllQuotes()
  return quotes.find(q => q.id === quoteId)
}

// 새 견적 생성 (호스트가 발송)
export function createQuote(quoteData) {
  const quotes = getAllQuotes()

  const newQuote = {
    id: `quote_${Date.now()}`,
    ...quoteData,
    status: '미열람', // 미열람 | 열람
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  quotes.push(newQuote)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes))

  return newQuote
}

// 견적 업데이트
export function updateQuote(quoteId, updates) {
  const quotes = getAllQuotes()
  const index = quotes.findIndex(q => q.id === quoteId)

  if (index === -1) {
    throw new Error('견적을 찾을 수 없습니다.')
  }

  quotes[index] = {
    ...quotes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes))
  return quotes[index]
}

// 견적 열람 처리
export function markQuoteAsRead(quoteId) {
  return updateQuote(quoteId, { status: '열람' })
}

// Mock 데이터 생성 (테스트용)
export function generateMockQuotes(requestId, guestId) {
  const mockHosts = [
    {
      id: 'host_1',
      name: '청소의 달인',
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
      rating: 4.9,
      reviewCount: 128,
      responseRate: 98,
    },
    {
      id: 'host_2',
      name: '깔끔이사',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      rating: 4.7,
      reviewCount: 89,
      responseRate: 95,
    },
    {
      id: 'host_3',
      name: '프로클리닝',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rating: 4.8,
      reviewCount: 256,
      responseRate: 99,
    },
  ]

  const mockQuotes = mockHosts.map((host, index) => ({
    id: `quote_mock_${Date.now()}_${index}`,
    requestId,
    guestId,
    hostId: host.id,
    host: host,
    spaceName: `${host.name} 전문 서비스`,
    price: 150000 + (index * 30000),
    description: `안녕하세요, ${host.name}입니다. 요청하신 내용 확인했습니다. 꼼꼼하고 깔끔하게 작업해드리겠습니다.`,
    items: [
      { name: '기본 서비스', price: 100000 + (index * 20000) },
      { name: '추가 옵션', price: 50000 + (index * 10000) },
    ],
    estimatedDuration: `${2 + index}시간`,
    availableDate: '협의 후 결정',
    status: index === 0 ? '열람' : '미열람',
    createdAt: new Date(Date.now() - (index * 3600000)).toISOString(),
    updatedAt: new Date(Date.now() - (index * 3600000)).toISOString(),
  }))

  // 저장
  const existingQuotes = getAllQuotes()
  const newQuotes = [...existingQuotes, ...mockQuotes]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuotes))

  return mockQuotes
}

// 요청에 대한 견적이 있는지 확인
export function hasQuotesForRequest(requestId) {
  const quotes = getQuotesByRequest(requestId)
  return quotes.length > 0
}

// 요청별 견적 수 카운트
export function getQuoteCountByRequest(requestId) {
  const quotes = getQuotesByRequest(requestId)
  return quotes.length
}

export default {
  getAllQuotes,
  getQuotesByRequest,
  getQuotesForUser,
  getQuotesByHost,
  getQuote,
  createQuote,
  updateQuote,
  markQuoteAsRead,
  generateMockQuotes,
  hasQuotesForRequest,
  getQuoteCountByRequest,
}
