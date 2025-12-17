// LocalStorage 기반 견적 요청 관리

const STORAGE_KEY = 'spacematch_requests'

// 모든 요청 가져오기
export function getAllRequests() {
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
  const requests = getAllRequests()

  const newRequest = {
    id: `req_${Date.now()}`,
    ...requestData,
    status: '대기중', // 대기중 | 견적서 발송 완료
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  requests.push(newRequest)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))

  return newRequest
}

// 요청 업데이트
export function updateRequest(requestId, updates) {
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
  const requests = getAllRequests()
  const filtered = requests.filter(r => r.id !== requestId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

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

export default {
  getAllRequests,
  getUserRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  getRequestsByStatus,
  getPendingRequestsForHost,
}
