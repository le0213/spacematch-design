import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getHostByUserId, formatPrice } from '../../stores/hostStore'
import { getRequest } from '../../stores/requestStore'
import { getQuotesByRequest } from '../../stores/quoteStore'

export default function HostRequestDetail() {
  const { requestId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [host, setHost] = useState(null)
  const [request, setRequest] = useState(null)
  const [sentQuotes, setSentQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/host/login')
      return
    }

    if (user && requestId) {
      loadData()
    }
  }, [user, authLoading, requestId])

  const loadData = () => {
    const hostData = getHostByUserId(user.id)
    setHost(hostData)

    const requestData = getRequest(requestId)
    if (!requestData) {
      navigate('/host/requests')
      return
    }
    setRequest(requestData)

    // 이 요청에 대해 발송한 견적 확인
    const quotes = getQuotesByRequest(requestId)
    const myQuotes = quotes.filter(q => q.hostId === hostData?.id)
    setSentQuotes(myQuotes)

    setLoading(false)
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

  if (!request) return null

  const hasSentQuote = sentQuotes.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/host/requests" className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <Link to="/host" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl text-gray-900">스페이스매치</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">보유 캐시</div>
              <div className="font-semibold text-violet-600">{formatPrice(host?.cash || 0)}원</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
            request.status === '대기중'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {request.status}
          </span>
          <span className="text-sm text-gray-500 ml-3">{formatDate(request.createdAt)}</span>
        </div>

        {/* Request Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {request.summary?.category || '서비스 요청'}
        </h1>

        {/* Request Content */}
        <div className="bg-white rounded-2xl border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">요청 내용</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{request.query}</p>
          </div>

          {/* Request Details */}
          {request.summary && (
            <div className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">상세 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                {request.summary.date && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">예정일</div>
                    <div className="text-gray-900">{request.summary.date}</div>
                  </div>
                )}
                {request.summary.location && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">위치</div>
                    <div className="text-gray-900">{request.summary.location}</div>
                  </div>
                )}
                {request.summary.size && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">규모</div>
                    <div className="text-gray-900">{request.summary.size}</div>
                  </div>
                )}
                {request.summary.budget && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">예산</div>
                    <div className="text-gray-900">{request.summary.budget}</div>
                  </div>
                )}
              </div>

              {/* Additional Items */}
              {request.summary.items && request.summary.items.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-sm text-gray-500 mb-2">요청 항목</div>
                  <div className="flex flex-wrap gap-2">
                    {request.summary.items.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sent Quote Status */}
        {hasSentQuote && (
          <div className="bg-green-50 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">견적을 발송했습니다</h3>
                <p className="text-green-700 text-sm mb-3">
                  게스트가 견적을 확인하면 채팅이 시작됩니다.
                </p>
                <div className="text-sm text-green-600">
                  발송 금액: {formatPrice(sentQuotes[0]?.price || 0)}원
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!hasSentQuote && request.status === '대기중' && (
          <>
            <div className="bg-violet-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-violet-800">
                  <p className="font-medium mb-1">견적 발송 시 1,000원의 캐시가 차감됩니다</p>
                  <p className="text-violet-600">현재 보유 캐시: {formatPrice(host?.cash || 0)}원</p>
                </div>
              </div>
            </div>

            <Link
              to={`/host/quotes/create?requestId=${requestId}`}
              className="block w-full py-4 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 transition-colors text-center"
            >
              견적서 작성하기
            </Link>
          </>
        )}

        {/* Already Sent */}
        {hasSentQuote && (
          <div className="flex gap-4">
            <Link
              to={`/host/chats`}
              className="flex-1 py-4 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 transition-colors text-center"
            >
              채팅 확인하기
            </Link>
            <Link
              to="/host/requests"
              className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors text-center"
            >
              목록으로 돌아가기
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
