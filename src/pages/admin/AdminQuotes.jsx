import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getQuoteList, formatPrice, formatDateTime } from '../../stores/adminStore'

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setQuotes(getQuoteList())
  }, [])

  const getFilteredQuotes = () => {
    if (filter === 'all') return quotes
    if (filter === 'flagged') return quotes.filter(q => q.flagged)
    return quotes.filter(q => q.status === filter)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">대기중</span>
      case 'accepted':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">수락됨</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">거절됨</span>
      default:
        return null
    }
  }

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'pending', label: '대기중' },
    { id: 'accepted', label: '수락됨' },
    { id: 'flagged', label: '이상 발행' }
  ]

  const filteredQuotes = getFilteredQuotes()

  // 호스트별 통계
  const hostStats = quotes.reduce((acc, quote) => {
    if (!acc[quote.hostName]) {
      acc[quote.hostName] = { count: 0, flagged: 0 }
    }
    acc[quote.hostName].count++
    if (quote.flagged) acc[quote.hostName].flagged++
    return acc
  }, {})

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">견적 관리</h1>

        {/* Host Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(hostStats).map(([host, stats]) => (
            <div key={host} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 truncate">{host}</p>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-bold text-gray-900">{stats.count}</span>
                {stats.flagged > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    의심 {stats.flagged}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === tab.id
                    ? tab.id === 'flagged' ? 'bg-red-600 text-white' : 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">호스트</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">게스트</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">공간</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">금액</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">상태</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">발행일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className={`hover:bg-gray-50 ${quote.flagged ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {quote.id}
                      {quote.flagged && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">의심</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{quote.hostName}</td>
                    <td className="px-6 py-4 text-gray-700">{quote.guestName}</td>
                    <td className="px-6 py-4 text-gray-700">{quote.spaceName}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatPrice(quote.amount)}원</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(quote.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatDateTime(quote.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredQuotes.length === 0 && (
              <div className="p-12 text-center text-gray-500">견적이 없습니다</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
