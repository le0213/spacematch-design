// LocalStorage 기반 결제 관리

const STORAGE_KEY = 'spacematch_payments'

// 결제 상태 enum
export const PAYMENT_STATUS = {
  PENDING: '결제대기',
  COMPLETED: '결제완료',
  CANCELLED: '결제취소',
  REFUNDED: '결제환불',
}

// 모든 결제 가져오기
export function getAllPayments() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// 사용자별 결제 가져오기
export function getPaymentsForUser(userId) {
  const payments = getAllPayments()
  return payments.filter(p => p.guestId === userId)
}

// 호스트별 결제 가져오기
export function getPaymentsForHost(hostId) {
  const payments = getAllPayments()
  return payments.filter(p => p.hostId === hostId)
}

// 단일 결제 가져오기
export function getPayment(paymentId) {
  const payments = getAllPayments()
  return payments.find(p => p.id === paymentId)
}

// 견적 기반 결제 가져오기
export function getPaymentByQuote(quoteId) {
  const payments = getAllPayments()
  return payments.find(p => p.quoteId === quoteId)
}

// 새 결제 생성
export function createPayment(paymentData) {
  const payments = getAllPayments()

  const serviceFee = Math.round(paymentData.amount * 0.05) // 5% 수수료
  const totalAmount = paymentData.amount + serviceFee

  const newPayment = {
    id: `pay_${Date.now()}`,
    ...paymentData,
    serviceFee,
    totalAmount,
    status: PAYMENT_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  payments.push(newPayment)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments))

  return newPayment
}

// 결제 상태 업데이트
export function updatePaymentStatus(paymentId, status) {
  const payments = getAllPayments()
  const index = payments.findIndex(p => p.id === paymentId)

  if (index === -1) {
    throw new Error('결제를 찾을 수 없습니다.')
  }

  payments[index] = {
    ...payments[index],
    status,
    updatedAt: new Date().toISOString(),
    ...(status === PAYMENT_STATUS.COMPLETED && { paidAt: new Date().toISOString() }),
    ...(status === PAYMENT_STATUS.CANCELLED && { cancelledAt: new Date().toISOString() }),
    ...(status === PAYMENT_STATUS.REFUNDED && { refundedAt: new Date().toISOString() }),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments))
  return payments[index]
}

// 결제 완료 처리
export function completePayment(paymentId, paymentMethod) {
  const payments = getAllPayments()
  const index = payments.findIndex(p => p.id === paymentId)

  if (index === -1) {
    throw new Error('결제를 찾을 수 없습니다.')
  }

  payments[index] = {
    ...payments[index],
    status: PAYMENT_STATUS.COMPLETED,
    paymentMethod,
    paidAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    receiptUrl: `https://mock-receipt.spacematch.kr/${paymentId}`,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments))
  return payments[index]
}

// 결제 취소
export function cancelPayment(paymentId, reason) {
  const payments = getAllPayments()
  const index = payments.findIndex(p => p.id === paymentId)

  if (index === -1) {
    throw new Error('결제를 찾을 수 없습니다.')
  }

  payments[index] = {
    ...payments[index],
    status: PAYMENT_STATUS.CANCELLED,
    cancelReason: reason,
    cancelledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments))
  return payments[index]
}

// 환불 처리
export function refundPayment(paymentId, reason, refundAmount) {
  const payments = getAllPayments()
  const index = payments.findIndex(p => p.id === paymentId)

  if (index === -1) {
    throw new Error('결제를 찾을 수 없습니다.')
  }

  payments[index] = {
    ...payments[index],
    status: PAYMENT_STATUS.REFUNDED,
    refundReason: reason,
    refundAmount: refundAmount || payments[index].totalAmount,
    refundedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments))
  return payments[index]
}

// 결제 수단 목록
export const PAYMENT_METHODS = [
  { id: 'card', name: '신용/체크카드', icon: 'CreditCard' },
  { id: 'bank', name: '계좌이체', icon: 'Building' },
  { id: 'kakao', name: '카카오페이', icon: 'MessageCircle' },
  { id: 'naver', name: '네이버페이', icon: 'Wallet' },
  { id: 'toss', name: '토스', icon: 'Smartphone' },
]

// 금액 포맷팅
export function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

export default {
  getAllPayments,
  getPaymentsForUser,
  getPaymentsForHost,
  getPayment,
  getPaymentByQuote,
  createPayment,
  updatePaymentStatus,
  completePayment,
  cancelPayment,
  refundPayment,
  formatPrice,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
}
