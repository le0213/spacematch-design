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
      name: '강남 프리미엄 회의실',
      profileImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop',
      rating: 4.9,
      reviewCount: 128,
      responseRate: 98,
    },
    {
      id: 'host_2',
      name: '홍대 스튜디오',
      profileImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&h=100&fit=crop',
      rating: 4.7,
      reviewCount: 89,
      responseRate: 95,
    },
    {
      id: 'host_3',
      name: '성수 파티룸',
      profileImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&h=100&fit=crop',
      rating: 4.8,
      reviewCount: 256,
      responseRate: 99,
    },
  ]

  const mockDescriptions = [
    '안녕하세요! 강남역 3번 출구에서 도보 3분 거리에 위치한 프리미엄 회의실입니다. 최대 20명 수용 가능하며, 빔프로젝터와 화이트보드를 무료로 제공해드립니다.',
    '안녕하세요! 홍대입구역 인근 감성 스튜디오입니다. 촬영, 소규모 세미나, 워크숍에 최적화된 공간이에요. 자연광이 잘 들어와 촬영하기 좋습니다.',
    '안녕하세요! 성수역 근처 파티룸입니다. 최대 30명까지 수용 가능하고, 음향 장비와 조명이 완비되어 있어요. 생일파티, 팀 행사에 딱입니다!',
  ]

  const mockItems = [
    [
      { name: '공간 대여료 (4시간)', price: 120000 },
      { name: '빔프로젝터 사용', price: 0 },
      { name: '음료 서비스', price: 30000 },
    ],
    [
      { name: '공간 대여료 (3시간)', price: 90000 },
      { name: '촬영 장비 대여', price: 50000 },
      { name: '추가 조명 세트', price: 20000 },
    ],
    [
      { name: '공간 대여료 (5시간)', price: 200000 },
      { name: '음향 장비', price: 30000 },
      { name: '파티 소품 세트', price: 20000 },
    ],
  ]

  const mockQuotes = mockHosts.map((host, index) => ({
    id: `quote_mock_${Date.now()}_${index}`,
    requestId,
    guestId,
    hostId: host.id,
    host: host,
    spaceName: host.name,
    price: mockItems[index].reduce((sum, item) => sum + item.price, 0),
    description: mockDescriptions[index],
    items: mockItems[index],
    estimatedDuration: `${3 + index}시간`,
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
