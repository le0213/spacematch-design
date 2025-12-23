// 게스트 취소/환불 관리 Store

const STORAGE_KEY = 'spacematch_refunds'

// 환불 상태
export const REFUND_STATUS = {
  REQUESTED: '취소요청',
  PROCESSING: '환불진행중',
  COMPLETED: '환불완료',
  REJECTED: '환불거절',
}

// Mock 데이터
const initialRefunds = [
  {
    id: 'refund_1',
    paymentId: 'pay_refund_1',
    guestId: 'user_mock_1',
    guestName: '김민수',
    hostId: 'host-4',
    hostName: '성수 스튜디오',
    spaceName: '성수 루프탑 파티룸',
    spaceImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    originalAmount: 180000,
    refundAmount: 180000,
    refundReason: '일정 변경',
    status: REFUND_STATUS.COMPLETED,
    requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    useDate: '2024-12-28',
  },
  {
    id: 'refund_2',
    paymentId: 'pay_refund_2',
    guestId: 'user_mock_1',
    guestName: '김민수',
    hostId: 'host-5',
    hostName: '잠실 세미나룸',
    spaceName: '잠실 비즈니스 센터',
    spaceImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400',
    originalAmount: 120000,
    refundAmount: 84000,
    refundReason: '호스트 요청',
    refundNote: '호스트 사정으로 인한 취소, 70% 환불',
    status: REFUND_STATUS.PROCESSING,
    requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expectedRefundDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    useDate: '2025-01-05',
  },
]

// 초기화
function initRefunds() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRefunds))
  }
}

// 모든 환불 조회
export function getAllRefunds() {
  initRefunds()
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// 사용자별 환불 조회
export function getRefundsForUser(userId) {
  const refunds = getAllRefunds()
  return refunds.filter(r => r.guestId === userId).sort(
    (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
  )
}

// 단일 환불 조회
export function getRefund(refundId) {
  const refunds = getAllRefunds()
  return refunds.find(r => r.id === refundId)
}

// 환불 요청 생성
export function createRefundRequest(paymentData, reason) {
  const refunds = getAllRefunds()

  const newRefund = {
    id: `refund_${Date.now()}`,
    paymentId: paymentData.id,
    guestId: paymentData.guestId,
    guestName: paymentData.guestName,
    hostId: paymentData.hostId,
    hostName: paymentData.hostName,
    spaceName: paymentData.spaceName,
    spaceImage: paymentData.spaceImage,
    originalAmount: paymentData.totalAmount,
    refundAmount: null, // 확정 전
    refundReason: reason,
    status: REFUND_STATUS.REQUESTED,
    requestedAt: new Date().toISOString(),
    useDate: paymentData.useDate,
  }

  refunds.push(newRefund)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(refunds))

  return newRefund
}

// 환불 상태 업데이트
export function updateRefundStatus(refundId, status, additionalData = {}) {
  const refunds = getAllRefunds()
  const index = refunds.findIndex(r => r.id === refundId)

  if (index === -1) {
    throw new Error('환불 정보를 찾을 수 없습니다.')
  }

  refunds[index] = {
    ...refunds[index],
    status,
    ...additionalData,
    updatedAt: new Date().toISOString(),
    ...(status === REFUND_STATUS.COMPLETED && { completedAt: new Date().toISOString() }),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(refunds))
  return refunds[index]
}

// 금액 포맷팅
export function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

export default {
  getAllRefunds,
  getRefundsForUser,
  getRefund,
  createRefundRequest,
  updateRefundStatus,
  formatPrice,
  REFUND_STATUS,
}
