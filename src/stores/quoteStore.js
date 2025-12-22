// LocalStorage 기반 견적 관리

const STORAGE_KEY = 'spacematch_quotes'

// ============ Mock 데이터 초기화 ============

const initialMockQuotes = [
  {
    id: 'quote_mock_host_1',
    requestId: 'req_mock_3',
    guestId: 'user_mock_3',
    hostId: 'host-1',
    host: {
      id: 'host-1',
      name: '김호스트',
      profileImage: null,
      rating: 4.8,
      reviewCount: 45,
      responseRate: 95
    },
    spaceName: '홍대 파티룸',
    price: 220000,
    description: '안녕하세요! 송년회에 딱 맞는 파티룸입니다. 최대 20명까지 수용 가능하며, 고급 음향 시스템과 분위기 있는 조명을 제공합니다.',
    items: [
      { name: '파티룸 대여 (5시간)', price: 150000 },
      { name: '음향 시스템', price: 30000 },
      { name: '조명 연출', price: 20000 },
      { name: '주방 사용', price: 20000 }
    ],
    estimatedDuration: '5시간',
    availableDate: '2024-12-31',
    status: '열람',
    isAutoQuote: false,
    autoQuoteTemplateId: null,
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'quote_mock_host_2',
    requestId: 'req_mock_4',
    guestId: 'user_mock_4',
    hostId: 'host-1',
    host: {
      id: 'host-1',
      name: '김호스트',
      profileImage: null,
      rating: 4.8,
      reviewCount: 45,
      responseRate: 95
    },
    spaceName: '성수 연습실',
    price: 80000,
    description: '밴드 연습에 최적화된 방음 연습실입니다. 드럼, 앰프, 마이크 등 기본 장비가 완비되어 있습니다.',
    items: [
      { name: '연습실 대여 (3시간)', price: 60000 },
      { name: '드럼 세트', price: 0 },
      { name: '앰프 3대', price: 0 },
      { name: '마이크 4개', price: 20000 }
    ],
    estimatedDuration: '3시간',
    availableDate: '2025-01-05',
    status: '미열람',
    isAutoQuote: true,
    autoQuoteTemplateId: 'template_mock_4',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'quote_mock_host_3',
    requestId: 'req_mock_6',
    guestId: 'user_mock_6',
    hostId: 'host-1',
    host: {
      id: 'host-1',
      name: '김호스트',
      profileImage: null,
      rating: 4.8,
      reviewCount: 45,
      responseRate: 95
    },
    spaceName: '강남 스튜디오',
    price: 350000,
    description: '유튜브 촬영에 특화된 프리미엄 스튜디오입니다. 그린스크린, 전문 조명, 고급 카메라 장비를 제공합니다.',
    items: [
      { name: '스튜디오 대여 (6시간)', price: 250000 },
      { name: '그린스크린', price: 0 },
      { name: '조명 장비 세트', price: 50000 },
      { name: '편집실 사용 (2시간)', price: 50000 }
    ],
    estimatedDuration: '6시간',
    availableDate: '2025-01-15',
    status: '열람',
    isAutoQuote: true,
    autoQuoteTemplateId: 'template_mock_2',
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  }
]

// 초기화 함수
function initQuotes() {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockQuotes))
  }
}

// ============ 기본 CRUD ============

// 모든 견적 가져오기
export function getAllQuotes() {
  initQuotes()
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
  initQuotes()
  const quotes = getAllQuotes()

  const newQuote = {
    id: `quote_${Date.now()}`,
    ...quoteData,
    status: '미열람', // 미열람 | 열람
    isAutoQuote: quoteData.isAutoQuote || false,
    autoQuoteTemplateId: quoteData.autoQuoteTemplateId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  quotes.push(newQuote)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes))

  return newQuote
}

// 견적 업데이트
export function updateQuote(quoteId, updates) {
  initQuotes()
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

// ============ 바로견적 관련 ============

// 바로견적 여부 확인
export function isAutoQuote(quoteId) {
  const quote = getQuote(quoteId)
  return quote?.isAutoQuote || false
}

// 호스트의 바로견적 목록
export function getAutoQuotesByHost(hostId) {
  const quotes = getQuotesByHost(hostId)
  return quotes.filter(q => q.isAutoQuote)
}

// 요청에 대해 호스트가 이미 견적을 보냈는지 확인
export function hasHostQuotedRequest(hostId, requestId) {
  const quotes = getAllQuotes()
  return quotes.some(q => q.hostId === hostId && q.requestId === requestId)
}

// 호스트가 특정 요청에 보낸 견적 가져오기
export function getHostQuoteForRequest(hostId, requestId) {
  const quotes = getAllQuotes()
  return quotes.find(q => q.hostId === hostId && q.requestId === requestId)
}

// ============ Mock 데이터 생성 ============

// Mock 데이터 생성 (테스트용 - 게스트 화면)
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
    isAutoQuote: index === 1, // 두 번째 견적은 바로견적으로 표시
    autoQuoteTemplateId: index === 1 ? 'template_mock_1' : null,
    createdAt: new Date(Date.now() - (index * 3600000)).toISOString(),
    updatedAt: new Date(Date.now() - (index * 3600000)).toISOString(),
  }))

  // 저장
  const existingQuotes = getAllQuotes()
  const newQuotes = [...existingQuotes, ...mockQuotes]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuotes))

  return mockQuotes
}

// ============ 유틸리티 ============

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

// 금액 포맷팅
export function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
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
  isAutoQuote,
  getAutoQuotesByHost,
  hasHostQuotedRequest,
  getHostQuoteForRequest,
  generateMockQuotes,
  hasQuotesForRequest,
  getQuoteCountByRequest,
  formatPrice
}
