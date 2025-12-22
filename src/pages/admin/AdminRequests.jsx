import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getRequestList, formatDate } from '../../stores/adminStore'

export default function AdminRequests() {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    setRequests(getRequestList())
  }, [])

  const getFilteredRequests = () => {
    let filtered = requests

    if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(r =>
        r.guestName.toLowerCase().includes(searchLower) ||
        r.region.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">대기중</span>
      case 'quoted':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">견적 발송</span>
      default:
        return null
    }
  }

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'waiting', label: '대기중' },
    { id: 'quoted', label: '견적 발송' }
  ]

  const filteredRequests = getFilteredRequests()

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">요청 관리</h1>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              {tabs.map((tab) => (
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
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="게스트명, 지역 검색"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-violet-500 outline-none"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">게스트</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">지역</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">인원</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">목적</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">상태</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">생성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">{request.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{request.guestName}</td>
                    <td className="px-6 py-4 text-gray-700">{request.region}</td>
                    <td className="px-6 py-4 text-gray-700">{request.date}</td>
                    <td className="px-6 py-4 text-gray-700">{request.people}명</td>
                    <td className="px-6 py-4 text-gray-700">{request.purpose}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatDate(request.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRequests.length === 0 && (
              <div className="p-12 text-center text-gray-500">요청이 없습니다</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedRequest(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">요청 상세</h2>
              <button onClick={() => setSelectedRequest(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">요청 ID</span>
                <span className="font-medium">{selectedRequest.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">게스트</span>
                <span className="font-medium">{selectedRequest.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">지역</span>
                <span className="font-medium">{selectedRequest.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">날짜</span>
                <span className="font-medium">{selectedRequest.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">인원</span>
                <span className="font-medium">{selectedRequest.people}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">목적</span>
                <span className="font-medium">{selectedRequest.purpose}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">상태</span>
                {getStatusBadge(selectedRequest.status)}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedRequest(null)}
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
