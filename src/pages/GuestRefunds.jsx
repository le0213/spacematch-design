import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GuestHeader } from '../components/Header'
import { getRefundsForUser, formatPrice, REFUND_STATUS } from '../stores/refundStore'

export default function GuestRefunds() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }

    if (user) {
      loadRefunds()
    }
  }, [user, authLoading])

  const loadRefunds = () => {
    // user_mock_1로 조회 (실제로는 user.id 사용)
    const userRefunds = getRefundsForUser('user_mock_1')
    setRefunds(userRefunds)
    setLoading(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case REFUND_STATUS.REQUESTED:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">취소요청</span>
      case REFUND_STATUS.PROCESSING:
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">환불진행중</span>
      case REFUND_STATUS.COMPLETED:
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">환불완료</span>
      case REFUND_STATUS.REJECTED:
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">환불거절</span>
      default:
        return null
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
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
          <h1 className="text-2xl font-bold text-gray-900">취소/환불 내역</h1>
        </div>

        {/* Refunds List */}
        {refunds.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <p className="text-gray-500">취소/환불 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {refunds.map(refund => (
              <div
                key={refund.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  {/* Space Image */}
                  {refund.spaceImage && (
                    <img
                      src={refund.spaceImage}
                      alt={refund.spaceName}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{refund.spaceName}</h3>
                      {getStatusBadge(refund.status)}
                    </div>

                    <p className="text-sm text-gray-500 mb-2">{refund.hostName}</p>

                    <p className="text-sm text-gray-600">
                      이용 예정일: {refund.useDate}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">취소 사유</span>
                      <span className="text-gray-900">{refund.refundReason}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">취소 요청일</span>
                      <span className="text-gray-900">{formatDate(refund.requestedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">결제 금액</span>
                      <span className="text-gray-900">{formatPrice(refund.originalAmount)}원</span>
                    </div>

                    {refund.status === REFUND_STATUS.PROCESSING && (
                      <>
                        <div className="border-t border-gray-200 my-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">환불 예정 금액</span>
                          <span className="font-medium text-violet-600">
                            {refund.refundAmount ? formatPrice(refund.refundAmount) : '확인 중'}원
                          </span>
                        </div>
                        {refund.expectedRefundDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">환불 예정일</span>
                            <span className="text-gray-900">{formatDate(refund.expectedRefundDate)}</span>
                          </div>
                        )}
                        {refund.refundNote && (
                          <p className="text-xs text-gray-500 bg-gray-100 rounded-lg p-2 mt-2">
                            {refund.refundNote}
                          </p>
                        )}
                      </>
                    )}

                    {refund.status === REFUND_STATUS.COMPLETED && (
                      <>
                        <div className="border-t border-gray-200 my-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">환불 금액</span>
                          <span className="font-bold text-green-600">{formatPrice(refund.refundAmount)}원</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">환불 완료일</span>
                          <span className="text-gray-900">{formatDate(refund.completedAt)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Progress */}
                {(refund.status === REFUND_STATUS.REQUESTED || refund.status === REFUND_STATUS.PROCESSING) && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        refund.status === REFUND_STATUS.REQUESTED || refund.status === REFUND_STATUS.PROCESSING || refund.status === REFUND_STATUS.COMPLETED
                          ? 'bg-violet-600'
                          : 'bg-gray-300'
                      }`} />
                      <div className={`flex-1 h-1 rounded-full ${
                        refund.status === REFUND_STATUS.PROCESSING || refund.status === REFUND_STATUS.COMPLETED
                          ? 'bg-violet-600'
                          : 'bg-gray-300'
                      }`} />
                      <div className={`w-3 h-3 rounded-full ${
                        refund.status === REFUND_STATUS.PROCESSING || refund.status === REFUND_STATUS.COMPLETED
                          ? 'bg-violet-600'
                          : 'bg-gray-300'
                      }`} />
                      <div className={`flex-1 h-1 rounded-full ${
                        refund.status === REFUND_STATUS.COMPLETED
                          ? 'bg-violet-600'
                          : 'bg-gray-300'
                      }`} />
                      <div className={`w-3 h-3 rounded-full ${
                        refund.status === REFUND_STATUS.COMPLETED
                          ? 'bg-violet-600'
                          : 'bg-gray-300'
                      }`} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>취소요청</span>
                      <span>환불진행</span>
                      <span>환불완료</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">환불 안내</p>
              <ul className="space-y-1 text-blue-700">
                <li>- 환불은 영업일 기준 3-5일 이내 처리됩니다.</li>
                <li>- 공간별 환불 규정에 따라 환불 금액이 달라질 수 있습니다.</li>
                <li>- 문의사항은 채팅으로 호스트에게 연락해주세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
