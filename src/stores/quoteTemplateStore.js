// 견적 템플릿 관리 Store

const QUOTE_TEMPLATE_KEY = 'spacematch_quote_templates'

// ============ Mock 데이터 ============

const initialTemplates = [
  {
    id: 'template_mock_1',
    hostId: 'host-1',
    name: '기본 견적',
    spaceName: '청소의 달인',
    description: '기본 서비스 및 추가 옵션 포함 견적서입니다.',
    items: [
      { name: '기본 서비스', price: 100000 },
      { name: '추가 옵션', price: 50000 }
    ],
    totalPrice: 150000,
    estimatedDuration: '4시간',
    isDefault: true,
    usageCount: 12,
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z'
  },
  {
    id: 'template_mock_2',
    hostId: 'host-1',
    name: '프리미엄 패키지',
    spaceName: '청소의 달인',
    description: '프리미엄 서비스가 포함된 패키지입니다.',
    items: [
      { name: '기본 서비스', price: 150000 },
      { name: '프리미엄 옵션', price: 100000 },
      { name: '특별 서비스', price: 50000 }
    ],
    totalPrice: 300000,
    estimatedDuration: '6시간',
    isDefault: false,
    usageCount: 5,
    createdAt: '2024-11-10T09:00:00Z',
    updatedAt: '2024-12-10T11:00:00Z'
  },
  {
    id: 'template_mock_3',
    hostId: 'host-1',
    name: '스튜디오 촬영',
    spaceName: '강남 스튜디오',
    description: '스튜디오 촬영 기본 패키지입니다.',
    items: [
      { name: '기본 서비스', price: 200000 },
      { name: '장비 대여', price: 50000 }
    ],
    totalPrice: 250000,
    estimatedDuration: '4시간',
    isDefault: false,
    usageCount: 3,
    createdAt: '2024-11-20T15:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z'
  },
  {
    id: 'template_mock_4',
    hostId: 'host-1',
    name: '파티룸 기본',
    spaceName: '홍대 파티룸',
    description: '소규모 파티에 적합한 기본 패키지입니다.',
    items: [
      { name: '기본 서비스', price: 80000 },
      { name: '추가 옵션', price: 20000 }
    ],
    totalPrice: 100000,
    estimatedDuration: '4시간',
    isDefault: false,
    usageCount: 8,
    createdAt: '2024-12-01T12:00:00Z',
    updatedAt: '2024-12-18T09:00:00Z'
  }
]

// ============ 초기화 ============

function initTemplates() {
  if (!localStorage.getItem(QUOTE_TEMPLATE_KEY)) {
    localStorage.setItem(QUOTE_TEMPLATE_KEY, JSON.stringify(initialTemplates))
  }
}

// ============ CRUD 함수 ============

// 모든 템플릿 가져오기
export function getAllTemplates() {
  initTemplates()
  const data = localStorage.getItem(QUOTE_TEMPLATE_KEY)
  return data ? JSON.parse(data) : []
}

// 호스트별 템플릿 가져오기
export function getTemplatesByHost(hostId) {
  const templates = getAllTemplates()
  return templates
    .filter(t => t.hostId === hostId)
    .sort((a, b) => {
      // 기본 템플릿을 먼저, 그 다음 사용 횟수 순
      if (a.isDefault && !b.isDefault) return -1
      if (!a.isDefault && b.isDefault) return 1
      return b.usageCount - a.usageCount
    })
}

// 단일 템플릿 가져오기
export function getTemplate(templateId) {
  const templates = getAllTemplates()
  return templates.find(t => t.id === templateId) || null
}

// 기본 템플릿 가져오기
export function getDefaultTemplate(hostId) {
  const templates = getTemplatesByHost(hostId)
  return templates.find(t => t.isDefault) || null
}

// 템플릿 생성
export function createTemplate(templateData) {
  initTemplates()
  const templates = getAllTemplates()

  // 새 템플릿이 기본으로 설정되면 기존 기본 해제
  if (templateData.isDefault) {
    templates.forEach(t => {
      if (t.hostId === templateData.hostId) {
        t.isDefault = false
      }
    })
  }

  const newTemplate = {
    id: `template_${Date.now()}`,
    ...templateData,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  templates.push(newTemplate)
  localStorage.setItem(QUOTE_TEMPLATE_KEY, JSON.stringify(templates))

  return newTemplate
}

// 템플릿 수정
export function updateTemplate(templateId, updates) {
  initTemplates()
  const templates = getAllTemplates()
  const index = templates.findIndex(t => t.id === templateId)

  if (index === -1) {
    throw new Error('템플릿을 찾을 수 없습니다.')
  }

  const template = templates[index]

  // 기본 템플릿으로 변경 시 기존 기본 해제
  if (updates.isDefault && !template.isDefault) {
    templates.forEach(t => {
      if (t.hostId === template.hostId && t.id !== templateId) {
        t.isDefault = false
      }
    })
  }

  templates[index] = {
    ...template,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  localStorage.setItem(QUOTE_TEMPLATE_KEY, JSON.stringify(templates))
  return templates[index]
}

// 템플릿 삭제
export function deleteTemplate(templateId) {
  initTemplates()
  const templates = getAllTemplates()
  const filtered = templates.filter(t => t.id !== templateId)

  localStorage.setItem(QUOTE_TEMPLATE_KEY, JSON.stringify(filtered))
  return { success: true }
}

// 템플릿 사용 횟수 증가
export function incrementUsageCount(templateId) {
  initTemplates()
  const templates = getAllTemplates()
  const index = templates.findIndex(t => t.id === templateId)

  if (index !== -1) {
    templates[index].usageCount += 1
    templates[index].updatedAt = new Date().toISOString()
    localStorage.setItem(QUOTE_TEMPLATE_KEY, JSON.stringify(templates))
  }

  return templates[index] || null
}

// 기본 템플릿 설정
export function setDefaultTemplate(hostId, templateId) {
  initTemplates()
  const templates = getAllTemplates()

  templates.forEach(t => {
    if (t.hostId === hostId) {
      t.isDefault = t.id === templateId
      if (t.id === templateId) {
        t.updatedAt = new Date().toISOString()
      }
    }
  })

  localStorage.setItem(QUOTE_TEMPLATE_KEY, JSON.stringify(templates))

  return templates.find(t => t.id === templateId) || null
}

// ============ 유틸리티 함수 ============

// 템플릿에서 견적 데이터 생성
export function createQuoteFromTemplate(template, overrides = {}) {
  return {
    spaceName: template.spaceName,
    description: template.description,
    items: [...template.items],
    totalPrice: template.totalPrice,
    estimatedDuration: template.estimatedDuration,
    templateId: template.id,
    ...overrides
  }
}

// 금액 포맷팅
export function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

// 항목 개수 텍스트
export function getItemCountText(items) {
  return `${items.length}개 항목`
}

export default {
  getAllTemplates,
  getTemplatesByHost,
  getTemplate,
  getDefaultTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementUsageCount,
  setDefaultTemplate,
  createQuoteFromTemplate,
  formatPrice,
  getItemCountText
}
