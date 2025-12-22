import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWalletBalance, addCashCharge, formatPrice } from '../../stores/walletStore'

export default function HostWalletCharge() {
  const navigate = useNavigate()
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState({ cash: 0, point: 0 })

  const hostId = 'host-1'

  useEffect(() => {
    setBalance(getWalletBalance(hostId))
  }, [])

  const presetAmounts = [
    { value: 10000, label: '1만원' },
    { value: 30000, label: '3만원' },
    { value: 50000, label: '5만원' },
    { value: 100000, label: '10만원' },
  ]

  const getChargeAmount = () => {
    if (selectedAmount) return selectedAmount
    const custom = parseInt(customAmount.replace(/,/g, ''))
    return isNaN(custom) ? 0 : custom
  }

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setSelectedAmount(null)
    setCustomAmount(value ? parseInt(value).toLocaleString() : '')
  }

  const handlePresetClick = (amount) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCharge = async () => {
    const amount = getChargeAmount()
    if (amount < 1000) {
      alert('최소 충전 금액은 1,000원입니다')
      return
    }

    setIsLoading(true)

    try {
      // 토스페이먼츠 결제 시뮬레이션
      // 실제로는 loadTossPayments()를 사용하여 결제창을 띄워야 함
      const confirmed = confirm(`${formatPrice(amount)}원을 충전하시겠습니까?\n\n(테스트 모드: 실제 결제가 진행되지 않습니다)`)

      if (confirmed) {
        // 충전 처리
        const result = addCashCharge(hostId, amount, '카드결제')

        if (result.success) {
          alert(`충전이 완료되었습니다!\n현재 잔액: ${formatPrice(result.balance)}원`)
          navigate('/host/wallet')
        } else {
          alert('충전에 실패했습니다. 다시 시도해주세요.')
        }
      }
    } catch (error) {
      console.error('Charge error:', error)
      alert('결제 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="ml-2 text-lg font-semibold text-gray-900">캐시 충전</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 현재 잔액 */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">현재 캐시 잔액</span>
            <span className="text-xl font-bold text-violet-600">{formatPrice(balance.cash)}원</span>
          </div>
        </div>

        {/* 충전 금액 선택 */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">충전 금액 선택</h2>

          {/* 프리셋 버튼 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {presetAmounts.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={`py-4 rounded-xl border-2 font-semibold transition-all ${
                  selectedAmount === preset.value
                    ? 'border-violet-600 bg-violet-50 text-violet-600'
                    : 'border-gray-200 text-gray-700 hover:border-violet-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* 직접 입력 */}
          <div className="relative">
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="직접 입력"
              className={`w-full px-4 py-4 pr-12 border-2 rounded-xl text-lg font-medium text-right transition-all ${
                customAmount && !selectedAmount
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200'
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              원
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">최소 충전 금액: 1,000원</p>
        </div>

        {/* 충전 금액 요약 */}
        {getChargeAmount() > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">결제 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">충전 금액</span>
                <span className="font-medium">{formatPrice(getChargeAmount())}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제 수단</span>
                <span className="font-medium text-violet-600">토스페이먼츠</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between">
                <span className="font-medium text-gray-900">결제 예정 금액</span>
                <span className="text-xl font-bold text-violet-600">{formatPrice(getChargeAmount())}원</span>
              </div>
            </div>
          </div>
        )}

        {/* 충전 버튼 */}
        <button
          onClick={handleCharge}
          disabled={getChargeAmount() < 1000 || isLoading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            getChargeAmount() >= 1000 && !isLoading
              ? 'bg-violet-600 text-white hover:bg-violet-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              처리 중...
            </span>
          ) : (
            `${formatPrice(getChargeAmount())}원 충전하기`
          )}
        </button>

        {/* 안내 문구 */}
        <div className="mt-6 p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-600 leading-relaxed">
            • 충전된 캐시는 환불이 불가능합니다.<br />
            • 캐시는 바로견적 발송에 사용됩니다.<br />
            • 문의사항은 고객센터로 연락해주세요.
          </p>
        </div>
      </main>
    </div>
  )
}
