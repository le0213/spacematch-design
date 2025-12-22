import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getHostList, formatPrice } from '../../stores/adminStore'

// Mock 정산 데이터
const mockSettlements = [
  { id: 'stl-1', hostName: '스튜디오 호스트', transactionCount: 5, totalAmount: 650000, feeAmount: 32500, settlementAmount: 617500, status: 'pending' },
  { id: 'stl-2', hostName: '파티룸 호스트', transactionCount: 3, totalAmount: 480000, feeAmount: 24000, settlementAmount: 456000, status: 'pending' },
  { id: 'stl-3', hostName: '세미나실 호스트', transactionCount: 8, totalAmount: 1200000, feeAmount: 60000, settlementAmount: 1140000, status: 'completed' },
  { id: 'stl-4', hostName: '루프탑 호스트', transactionCount: 2, totalAmount: 200000, feeAmount: 10000, settlementAmount: 190000, status: 'processing' }
]

export default function AdminSettlements() {
  const [settlements, setSettlements] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setSettlements(mockSettlements)
  }, [])

  const getFilteredSettlements = () => {
    if (filter === 'all') return settlements
    return settlements.filter(s => s.status === filter)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">대기중</span>
      case 'processing':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">처리중</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">완료</span>
      default:
        return null
    }
  }

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'pending', label: '대기중' },
    { id: 'processing', label: '처리중' },
    { id: 'completed', label: '완료' }
  ]

  const filteredSettlements = getFilteredSettlements()

  const totalPending = settlements
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + s.settlementAmount, 0)

  const handleExportExcel = () => {
    alert('엑셀 다운로드 (Mock)')
  }

  const handleProcess = (settlement) => {
    alert(`${settlement.hostName} 정산 처리 (Mock)`)
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">정산 관리</h1>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            엑셀 다운로드
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">이번 주 정산 대상</p>
            <p className="text-2xl font-bold text-violet-600 mt-2">{formatPrice(totalPending)}원</p>
            <p className="text-sm text-gray-500 mt-1">{settlements.filter(s => s.status === 'pending').length}건</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">정산 완료</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatPrice(settlements.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.settlementAmount, 0))}원
            </p>
          </div>
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
                    ? 'bg-violet-600 text-white'
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">호스트</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">거래건수</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">거래금액</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">수수료</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">정산금액</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">상태</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">처리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSettlements.map((settlement) => (
                  <tr key={settlement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{settlement.hostName}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{settlement.transactionCount}건</td>
                    <td className="px-6 py-4 text-right text-gray-700">{formatPrice(settlement.totalAmount)}원</td>
                    <td className="px-6 py-4 text-right text-red-500">-{formatPrice(settlement.feeAmount)}원</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatPrice(settlement.settlementAmount)}원</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(settlement.status)}</td>
                    <td className="px-6 py-4 text-center">
                      {settlement.status === 'pending' && (
                        <button
                          onClick={() => handleProcess(settlement)}
                          className="px-3 py-1 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                        >
                          정산 처리
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSettlements.length === 0 && (
              <div className="p-12 text-center text-gray-500">정산 내역이 없습니다</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
