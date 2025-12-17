import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getHostByUserId, getHostStats, formatPrice, createHost, generateMockSpaces } from '../../stores/hostStore'
import { getPendingRequestsForHost } from '../../stores/requestStore'

export default function HostDashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [host, setHost] = useState(null)
  const [stats, setStats] = useState(null)
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

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
    let hostData = getHostByUserId(user.id)

    // 호스트 데이터가 없으면 생성
    if (!hostData) {
      hostData = createHost({
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      })
      // Mock 공간 생성
      generateMockSpaces(hostData.id)
    }

    setHost(hostData)

    // 통계 로드
    const hostStats = getHostStats(hostData.id)
    setStats(hostStats)

    // 최근 요청 로드 (대기 중인 요청)
    const pendingRequests = getPendingRequestsForHost()
    setRecentRequests(pendingRequests.slice(0, 5))

    setLoading(false)
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
            <Link to="/host/dashboard" className="text-sm font-medium text-violet-600">
              대시보드
            </Link>
            <Link to="/host/requests" className="text-sm text-gray-600 hover:text-gray-900">
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
              <div className="font-semibold text-violet-600">{formatPrice(stats?.totalBalance || 0)}원</div>
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            안녕하세요, {host?.name || user?.name}님
          </h1>
          <p className="text-gray-500 mt-1">오늘도 좋은 거래 있으시길 바랍니다</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">대기 중인 요청</div>
            <div className="text-3xl font-bold text-gray-900">{stats?.pendingRequests || 0}</div>
            <Link to="/host/requests" className="text-sm text-violet-600 hover:underline mt-2 inline-block">
              요청 확인하기 →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">발송한 견적</div>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalQuotesSent || 0}</div>
            <div className="text-sm text-gray-400 mt-2">이번 달</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">성사된 거래</div>
            <div className="text-3xl font-bold text-gray-900">{stats?.completedDeals || 0}</div>
            <div className="text-sm text-gray-400 mt-2">이번 달</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">보유 캐시</div>
            <div className="text-3xl font-bold text-violet-600">{formatPrice(stats?.totalBalance || 0)}</div>
            <Link to="/host/cash" className="text-sm text-violet-600 hover:underline mt-2 inline-block">
              충전하기 →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Recent Requests */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">새로운 견적 요청</h2>
              <Link to="/host/requests" className="text-sm text-violet-600 hover:underline">
                전체 보기
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500">새로운 요청이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentRequests.map(request => (
                  <Link
                    key={request.id}
                    to={`/host/requests/${request.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {request.summary?.category || request.query?.slice(0, 30)}
                      </h3>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{request.query}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">호스트 현황</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">응답률</span>
                <span className="font-semibold text-gray-900">{stats?.responseRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-violet-600 h-2 rounded-full"
                  style={{ width: `${stats?.responseRate || 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-gray-600">평점</span>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold text-gray-900">{stats?.rating || '-'}</span>
                  <span className="text-gray-400">({stats?.reviewCount || 0})</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-gray-600">총 수익</span>
                <span className="font-semibold text-gray-900">{formatPrice(stats?.totalRevenue || 0)}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-violet-50 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-violet-900 mb-1">팁: 빠른 응답이 성사율을 높여요</h3>
              <p className="text-violet-700 text-sm">
                견적 요청을 받은 후 1시간 이내에 응답하면 계약 성사율이 3배 높아집니다.
                바로견적 기능을 활용해보세요!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
