// 정산 관리 Store

const SETTLEMENT_KEY = 'spacematch_settlements'
const BANK_ACCOUNT_KEY = 'spacematch_bank_accounts'

// 은행 목록
export const BANK_LIST = [
  { code: 'KB', name: 'KB국민은행' },
  { code: 'SHINHAN', name: '신한은행' },
  { code: 'WOORI', name: '우리은행' },
  { code: 'HANA', name: '하나은행' },
  { code: 'NH', name: 'NH농협은행' },
  { code: 'IBK', name: 'IBK기업은행' },
  { code: 'SC', name: 'SC제일은행' },
  { code: 'KAKAO', name: '카카오뱅크' },
  { code: 'TOSS', name: '토스뱅크' },
  { code: 'KBANK', name: '케이뱅크' },
]

// 초기 Mock 데이터
const initialSettlements = {
  'host-1': [
    {
      id: 'stl-1',
      month: '2024-11',
      totalAmount: 850000,
      feeRate: 5,
      feeAmount: 42500,
      settlementAmount: 807500,
      transactionCount: 3,
      status: 'completed',
      settledAt: '2024-12-05T10:00:00Z',
      createdAt: '2024-12-01T00:00:00Z',
      transactions: [
        { id: 'txn-1', date: '2024-11-05', spaceName: '강남 스튜디오', guestName: '김○○', amount: 150000 },
        { id: 'txn-2', date: '2024-11-12', spaceName: '강남 스튜디오', guestName: '박○○', amount: 300000 },
        { id: 'txn-3', date: '2024-11-25', spaceName: '홍대 파티룸', guestName: '이○○', amount: 400000 },
      ]
    },
    {
      id: 'stl-2',
      month: '2024-12',
      totalAmount: 1200000,
      feeRate: 5,
      feeAmount: 60000,
      settlementAmount: 1140000,
      transactionCount: 5,
      status: 'pending',
      settledAt: null,
      createdAt: '2024-12-21T00:00:00Z',
      transactions: [
        { id: 'txn-4', date: '2024-12-05', spaceName: '강남 스튜디오', guestName: '최○○', amount: 180000 },
        { id: 'txn-5', date: '2024-12-08', spaceName: '서초 세미나실', guestName: '정○○', amount: 250000 },
        { id: 'txn-6', date: '2024-12-12', spaceName: '홍대 파티룸', guestName: '조○○', amount: 320000 },
        { id: 'txn-7', date: '2024-12-15', spaceName: '성수 연습실', guestName: '윤○○', amount: 200000 },
        { id: 'txn-8', date: '2024-12-20', spaceName: '용산 루프탑', guestName: '강○○', amount: 250000 },
      ]
    }
  ]
}

const initialBankAccounts = {
  'host-1': {
    bankCode: 'KAKAO',
    bankName: '카카오뱅크',
    accountNumber: '3333-01-1234567',
    accountHolder: '김호스트',
    isVerified: true,
    createdAt: '2024-11-01T10:00:00Z'
  }
}

// 초기화
function initSettlement() {
  if (!localStorage.getItem(SETTLEMENT_KEY)) {
    localStorage.setItem(SETTLEMENT_KEY, JSON.stringify(initialSettlements))
  }
  if (!localStorage.getItem(BANK_ACCOUNT_KEY)) {
    localStorage.setItem(BANK_ACCOUNT_KEY, JSON.stringify(initialBankAccounts))
  }
}

// 정산 요약 조회
export function getSettlementSummary(hostId) {
  initSettlement()
  const settlements = JSON.parse(localStorage.getItem(SETTLEMENT_KEY))
  const hostSettlements = settlements[hostId] || []

  // 현재 월 정산 대기 금액
  const currentMonth = new Date().toISOString().slice(0, 7)
  const pendingSettlement = hostSettlements.find(s => s.status === 'pending')

  // 총 정산 완료 금액
  const completedSettlements = hostSettlements.filter(s => s.status === 'completed')
  const totalSettled = completedSettlements.reduce((sum, s) => sum + s.settlementAmount, 0)

  // 다음 정산일 계산 (매월 5일)
  const now = new Date()
  let nextSettlementDate = new Date(now.getFullYear(), now.getMonth() + 1, 5)
  if (now.getDate() < 5) {
    nextSettlementDate = new Date(now.getFullYear(), now.getMonth(), 5)
  }

  return {
    pendingAmount: pendingSettlement?.settlementAmount || 0,
    pendingTransactions: pendingSettlement?.transactionCount || 0,
    totalSettled: totalSettled,
    nextSettlementDate: nextSettlementDate.toISOString().slice(0, 10),
    feeRate: 5
  }
}

// 정산 내역 조회
export function getSettlementHistory(hostId) {
  initSettlement()
  const settlements = JSON.parse(localStorage.getItem(SETTLEMENT_KEY))
  return (settlements[hostId] || []).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  )
}

// 정산 상세 조회
export function getSettlementDetail(hostId, settlementId) {
  initSettlement()
  const settlements = JSON.parse(localStorage.getItem(SETTLEMENT_KEY))
  const hostSettlements = settlements[hostId] || []
  return hostSettlements.find(s => s.id === settlementId) || null
}

// 계좌 정보 조회
export function getBankAccount(hostId) {
  initSettlement()
  const accounts = JSON.parse(localStorage.getItem(BANK_ACCOUNT_KEY))
  return accounts[hostId] || null
}

// 계좌 등록/수정
export function saveBankAccount(hostId, accountInfo) {
  initSettlement()
  const accounts = JSON.parse(localStorage.getItem(BANK_ACCOUNT_KEY))

  const bank = BANK_LIST.find(b => b.code === accountInfo.bankCode)

  accounts[hostId] = {
    bankCode: accountInfo.bankCode,
    bankName: bank?.name || accountInfo.bankCode,
    accountNumber: accountInfo.accountNumber,
    accountHolder: accountInfo.accountHolder,
    isVerified: false, // 실제로는 본인인증 필요
    createdAt: accounts[hostId]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  localStorage.setItem(BANK_ACCOUNT_KEY, JSON.stringify(accounts))
  return { success: true, account: accounts[hostId] }
}

// 가격 포맷팅
export function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}

// 월 포맷팅
export function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-')
  return `${year}년 ${parseInt(month)}월`
}
