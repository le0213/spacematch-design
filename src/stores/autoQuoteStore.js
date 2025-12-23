// LocalStorage 기반 바로견적 설정 관리

const STORAGE_KEY = 'spacematch_auto_quote_settings'
const LOG_KEY = 'spacematch_auto_quote_logs'

// 기본 설정값
const DEFAULT_SETTINGS = {
  enabled: false,
  templateId: null,
  templateName: '',
  templatePrice: 0,
  templateDescription: '',
  conditions: {
    regions: [], // ['강남', '서초', '송파']
    days: [], // ['월', '화', '수', '목', '금', '토', '일']
    timeSlots: [], // ['오전', '오후', '저녁']
    minPeople: 1,
    maxPeople: 100,
    purposes: [], // ['회의', '워크숍', '촬영', '파티']
  },
  limits: {
    maxDailyQuotes: 10,
    maxDailyBudget: 10000, // 캐시 단위
  },
  todayStats: {
    quotesCount: 0,
    budgetUsed: 0,
    lastResetDate: new Date().toDateString(),
  },
}

// 지역 옵션
export const REGION_OPTIONS = [
  '강남', '서초', '송파', '강동', '강서', '마포', '용산', '종로',
  '중구', '성동', '광진', '동대문', '중랑', '성북', '노원', '도봉',
  '은평', '서대문', '구로', '금천', '영등포', '동작', '관악', '양천',
]

// 요일 옵션
export const DAY_OPTIONS = ['월', '화', '수', '목', '금', '토', '일']

// 시간대 옵션
export const TIME_SLOT_OPTIONS = [
  { value: 'morning', label: '오전 (06:00-12:00)' },
  { value: 'afternoon', label: '오후 (12:00-18:00)' },
  { value: 'evening', label: '저녁 (18:00-24:00)' },
]

// 목적 옵션
export const PURPOSE_OPTIONS = [
  '회의', '워크숍', '세미나', '촬영', '파티', '연습', '스터디', '기타'
]

// 모든 설정 가져오기
export function getAllAutoQuoteSettings() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : {}
}

// 호스트별 설정 가져오기
export function getAutoQuoteSettings(hostId) {
  const allSettings = getAllAutoQuoteSettings()
  const settings = allSettings[hostId] || { ...DEFAULT_SETTINGS }

  // 날짜가 바뀌면 일일 통계 리셋
  const today = new Date().toDateString()
  if (settings.todayStats?.lastResetDate !== today) {
    settings.todayStats = {
      quotesCount: 0,
      budgetUsed: 0,
      lastResetDate: today,
    }
  }

  return settings
}

// 설정 저장
export function saveAutoQuoteSettings(hostId, settings) {
  const allSettings = getAllAutoQuoteSettings()
  allSettings[hostId] = {
    ...DEFAULT_SETTINGS,
    ...settings,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings))
  return allSettings[hostId]
}

// 바로견적 ON/OFF 토글
export function toggleAutoQuote(hostId, enabled) {
  const settings = getAutoQuoteSettings(hostId)
  settings.enabled = enabled
  return saveAutoQuoteSettings(hostId, settings)
}

// 조건 매칭 체크
export function checkAutoQuoteMatch(request, hostId) {
  const settings = getAutoQuoteSettings(hostId)

  // 바로견적이 꺼져있으면 false
  if (!settings.enabled) {
    return { match: false, reason: 'disabled' }
  }

  // 일일 한도 체크
  if (settings.todayStats.quotesCount >= settings.limits.maxDailyQuotes) {
    return { match: false, reason: 'daily_quote_limit' }
  }

  if (settings.todayStats.budgetUsed >= settings.limits.maxDailyBudget) {
    return { match: false, reason: 'daily_budget_limit' }
  }

  const { conditions } = settings
  const summary = request.summary || {}

  // 지역 체크
  if (conditions.regions.length > 0) {
    const requestRegion = summary.region || ''
    const regionMatch = conditions.regions.some(r => requestRegion.includes(r))
    if (!regionMatch) {
      return { match: false, reason: 'region_mismatch' }
    }
  }

  // 요일 체크
  if (conditions.days.length > 0 && summary.date) {
    const requestDate = new Date(summary.date)
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']
    const requestDay = dayNames[requestDate.getDay()]
    if (!conditions.days.includes(requestDay)) {
      return { match: false, reason: 'day_mismatch' }
    }
  }

  // 인원 체크
  const requestPeople = parseInt(summary.people) || 0
  if (requestPeople < conditions.minPeople || requestPeople > conditions.maxPeople) {
    return { match: false, reason: 'people_mismatch' }
  }

  // 목적 체크
  if (conditions.purposes.length > 0) {
    const requestPurpose = summary.purpose || ''
    const purposeMatch = conditions.purposes.some(p =>
      requestPurpose.toLowerCase().includes(p.toLowerCase())
    )
    if (!purposeMatch) {
      return { match: false, reason: 'purpose_mismatch' }
    }
  }

  return { match: true }
}

