import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GuestHeader } from '../components/Header'
import Footer from '../components/Footer'
import { getUserRequests } from '../stores/requestStore'
import { getQuotesByRequest, generateMockQuotes } from '../stores/quoteStore'

export default function QuoteList() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [activeTab, setActiveTab] = useState('전체')
  const [loading, setLoading] = useState(true)

  const tabs = ['전체', '진행중', '완료']

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/quotes')
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading])

  const loadData = () => {
    // 사용자의 요청 목록 로드
    const userRequests = getUserRequests(user.id)

    // 각 요청에 대한 견적 수 계산 및 Mock 데이터 생성
    const requestsWithQuotes = userRequests.map(request => {
      let quotes = getQuotesByRequest(request.id)

      // 견적이 없으면 Mock 데이터 생성
      if (quotes.length === 0 && request.status === '견적서 발송 완료') {
        quotes = generateMockQuotes(request.id, user.id)
      }

      return {
        ...request,
        quoteCount: quotes.length,
        quotes,
      }
    })

    setRequests(requestsWithQuotes)
    setLoading(false)
  }

  const filteredRequests = requests.filter(request => {
    if (activeTab === '전체') return true
    if (activeTab === '진행중') return request.status === '대기중' || request.status === '견적서 발송 완료'
    if (activeTab === '완료') return request.status === '완료'
    return true
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <GuestHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">받은 견적</h1>
          <p className="text-gray-500 mt-1">요청별로 받은 견적을 확인하세요</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Request List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 받은 견적이 없어요</h3>
            <p className="text-gray-500 mb-6">견적을 요청하면 호스트들이 견적서를 보내드립니다</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-full font-medium hover:bg-violet-700 transition-colors"
            >
              견적 요청하러 가기
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <Link
                key={request.id}
                to={`/quotes/${request.id}`}
                className="block bg-white rounded-2xl p-5 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full mb-2 ${
                      request.status === '견적서 발송 완료'
                        ? 'bg-violet-100 text-violet-700'
                        : request.status === '대기중'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {request.status}
                    </span>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {request.summary?.category || request.query?.slice(0, 50)}
                    </h3>
                  </div>
                  {request.quoteCount > 0 && (
                    <div className="flex items-center gap-1 bg-violet-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <span>{request.quoteCount}</span>
                      <span>견적</span>
                    </div>
                  )}
                </div>

                {/* Request Details */}
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
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

                {/* Quote Preview */}
                {request.quotes && request.quotes.length > 0 && (
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <div className="flex -space-x-2">
                      {request.quotes.slice(0, 3).map((quote, idx) => (
                        <img
                          key={idx}
                          src={quote.host?.profileImage || `https://ui-avatars.com/api/?name=${quote.host?.name}&background=random`}
                          alt={quote.host?.name}
                          className="w-8 h-8 rounded-full border-2 border-white"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {request.quotes[0]?.host?.name}
                      {request.quotes.length > 1 && ` 외 ${request.quotes.length - 1}명`}
                    </span>
                    <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}

                {/* Date */}
                <div className="text-xs text-gray-400 mt-3">
                  {formatDate(request.createdAt)} 요청
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
