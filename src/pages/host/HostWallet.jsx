import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HostHeader from '../../components/HostHeader'
import {
  getHostByUserId,
  getWalletHistory,
  initMockWalletHistory,
  formatPrice,
  QUOTE_COST
} from '../../stores/hostStore'
import { useAuth } from '../../contexts/AuthContext'

export default function HostWallet() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [host, setHost] = useState(null)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('all') // all, cash, points
  const [filter, setFilter] = useState('all') // all, charge/earn, use

  useEffect(() => {
    if (user) {
      const hostData = getHostByUserId(user.id)
      if (hostData) {
        setHost(hostData)
        initMockWalletHistory(hostData.id)
      }
    }
  }, [user])

  useEffect(() => {
    if (host) {
      let filtered = getWalletHistory(host.id, activeTab)

      if (filter !== 'all') {
        if (filter === 'in') {
          filtered = filtered.filter(h => h.action === 'charge' || h.action === 'earn')
        } else if (filter === 'out') {
          filtered = filtered.filter(h => h.action === 'use')
        }
      }

      setHistory(filtered)
    }
  }, [host, activeTab, filter])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const mainTabs = [
    { id: 'all', label: '전체' },
    { id: 'cash', label: '캐시' },
    { id: 'points', label: '포인트' },
  ]

  const subTabs = [
    { id: 'all', label: '전체' },
    { id: 'in', label: activeTab === 'points' ? '지급' : '충전' },
    { id: 'out', label: '사용' },
  ]

  if (!host) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">내 자산</h1>

        {/* 자산 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 캐시 카드 */}
          <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-violet-200 text-sm font-medium">캐시</span>
            </div>
            <p className="text-3xl font-bold mb-4">{formatPrice(host.cash)}원</p>
            <button
              onClick={() => navigate('/host/wallet/charge')}
              className="w-full bg-white text-violet-600 font-semibold py-2.5 rounded-xl hover:bg-violet-50 transition-colors"
            >
              충전하기
            </button>
          </div>

          {/* 포인트 카드 */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">P</span>
              </div>
              <span className="text-green-100 text-sm font-medium">포인트</span>
            </div>
            <p className="text-3xl font-bold mb-4">{formatPrice(host.points)}P</p>
            <div className="bg-white/20 rounded-xl py-2.5 text-center text-sm">
              이벤트/프로모션으로 지급
            </div>
          </div>
        </div>

        {/* 총 잔액 표시 */}
        <div className="bg-white rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">총 사용 가능 금액</p>
              <p className="font-bold text-gray-900">{formatPrice(host.cash + host.points)}원</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/host/wallet/auto-charge')}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            자동충전 설정
          </button>
        </div>

        {/* 사용 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-amber-600 text-xl">💡</span>
            <div>
              <p className="font-medium text-amber-800">캐시 & 포인트 사용 안내</p>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                <li>• 견적 발송 시 건당 {formatPrice(QUOTE_COST)}원이 차감됩니다.</li>
                <li>• 포인트가 먼저 차감되고, 부족 시 캐시가 차감됩니다.</li>
                <li>• 게스트가 견적을 열람하지 않으면 포인트로 환급됩니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 메인 탭 (전체/캐시/포인트) */}
        <div className="flex gap-2 mb-4">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setFilter('all')
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 서브 탭 (전체/충전(지급)/사용) */}
        <div className="flex border-b border-gray-200 mb-4">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                filter === tab.id
                  ? 'text-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {filter === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
              )}
            </button>
          ))}
        </div>

        {/* 내역 리스트 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500">내역이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.action === 'charge' || item.action === 'earn'
                        ? item.type === 'points' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {item.action === 'charge' || item.action === 'earn' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{item.description}</p>
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                          item.type === 'points' ? 'bg-green-100 text-green-700' : 'bg-violet-100 text-violet-700'
                        }`}>
                          {item.type === 'points' ? '포인트' : '캐시'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      item.amount > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {item.amount > 0 ? '+' : ''}{formatPrice(item.amount)}{item.type === 'points' ? 'P' : '원'}
                    </p>
                    <p className="text-sm text-gray-500">
                      잔액 {formatPrice(item.balance)}{item.type === 'points' ? 'P' : '원'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
