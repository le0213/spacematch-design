// 사업자 정보 관리 Store

const BUSINESS_KEY = 'spacematch_business'

// ============ Mock 데이터 ============

const initialBusinessData = [
  {
    id: 'business_mock_1',
    hostId: 'host-1',
    // 운영상태
    operationStatus: 'active', // active | paused
    // 연락처
    phone: '010-1234-5678',
    email: 'host@example.com',
    // 사업자정보
    businessType: 'individual', // individual | corporate
    ownerName: '홍길동',
    businessName: '스페이스클라우드',
    businessNumber: '123-45-67890',
    businessAddress: '서울특별시 강남구 테헤란로 123',
    bankName: '신한은행',
    accountNumber: '110-123-456789',
    accountHolder: '홍길동',
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z'
  }
]

// ============ 초기화 ============

function initBusiness() {
  if (!localStorage.getItem(BUSINESS_KEY)) {
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(initialBusinessData))
  }
}

// ============ CRUD 함수 ============

// 모든 사업자 정보 가져오기
export function getAllBusiness() {
  initBusiness()
  const data = localStorage.getItem(BUSINESS_KEY)
  return data ? JSON.parse(data) : []
}

// 호스트별 사업자 정보 가져오기
export function getBusinessByHost(hostId) {
  const businesses = getAllBusiness()
  return businesses.find(b => b.hostId === hostId) || null
}

// 사업자 정보 생성
export function createBusiness(businessData) {
  initBusiness()
  const businesses = getAllBusiness()

  const newBusiness = {
    id: `business_${Date.now()}`,
    ...businessData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  businesses.push(newBusiness)
  localStorage.setItem(BUSINESS_KEY, JSON.stringify(businesses))

  return newBusiness
}

// 사업자 정보 수정
export function updateBusiness(hostId, updates) {
  initBusiness()
  const businesses = getAllBusiness()
  const index = businesses.findIndex(b => b.hostId === hostId)

  if (index === -1) {
    // 사업자 정보가 없으면 새로 생성
    return createBusiness({ hostId, ...updates })
  }

  businesses[index] = {
    ...businesses[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  localStorage.setItem(BUSINESS_KEY, JSON.stringify(businesses))
  return businesses[index]
}

// 운영 상태 변경
export function updateOperationStatus(hostId, status) {
  return updateBusiness(hostId, { operationStatus: status })
}

// 연락처 정보 수정
export function updateContactInfo(hostId, phone, email) {
  return updateBusiness(hostId, { phone, email })
}

// 사업자 정보 수정
export function updateBusinessInfo(hostId, businessInfo) {
  return updateBusiness(hostId, businessInfo)
}

// ============ 유틸리티 함수 ============

// 운영 상태 텍스트
export function getOperationStatusText(status) {
  switch (status) {
    case 'active':
      return '영업중'
    case 'paused':
      return '휴업중'
    default:
      return '미설정'
  }
}

// 사업자 유형 텍스트
export function getBusinessTypeText(type) {
  switch (type) {
    case 'individual':
      return '개인사업자'
    case 'corporate':
      return '법인사업자'
    default:
      return '미설정'
  }
}

// 사업자번호 포맷팅
export function formatBusinessNumber(number) {
  if (!number) return ''
  const cleaned = number.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`
  }
  return number
}

// 전화번호 포맷팅
export function formatPhoneNumber(number) {
  if (!number) return ''
  const cleaned = number.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return number
}

export default {
  getAllBusiness,
  getBusinessByHost,
  createBusiness,
  updateBusiness,
  updateOperationStatus,
  updateContactInfo,
  updateBusinessInfo,
  getOperationStatusText,
  getBusinessTypeText,
  formatBusinessNumber,
  formatPhoneNumber
}
