import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getHostByUserId, formatPrice } from '../../stores/hostStore'
import { getAllRequests } from '../../stores/requestStore'

export default function HostRequests() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [host, setHost] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('전체')

  const tabs = ['전체', '대기중', '견적 발송 완료']

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/host/login')
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading])

  const loadData = () => {
    const hostData = getHostByUserId(user.id)
    setHost(hostData)

    // 모든 요청 로드 (실제로는 호스트 조건에 맞는 요청만 필터링)
    const allRequests = getAllRequests()
    setRequests(allRequests)

    setLoading(false)
  }

  const filteredRequests = requests.filter(request => {
    if (activeTab === '전체') return true
    return request.status === activeTab
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 60) return `${minutes}분 전`
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/host" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">스페이스매치</span>
            <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-600 text-xs font-medium rounded">
              호스트센터
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/host/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              대시보드
            </Link>
            <Link to="/host/requests" className="text-sm font-medium text-violet-600">
              받은 요청
            </Link>
            <Link to="/host/chats" className="text-sm text-gray-600 hover:text-gray-900">
              채팅
            </Link>
            <Link to="/host/settings" className="text-sm text-gray-600 hover:text-gray-900">
              설정
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">보유 캐시</div>
              <div className="font-semibold text-violet-600">{formatPrice(host?.cash || 0)}원</div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              {user?.name ? (
                <span className="text-sm font-medium">{user.name[0]}</span>
              ) : (
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">받은 요청</h1>
          <p className="text-gray-500 mt-1">게스트의 견적 요청을 확인하고 견적서를 발송하세요</p>
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
              {tab === '대기중' && requests.filter(r => r.status === '대기중').length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {requests.filter(r => r.status === '대기중').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Request List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === '전체' ? '아직 받은 요청이 없습니다' : `${activeTab} 상태의 요청이 없습니다`}
            </h3>
            <p className="text-gray-500">새로운 견적 요청이 오면 알려드릴게요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <Link
                key={request.id}
                to={`/host/requests/${request.id}`}
                className="block bg-white rounded-2xl p-5 border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        request.status === '대기중'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {request.status}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(request.createdAt)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {request.summary?.category || '서비스 요청'}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{request.query}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Request Details */}
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 pt-3 border-t border-gray-100">
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

                {/* Action Hint */}
                {request.status === '대기중' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-sm text-violet-600 font-medium">견적서 작성하기 →</span>
                  </div>
                )}
              </Link>
            ))}
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
