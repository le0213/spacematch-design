// 캐시/포인트 지갑 관리 Store

const WALLET_KEY = 'spacematch_wallet'
const CASH_HISTORY_KEY = 'spacematch_cash_history'
const AUTO_CHARGE_KEY = 'spacematch_auto_charge'

// 초기 Mock 데이터
const initialWallet = {
  'host-1': { cash: 50000, point: 3000 }
}

const initialHistory = {
  'host-1': [
    {
      id: 'ch-1',
      type: 'charge',
      amount: 50000,
      balance: 50000,
      method: '카드결제',
      description: '캐시 충전',
      createdAt: '2024-12-18T10:00:00Z'
    },
    {
      id: 'ch-2',
      type: 'use',
      amount: -5000,
      balance: 45000,
      description: '바로견적 발송 (김민수님)',
      createdAt: '2024-12-19T14:30:00Z'
    },
    {
      id: 'ch-3',
      type: 'charge',
      amount: 10000,
      balance: 55000,
      method: '카드결제',
      description: '캐시 충전',
      createdAt: '2024-12-20T09:00:00Z'
    },
    {
      id: 'ch-4',
      type: 'use',
      amount: -5000,
      balance: 50000,
      description: '바로견적 발송 (박지영님)',
      createdAt: '2024-12-21T11:20:00Z'
    }
  ]
}

const initialAutoCharge = {
  'host-1': {
    enabled: false,
    thresholdAmount: 10000,
    chargeAmount: 30000,
    paymentMethod: null
  }
}

// 초기화
function initWallet() {
  if (!localStorage.getItem(WALLET_KEY)) {
    localStorage.setItem(WALLET_KEY, JSON.stringify(initialWallet))
  }
  if (!localStorage.getItem(CASH_HISTORY_KEY)) {
    localStorage.setItem(CASH_HISTORY_KEY, JSON.stringify(initialHistory))
  }
  if (!localStorage.getItem(AUTO_CHARGE_KEY)) {
    localStorage.setItem(AUTO_CHARGE_KEY, JSON.stringify(initialAutoCharge))
  }
}

// 지갑 잔액 조회
export function getWalletBalance(hostId) {
  initWallet()
  const wallets = JSON.parse(localStorage.getItem(WALLET_KEY))
  return wallets[hostId] || { cash: 0, point: 0 }
}

// 캐시 내역 조회
export function getCashHistory(hostId, filter = 'all') {
  initWallet()
  const histories = JSON.parse(localStorage.getItem(CASH_HISTORY_KEY))
  let hostHistory = histories[hostId] || []

  if (filter === 'charge') {
    hostHistory = hostHistory.filter(h => h.type === 'charge')
  } else if (filter === 'use') {
    hostHistory = hostHistory.filter(h => h.type === 'use')
  }

  return hostHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// 캐시 충전
export function addCashCharge(hostId, amount, method = '카드결제') {
  initWallet()

  // 잔액 업데이트
  const wallets = JSON.parse(localStorage.getItem(WALLET_KEY))
  if (!wallets[hostId]) {
    wallets[hostId] = { cash: 0, point: 0 }
  }
  wallets[hostId].cash += amount
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallets))

  // 내역 추가
  const histories = JSON.parse(localStorage.getItem(CASH_HISTORY_KEY))
  if (!histories[hostId]) {
    histories[hostId] = []
  }

  const newHistory = {
    id: `ch-${Date.now()}`,
    type: 'charge',
    amount: amount,
    balance: wallets[hostId].cash,
    method: method,
    description: '캐시 충전',
    createdAt: new Date().toISOString()
  }

  histories[hostId].unshift(newHistory)
  localStorage.setItem(CASH_HISTORY_KEY, JSON.stringify(histories))

  return { success: true, balance: wallets[hostId].cash }
}

// 캐시 차감
export function deductCash(hostId, amount, reason = '서비스 이용') {
  initWallet()

  const wallets = JSON.parse(localStorage.getItem(WALLET_KEY))
  if (!wallets[hostId] || wallets[hostId].cash < amount) {
    return { success: false, message: '잔액이 부족합니다' }
  }

  wallets[hostId].cash -= amount
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallets))

  // 내역 추가
  const histories = JSON.parse(localStorage.getItem(CASH_HISTORY_KEY))
  if (!histories[hostId]) {
    histories[hostId] = []
  }

  const newHistory = {
    id: `ch-${Date.now()}`,
    type: 'use',
    amount: -amount,
    balance: wallets[hostId].cash,
    description: reason,
    createdAt: new Date().toISOString()
  }

  histories[hostId].unshift(newHistory)
  localStorage.setItem(CASH_HISTORY_KEY, JSON.stringify(histories))

  return { success: true, balance: wallets[hostId].cash }
}

// 자동충전 설정 조회
export function getAutoChargeSettings(hostId) {
  initWallet()
  const settings = JSON.parse(localStorage.getItem(AUTO_CHARGE_KEY))
  return settings[hostId] || {
    enabled: false,
    thresholdAmount: 10000,
    chargeAmount: 30000,
    paymentMethod: null
  }
}

// 자동충전 설정 저장
export function saveAutoChargeSettings(hostId, newSettings) {
  initWallet()
  const settings = JSON.parse(localStorage.getItem(AUTO_CHARGE_KEY))
  settings[hostId] = {
    ...settings[hostId],
    ...newSettings
  }
  localStorage.setItem(AUTO_CHARGE_KEY, JSON.stringify(settings))
  return { success: true }
}

// 포인트 추가
export function addPoint(hostId, amount, reason = '포인트 적립') {
  initWallet()

  const wallets = JSON.parse(localStorage.getItem(WALLET_KEY))
  if (!wallets[hostId]) {
    wallets[hostId] = { cash: 0, point: 0 }
  }
  wallets[hostId].point += amount
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallets))

  return { success: true, point: wallets[hostId].point }
}

// 가격 포맷팅
export function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price)
}
