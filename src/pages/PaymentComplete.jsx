import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getPayment, formatPrice, PAYMENT_METHODS } from '../stores/paymentStore'

export default function PaymentComplete() {
  const { paymentId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
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

  const getPaymentMethodName = (methodId) => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId)
    return method?.name || methodId
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">스페이스매치</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제가 완료되었습니다</h1>
          <p className="text-gray-500">예약 내용을 확인해주세요</p>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 상세</h2>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">주문번호</span>
              <span className="text-gray-900 font-mono">{payment.id}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">서비스</span>
              <span className="text-gray-900">{payment.spaceName}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">호스트</span>
              <span className="text-gray-900">{payment.hostName}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">결제 수단</span>
              <span className="text-gray-900">{getPaymentMethodName(payment.paymentMethod)}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">결제 일시</span>
              <span className="text-gray-900">{formatDate(payment.paidAt)}</span>
            </div>

            <div className="flex justify-between py-3">
              <span className="text-gray-500">서비스 금액</span>
              <span className="text-gray-900">{formatPrice(payment.amount)}원</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">수수료 (5%)</span>
              <span className="text-gray-900">{formatPrice(payment.serviceFee)}원</span>
            </div>

            <div className="flex justify-between py-3">
              <span className="font-semibold text-gray-900">총 결제 금액</span>
              <span className="text-xl font-bold text-violet-600">{formatPrice(payment.totalAmount)}원</span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-violet-50 rounded-xl p-5 mb-6">
          <h3 className="font-medium text-violet-900 mb-3">이용 안내</h3>
          <ul className="space-y-2 text-sm text-violet-700">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              호스트와 채팅으로 서비스 일정을 조율해주세요.
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              서비스 완료 후 리뷰를 남겨주시면 다른 이용자에게 도움이 됩니다.
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              결제 영수증은 마이페이지에서 확인할 수 있습니다.
            </li>
          </ul>
        </div>

        {/* Refund Policy */}
        <div className="bg-gray-100 rounded-xl p-5 mb-8">
          <h3 className="font-medium text-gray-900 mb-3">환불 정책</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>- 서비스 시작 24시간 전까지: 전액 환불</li>
            <li>- 서비스 시작 24시간 이내: 50% 환불</li>
            <li>- 서비스 시작 이후: 환불 불가</li>
            <li>- 환불 요청은 채팅 또는 고객센터를 통해 가능합니다.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to={`/chat/${payment.quoteId}`}
            className="flex-1 py-4 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 transition-colors text-center"
          >
            호스트와 채팅하기
          </Link>
          <Link
            to="/"
            className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors text-center"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  )
}