// 자동 견적 발행 (시뮬레이션)
export function executeAutoQuote(request, hostId, spaceInfo) {
  const settings = getAutoQuoteSettings(hostId)
  const matchResult = checkAutoQuoteMatch(request, hostId)

  if (!matchResult.match) {
    return {
      success: false,
      reason: matchResult.reason,
    }
  }

  // 견적 비용 (1,000원)
  const quoteCost = 1000

  // 일일 통계 업데이트
  settings.todayStats.quotesCount += 1
  settings.todayStats.budgetUsed += quoteCost
  saveAutoQuoteSettings(hostId, settings)

  // 로그 저장
  addAutoQuoteLog(hostId, {
    requestId: request.id,
    spaceName: spaceInfo?.name || '내 공간',
    price: settings.templatePrice,
    cost: quoteCost,
    success: true,
  })

  // 자동 생성된 견적 정보 반환
  return {
    success: true,
    quote: {
      id: `auto_quote_${Date.now()}`,
      requestId: request.id,
      hostId,
      spaceName: spaceInfo?.name || settings.templateName || '내 공간',
      price: settings.templatePrice,
      description: settings.templateDescription || '바로견적으로 자동 발행된 견적입니다.',
      isAutoQuote: true,
      createdAt: new Date().toISOString(),
    },
    cost: quoteCost,
  }
}

// 예상 캐시 소모량 계산
export function calculateExpectedCost(settings) {
  // 일일 최대 발행 수 * 1,000원
  const maxDailyCost = settings.limits.maxDailyQuotes * 1000
  // 또는 일일 예산 중 작은 값
  return Math.min(maxDailyCost, settings.limits.maxDailyBudget)
}

// 자동견적 로그 관련 함수
export function getAllAutoQuoteLogs() {
  const data = localStorage.getItem(LOG_KEY)
  return data ? JSON.parse(data) : []
}

export function getAutoQuoteLogsForHost(hostId) {
  const logs = getAllAutoQuoteLogs()
  return logs.filter(log => log.hostId === hostId)
}

export function addAutoQuoteLog(hostId, logData) {
  const logs = getAllAutoQuoteLogs()
  const newLog = {
    id: `log_${Date.now()}`,
    hostId,
    ...logData,
    createdAt: new Date().toISOString(),
  }
  logs.push(newLog)
  localStorage.setItem(LOG_KEY, JSON.stringify(logs))
  return newLog
}

// 견적 템플릿 관련 - quoteTemplateStore에서 가져오기
export function getQuoteTemplates(hostId) {
  // quoteTemplateStore에서 자주 쓰는 견적 가져오기
  const QUOTE_TEMPLATE_KEY = 'spacematch_quote_templates'
  const data = localStorage.getItem(QUOTE_TEMPLATE_KEY)
  if (data) {
    const templates = JSON.parse(data)
    const hostTemplates = templates.filter(t => t.hostId === hostId)
    // autoQuote에서 사용하는 형식으로 변환
    return hostTemplates.map(t => ({
      id: t.id,
      name: t.name,
      price: t.totalPrice,
      description: t.description,
      items: t.items,
      estimatedDuration: t.estimatedDuration,
      isDefault: t.isDefault,
    }))
  }
  // 기본 템플릿 반환
  return [
    {
      id: 'template_default_1',
      name: '기본 견적',
      price: 100000,
      description: '기본 서비스 견적입니다.',
      isDefault: true,
    },
  ]
}

export default {
  REGION_OPTIONS,
  DAY_OPTIONS,
  TIME_SLOT_OPTIONS,
  PURPOSE_OPTIONS,
  getAutoQuoteSettings,
  saveAutoQuoteSettings,
  toggleAutoQuote,
  checkAutoQuoteMatch,
  executeAutoQuote,
  calculateExpectedCost,
  getAutoQuoteLogsForHost,
  getQuoteTemplates,
}
