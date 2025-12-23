import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GuestHeader } from '../components/Header'
import Footer from '../components/Footer'
import SpaceInfoCard from '../components/SpaceInfoCard'
import { getRequest } from '../stores/requestStore'
import { getQuotesByRequest, markQuoteAsRead, generateMockQuotes } from '../stores/quoteStore'

export default function QuoteDetail() {
  const { requestId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('latest') // latest, price_low, price_high, rating

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/login?redirect=/quotes/${requestId}`)
      return
    }

    if (user && requestId) {
      loadData()
    }
  }, [user, authLoading, requestId])

  const loadData = () => {
    const requestData = getRequest(requestId)
    if (!requestData) {
      navigate('/quotes')
      return
    }

    setRequest(requestData)

    let quotesData = getQuotesByRequest(requestId)

    // 견적이 없으면 Mock 데이터 생성
    if (quotesData.length === 0) {
      quotesData = generateMockQuotes(requestId, user.id)
    }

    setQuotes(quotesData)
    setLoading(false)
  }

  const handleQuoteClick = (quoteId) => {
    markQuoteAsRead(quoteId)
    navigate(`/chat/${quoteId}`)
  }

  const sortedQuotes = [...quotes].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price
      case 'price_high':
        return b.price - a.price
      case 'rating':
        return (b.host?.rating || 0) - (a.host?.rating || 0)
      default: // latest
        return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return '방금 전'
    if (hours < 24) return `${hours}시간 전`
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!request) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <GuestHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Back Button */}
        <Link
          to="/quotes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          받은 견적 목록
        </Link>

        {/* Request Summary */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
          <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full mb-2 ${
            request.status === '견적서 발송 완료'
              ? 'bg-violet-100 text-violet-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {request.status}
          </span>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {request.summary?.category || request.query?.slice(0, 50)}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            {request.summary?.date && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {request.summary.date}
              </span>
            )}
            {request.summary?.location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {request.summary.location}
              </span>
            )}
          </div>
        </div>

        {/* Quotes Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            받은 견적 <span className="text-violet-600">{quotes.length}건</span>
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
          >
            <option value="latest">최신순</option>
            <option value="price_low">가격 낮은순</option>
            <option value="price_high">가격 높은순</option>
            <option value="rating">평점 높은순</option>
          </select>
        </div>

        {/* Quote Cards */}
        <div className="space-y-4">
          {sortedQuotes.map(quote => (
            <div
              key={quote.id}
              onClick={() => handleQuoteClick(quote.id)}
              className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${
                quote.status === '미열람'
                  ? 'border-violet-200 ring-1 ring-violet-100'
                  : 'border-gray-100 hover:border-violet-200'
              }`}
            >
              {/* Host Info */}
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={quote.host?.profileImage || `https://ui-avatars.com/api/?name=${quote.host?.name}&background=random`}
                  alt={quote.host?.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{quote.host?.name}</h3>
                    {quote.status === '미열람' && (
                      <span className="px-2 py-0.5 bg-violet-600 text-white text-xs rounded-full">NEW</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {quote.host?.rating}
                    </span>
                    <span>리뷰 {quote.host?.reviewCount}개</span>
                    <span>응답률 {quote.host?.responseRate}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">{formatDate(quote.createdAt)}</div>
                </div>
              </div>

              {/* Quote Details */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 text-sm mb-3">{quote.description}</p>
                <div className="flex flex-wrap gap-2">
                  {quote.items?.map((item, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white rounded text-xs text-gray-600">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Space Info - 스페이스클라우드 연동 */}
              {quote.space && (
                <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                  <SpaceInfoCard space={quote.space} variant="inline" />
                </div>
              )}

              {/* Price & CTA */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">견적가</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(quote.price)}
                    <span className="text-base font-normal text-gray-500">원</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-violet-600 text-white rounded-full font-medium hover:bg-violet-700 transition-colors flex items-center gap-2">
                  채팅하기
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
