import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  getAutoQuoteStats,
  getAutoQuoteHosts,
  getAutoQuoteLogs,
  suspendAutoQuote,
  formatPrice,
  formatDateTime
} from '../../stores/adminStore'

export default function AdminAutoQuotes() {
  const [stats, setStats] = useState({ totalHosts: 0, todaySent: 0, successRate: 0 })
  const [hosts, setHosts] = useState([])
  const [logs, setLogs] = useState([])
  const [activeTab, setActiveTab] = useState('hosts')
  const [selectedHost, setSelectedHost] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setStats(getAutoQuoteStats())
    setHosts(getAutoQuoteHosts())
    setLogs(getAutoQuoteLogs())
  }

  const handleSuspend = (hostId) => {
    if (!confirm('이 호스트의 바로견적을 일시정지하시겠습니까?')) return

    const result = suspendAutoQuote(hostId)
    if (result.success) {
      alert('바로견적이 일시정지되었습니다.')
      loadData()
      setShowModal(false)
    }
  }

  const openModal = (host) => {
    setSelectedHost(host)
    setShowModal(true)
  }

  const tabs = [
    { key: 'hosts', label: '호스트별 현황' },
    { key: 'logs', label: '발송 로그' },
    { key: 'alerts', label: '어뷰징 탐지' }
  ]

  const abusingHosts = hosts.filter(h => h.abusingFlag)

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">바로견적 모니터링</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">바로견적 활성 호스트</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHosts}명</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">오늘 발송</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todaySent}건</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">성사율</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Abusing Alert */}
        {abusingHosts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">어뷰징 의심 호스트 {abusingHosts.length}명 발견</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {abusingHosts.map(host => (
                <button
                  key={host.id}
                  onClick={() => openModal(host)}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full hover:bg-red-200 transition-colors"
                >
                  {host.hostName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-violet-600 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'alerts' && abusingHosts.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {abusingHosts.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Hosts Tab */}
          {activeTab === 'hosts' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">호스트</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">설정상태</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">매칭조건</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">오늘발송</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">성사율</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">마지막발송</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">어뷰징</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">처리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hosts.map(host => (
                    <tr key={host.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{host.hostName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          host.status === 'active' ? 'bg-green-100 text-green-700' :
                          host.status === 'suspended' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {host.status === 'active' ? '활성' :
                           host.status === 'suspended' ? '정지' : '비활성'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {host.matchingConditions?.regions?.join(', ') || '전체지역'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{host.todaySent}건</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{host.successRate}%</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {host.lastSentAt ? formatDateTime(host.lastSentAt) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {host.abusingFlag ? (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            의심
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openModal(host)}
                          className="text-violet-600 hover:text-violet-700 text-sm font-medium"
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  ))}
                  {hosts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        바로견적을 활성화한 호스트가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">시간</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">호스트</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">게스트</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">요청내용</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">견적금액</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(log.sentAt)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.hostName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{log.guestName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {log.requestSummary}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatPrice(log.quoteAmount)}원</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          log.status === '성사' ? 'bg-green-100 text-green-700' :
                          log.status === '대기' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        발송된 바로견적이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="p-6">
              {abusingHosts.length > 0 ? (
                <div className="space-y-4">
                  {abusingHosts.map(host => (
                    <div key={host.id} className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">{host.hostName}</span>
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              어뷰징 의심
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                              <span className="text-gray-500">탐지 사유:</span> {host.abusingReason}
                            </p>
                            <p className="text-gray-600">
                              <span className="text-gray-500">오늘 발송:</span> {host.todaySent}건
                            </p>
                            <p className="text-gray-600">
                              <span className="text-gray-500">마지막 발송:</span> {formatDateTime(host.lastSentAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSuspend(host.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            일시정지
                          </button>
                          <button
                            onClick={() => openModal(host)}
                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            상세
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>어뷰징 의심 호스트가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Host Detail Modal */}
      {showModal && selectedHost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">바로견적 상세 정보</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 호스트 정보 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedHost.hostName}</h3>
                  <p className="text-gray-500">{selectedHost.email}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  selectedHost.status === 'active' ? 'bg-green-100 text-green-700' :
                  selectedHost.status === 'suspended' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {selectedHost.status === 'active' ? '활성' :
                   selectedHost.status === 'suspended' ? '정지' : '비활성'}
                </span>
              </div>

              {/* 어뷰징 경고 */}
              {selectedHost.abusingFlag && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-medium">어뷰징 의심</span>
                  </div>
                  <p className="text-sm text-red-600">{selectedHost.abusingReason}</p>
                </div>
              )}

              {/* 통계 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">발송 통계</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-violet-600">{selectedHost.todaySent}</p>
                    <p className="text-xs text-gray-500">오늘 발송</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-violet-600">{selectedHost.totalSent}</p>
                    <p className="text-xs text-gray-500">총 발송</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-violet-600">{selectedHost.successRate}%</p>
                    <p className="text-xs text-gray-500">성사율</p>
                  </div>
                </div>
              </div>

              {/* 매칭 조건 */}
              <div className="bg-violet-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">매칭 조건</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">지역</span>
                    <span className="text-gray-900">
                      {selectedHost.matchingConditions?.regions?.join(', ') || '전체'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">최소 인원</span>
                    <span className="text-gray-900">{selectedHost.matchingConditions?.minCapacity || 1}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">최대 인원</span>
                    <span className="text-gray-900">{selectedHost.matchingConditions?.maxCapacity || '제한없음'}명</span>
                  </div>
                </div>
              </div>

              {/* 템플릿 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">견적 템플릿</h4>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600">{selectedHost.template || '기본 템플릿 사용'}</p>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                {selectedHost.status === 'active' && (
                  <button
                    onClick={() => handleSuspend(selectedHost.id)}
                    className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                  >
                    바로견적 일시정지
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>

              {selectedHost.lastSentAt && (
                <p className="text-center text-xs text-gray-400">
                  마지막 발송: {formatDateTime(selectedHost.lastSentAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
