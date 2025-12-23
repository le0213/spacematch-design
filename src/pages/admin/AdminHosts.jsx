import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getHostList, formatPrice } from '../../stores/adminStore'

export default function AdminHosts() {
  const [hosts, setHosts] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedHost, setSelectedHost] = useState(null)

  useEffect(() => {
    setHosts(getHostList())
  }, [])

  const getFilteredHosts = () => {
    let filtered = hosts

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(searchLower) ||
        h.email.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filter === 'verified') {
      filtered = filtered.filter(h => h.businessVerified && h.accountVerified)
    } else if (filter === 'pending') {
      filtered = filtered.filter(h => !h.businessVerified || !h.accountVerified)
    } else if (filter === 'autoQuote') {
      filtered = filtered.filter(h => h.autoQuoteEnabled)
    }

    return filtered
  }

  const filteredHosts = getFilteredHosts()

  const filterTabs = [
    { id: 'all', label: '전체' },
    { id: 'verified', label: '검증완료' },
    { id: 'pending', label: '검증대기' },
    { id: 'autoQuote', label: '바로견적 활성' }
  ]

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">호스트 관리</h1>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative max-w-md flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="업체명, 이메일 검색"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-violet-500 outline-none"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === tab.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">업체명</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">이메일</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">공간</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">사업자</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">계좌</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">바로견적</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">캐시</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHosts.map((host) => (
                  <tr
                    key={host.id}
                    onClick={() => setSelectedHost(host)}
                    className={`hover:bg-gray-50 cursor-pointer ${host.flagged ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {host.id}
                      {host.flagged && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">의심</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">{host.name}</td>
                    <td className="px-4 py-4 text-gray-700">{host.email}</td>
                    <td className="px-4 py-4 text-center text-gray-700">{host.spaceCount}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        host.businessVerified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {host.businessVerified ? '완료' : '대기'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        host.accountVerified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {host.accountVerified ? '완료' : '대기'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        host.autoQuoteEnabled
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {host.autoQuoteEnabled ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">{formatPrice(host.cashBalance)}원</td>
                    <td className="px-4 py-4 text-sm text-gray-500 text-right">{host.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredHosts.length === 0 && (
              <div className="p-12 text-center text-gray-500">호스트가 없습니다</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedHost(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">호스트 상세</h2>
              <button onClick={() => setSelectedHost(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">ID</span>
                <span className="font-medium">{selectedHost.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">업체명</span>
                <span className="font-medium">{selectedHost.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">이메일</span>
                <span className="font-medium">{selectedHost.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">공간 수</span>
                <span className="font-medium">{selectedHost.spaceCount}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">캐시 잔액</span>
                <span className="font-medium text-violet-600">{formatPrice(selectedHost.cashBalance)}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">견적 발행</span>
                <span className="font-medium">{selectedHost.quoteCount}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">가입일</span>
                <span className="font-medium">{selectedHost.createdAt}</span>
              </div>

              {/* 검증 상태 */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">검증 상태</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">사업자 검증</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    selectedHost.businessVerified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedHost.businessVerified ? '완료' : '대기'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">계좌 검증</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    selectedHost.accountVerified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedHost.accountVerified ? '완료' : '대기'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">바로견적</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    selectedHost.autoQuoteEnabled
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {selectedHost.autoQuoteEnabled ? '활성' : '비활성'}
                  </span>
                </div>
              </div>

              {selectedHost.flagged && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">어뷰징 의심 호스트</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedHost(null)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
