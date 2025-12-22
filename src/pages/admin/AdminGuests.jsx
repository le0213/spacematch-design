import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getGuestList, formatDate } from '../../stores/adminStore'

export default function AdminGuests() {
  const [guests, setGuests] = useState([])
  const [search, setSearch] = useState('')
  const [selectedGuest, setSelectedGuest] = useState(null)

  useEffect(() => {
    setGuests(getGuestList())
  }, [])

  const getFilteredGuests = () => {
    if (!search) return guests
    const searchLower = search.toLowerCase()
    return guests.filter(g =>
      g.name.toLowerCase().includes(searchLower) ||
      g.email.toLowerCase().includes(searchLower)
    )
  }

  const filteredGuests = getFilteredGuests()

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">게스트 관리</h1>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름, 이메일 검색"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-violet-500 outline-none"
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">이메일</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">요청 수</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">결제 수</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGuests.map((guest) => (
                  <tr
                    key={guest.id}
                    onClick={() => setSelectedGuest(guest)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">{guest.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{guest.name}</td>
                    <td className="px-6 py-4 text-gray-700">{guest.email}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{guest.requestCount}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{guest.paymentCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{guest.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredGuests.length === 0 && (
              <div className="p-12 text-center text-gray-500">게스트가 없습니다</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedGuest(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">게스트 상세</h2>
              <button onClick={() => setSelectedGuest(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">ID</span>
                <span className="font-medium">{selectedGuest.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">이름</span>
                <span className="font-medium">{selectedGuest.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">이메일</span>
                <span className="font-medium">{selectedGuest.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">요청 수</span>
                <span className="font-medium">{selectedGuest.requestCount}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제 수</span>
                <span className="font-medium">{selectedGuest.paymentCount}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">가입일</span>
                <span className="font-medium">{selectedGuest.createdAt}</span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedGuest(null)}
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
