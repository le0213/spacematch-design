import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GuestHeader } from '../components/Header'
import { getPaymentsForUser, formatPrice, PAYMENT_STATUS } from '../stores/paymentStore'

const TABS = [
  { id: 'all', label: '전체' },
  { id: 'upcoming', label: '이용예정' },
  { id: 'completed', label: '이용완료' },
]

export default function GuestPayments() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }

    if (user) {
      loadPayments()
    }
  }, [user, authLoading])

  const loadPayments = () => {
    // user_mock_1로 조회 (실제로는 user.id 사용)
    const userPayments = getPaymentsForUser('user_mock_1')
    setPayments(userPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    setLoading(false)
  }

  const filteredPayments = payments.filter(payment => {
    if (activeTab === 'all') return true
    if (activeTab === 'upcoming') return payment.usageStatus === '이용예정'
    if (activeTab === 'completed') return payment.usageStatus === '이용완료'
    return true
  })

  const getStatusBadge = (payment) => {
    if (payment.status === PAYMENT_STATUS.CANCELLED) {
      return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">결제취소</span>
    }
    if (payment.status === PAYMENT_STATUS.REFUNDED) {
      return <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">환불완료</span>
    }
    if (payment.usageStatus === '이용예정') {
      return <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-xs rounded-full">이용예정</span>
    }
    if (payment.usageStatus === '이용완료') {
      return <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">이용완료</span>
    }
    return null
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GuestHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">결제 내역</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">결제 내역이 없습니다</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700"
            >
              공간 찾아보기
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map(payment => (
              <div
                key={payment.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
              >
                <div className="flex gap-4 p-4">
                  {/* Space Image */}
                  {payment.spaceImage && (
                    <img
                      src={payment.spaceImage}
                      alt={payment.spaceName}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{payment.spaceName}</h3>
                      {getStatusBadge(payment)}
                    </div>

                    <p className="text-sm text-gray-500 mb-1">{payment.hostName}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{payment.useDate} {payment.useTime}</span>
                    </div>

                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(payment.totalAmount)}원
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    결제일: {formatDate(payment.paidAt || payment.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    {payment.usageStatus === '이용예정' && (
                      <Link
                        to={`/chat/${payment.quoteId}`}
                        className="text-sm text-violet-600 hover:text-violet-700"
                      >
                        채팅방 보기
                      </Link>
                    )}
                    {payment.usageStatus === '이용완료' && (
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        리뷰 작성
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {payments.length > 0 && (
          <div className="mt-6 p-4 bg-violet-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-violet-700">총 결제 건수</span>
              <span className="font-semibold text-violet-900">{payments.length}건</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-violet-700">총 결제 금액</span>
              <span className="font-semibold text-violet-900">
                {formatPrice(payments.reduce((sum, p) => sum + p.totalAmount, 0))}원
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
