import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getPayment, completePayment, formatPrice, PAYMENT_METHODS } from '../stores/paymentStore'

export default function Payment() {
  const { paymentId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [agreed, setAgreed] = useState({
    terms: false,
    privacy: false,
    payment: false,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/login?redirect=/payment/${paymentId}`)
      return
    }

    if (user && paymentId) {
      loadPayment()
    }
  }, [user, authLoading, paymentId])

  const loadPayment = () => {
    const paymentData = getPayment(paymentId)
    if (!paymentData) {
      navigate('/quotes')
      return
    }
    setPayment(paymentData)
    setLoading(false)
  }

  const handlePayment = async () => {
    if (!allAgreed) return

    setProcessing(true)

    // 결제 처리 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 결제 완료 처리
    const completedPayment = completePayment(paymentId, selectedMethod)

    // 결제 완료 페이지로 이동
    navigate(`/payment-complete/${completedPayment.id}`)
  }

  const allAgreed = agreed.terms && agreed.privacy && agreed.payment

  const handleAgreeAll = () => {
    const newValue = !allAgreed
    setAgreed({
      terms: newValue,
      privacy: newValue,
      payment: newValue,
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!payment) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link to={`/chat/${payment.quoteId}`} className="mr-4 p-2 text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">결제하기</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">주문 정보</h2>

          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 bg-violet-100 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{payment.spaceName}</h3>
              <p className="text-sm text-gray-500">{payment.hostName}</p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">서비스 금액</span>
              <span className="text-gray-900">{formatPrice(payment.amount)}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">수수료 (5%)</span>
              <span className="text-gray-900">{formatPrice(payment.serviceFee)}원</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <span className="font-semibold text-gray-900">총 결제 금액</span>
              <span className="text-xl font-bold text-violet-600">{formatPrice(payment.totalAmount)}원</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 수단</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === method.id
                    ? 'border-violet-600 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  {method.id === 'card' && (
                    <svg className="w-6 h-6 mx-auto mb-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                  {method.id === 'bank' && (
                    <svg className="w-6 h-6 mx-auto mb-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                  {method.id === 'kakao' && (
                    <div className="w-6 h-6 mx-auto mb-2 bg-[#FEE500] rounded flex items-center justify-center text-xs font-bold">K</div>
                  )}
                  {method.id === 'naver' && (
                    <div className="w-6 h-6 mx-auto mb-2 bg-[#03C75A] rounded flex items-center justify-center text-xs font-bold text-white">N</div>
                  )}
                  {method.id === 'toss' && (
                    <div className="w-6 h-6 mx-auto mb-2 bg-[#0064FF] rounded flex items-center justify-center text-xs font-bold text-white">T</div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{method.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Agreements */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">약관 동의</h2>

          {/* All Agree */}
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={allAgreed}
              onChange={handleAgreeAll}
              className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="font-medium text-gray-900">전체 동의</span>
          </label>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed.terms}
                onChange={(e) => setAgreed(prev => ({ ...prev, terms: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">
                [필수] 이용약관 동의
              </span>
              <button className="ml-auto text-sm text-gray-400 hover:text-gray-600">보기</button>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed.privacy}
                onChange={(e) => setAgreed(prev => ({ ...prev, privacy: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">
                [필수] 개인정보 수집 및 이용 동의
              </span>
              <button className="ml-auto text-sm text-gray-400 hover:text-gray-600">보기</button>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed.payment}
                onChange={(e) => setAgreed(prev => ({ ...prev, payment: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">
                [필수] 결제 진행 동의
              </span>
              <button className="ml-auto text-sm text-gray-400 hover:text-gray-600">보기</button>
            </label>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-violet-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-violet-800">
              <p className="font-medium mb-1">안전결제 안내</p>
              <p className="text-violet-600">스페이스매치 안전결제로 진행됩니다. 서비스 완료 후 호스트에게 정산됩니다.</p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={!allAgreed || processing}
          className="w-full py-4 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              결제 진행 중...
            </>
          ) : (
            `${formatPrice(payment.totalAmount)}원 결제하기`
          )}
        </button>
      </main>
    </div>
  )
}
