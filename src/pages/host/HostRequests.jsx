import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import HostHeader from '../../components/HostHeader'
import { getHostByUserId, getHostStats, formatPrice } from '../../stores/hostStore'
import {
  getRequestsForHost,
  getRequestStats,
  getTimeAgo
} from '../../stores/requestStore'
import { getHostQuoteForRequest } from '../../stores/quoteStore'
import { getUnreadCountForHost } from '../../stores/chatStore'

export default function HostRequests() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [host, setHost] = useState(null)
  const [stats, setStats] = useState(null)
  const [requestStats, setRequestStats] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [unreadChats, setUnreadChats] = useState(0)

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'pending', label: '대기중' },
    { id: 'quoted', label: '견적 발송 완료' }
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/host/login')
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (host) {
      const filtered = getRequestsForHost(host.id, activeTab)
      setRequests(filtered)
    }
  }, [host, activeTab])

  const loadData = () => {
    const hostData = getHostByUserId(user.id)
    if (hostData) {
      setHost(hostData)
      const hostStats = getHostStats(hostData.id)
      setStats(hostStats)

      // 요청 통계
      const reqStats = getRequestStats(hostData.id)
      setRequestStats(reqStats)

      // 요청 목록
      const reqs = getRequestsForHost(hostData.id, activeTab)
      setRequests(reqs)

      // 채팅 안읽음 수
      const unread = getUnreadCountForHost(hostData.id)
      setUnreadChats(unread)
    }
    setLoading(false)
  }

  // 요청에 대해 호스트가 보낸 견적 가져오기
  const getQuoteForRequest = (requestId) => {
    if (!host) return null
    return getHostQuoteForRequest(host.id, requestId)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader stats={stats} unreadChats={unreadChats} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">견적관리</h1>
            <p className="text-gray-500 mt-1">게스트의 견적 요청을 확인하고 견적서를 발송하세요</p>
          </div>
          <Link
            to="/host/quote-templates"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            자주 쓰는 견적
          </Link>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 전체 견적 */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">전체 견적</span>
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{requestStats?.totalQuotes || 0}</p>
            <p className="text-xs text-gray-400 mt-1">발송한 견적 수</p>
          </div>

          {/* 신규 요청 */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">신규 요청</span>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">{requestStats?.newRequests || 0}</p>
            <p className="text-xs text-gray-400 mt-1">확인하지 않은 요청</p>
          </div>

          {/* 견적 미발송 */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">견적 미발송</span>
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600">{requestStats?.notQuoted || 0}</p>
            <p className="text-xs text-gray-400 mt-1">확인 후 미발송</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
              {tab.id === 'pending' && requestStats?.newRequests > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {requestStats.newRequests}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Request List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'all' ? '아직 받은 요청이 없습니다' : `해당 상태의 요청이 없습니다`}
            </h3>
            <p className="text-gray-500">새로운 견적 요청이 오면 알려드릴게요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => {
              const quote = getQuoteForRequest(request.id)
              const isNew = host && !(request.viewedBy || []).includes(host.id)

              return (
                <Link
                  key={request.id}
                  to={`/host/requests/${request.id}`}
                  className="block bg-white rounded-2xl p-5 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {/* 상태 뱃지 */}
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          quote
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {quote ? '견적 발송 완료' : '대기중'}
                        </span>

                        {/* 바로견적 뱃지 */}
                        {(request.isAutoQuote || quote?.isAutoQuote) && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-violet-100 text-violet-700">
                            바로견적
                          </span>
                        )}

                        {/* 신규 뱃지 */}
                        {isNew && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            NEW
                          </span>
                        )}

                        <span className="text-xs text-gray-400">{getTimeAgo(request.createdAt)}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {request.category || request.summary?.category || '서비스 요청'}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {request.query || request.summary || '요청 내용'}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Request Details */}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 pt-3 border-t border-gray-100">
                    {(request.date || request.summary?.date) && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {request.date || request.summary?.date}
                      </span>
                    )}
                    {(request.location || request.summary?.location) && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {request.location || request.summary?.location}
                      </span>
                    )}
                    {(request.people || request.summary?.people) && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {request.people || request.summary?.people}명
                      </span>
                    )}
                    {request.userName && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {request.userName}
                      </span>
                    )}
                  </div>

                  {/* Action Hint & Quote Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {quote ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">발송 견적:</span>
                            <span className="text-sm font-semibold text-gray-900">{formatPrice(quote.price)}원</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            quote.status === '열람'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {quote.status}
                          </span>
                        </div>
                        <span className="text-sm text-violet-600 font-medium">견적서 확인하기 →</span>
                      </div>
                    ) : (
                      <span className="text-sm text-violet-600 font-medium">견적서 작성하기 →</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-violet-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-violet-800">
              <p className="font-medium mb-1">견적 발송 비용 안내</p>
              <p className="text-violet-600">견적 발송 시 1,000원의 캐시가 차감됩니다. 게스트가 견적을 열람하지 않으면 포인트로 환급됩니다.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
