import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getTransactionList, formatPrice, formatDateTime } from '../../stores/adminStore'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all')
  const [selectedTx, setSelectedTx] = useState(null)

  useEffect(() => {
    setTransactions(getTransactionList())
  }, [])

  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions
    return transactions.filter(t => t.status === filter)
  }

  const getStatusBadge = (status, refundRequested) => {
    if (refundRequested && status === 'completed') {
      return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">환불요청중</span>
    }
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">결제대기</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">결제완료</span>
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">결제취소</span>
      case 'refunded':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">환불완료</span>
      default:
        return null
    }
  }

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'pending', label: '결제대기' },
    { id: 'completed', label: '결제완료' },
    { id: 'refunded', label: '환불완료' }
  ]

  const filteredTransactions = getFilteredTransactions()

  const handleRefund = (tx) => {
    alert(`${tx.guestName}님의 거래를 환불 처리합니다. (Mock)`)
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">거래 관리</h1>

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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">게스트</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">호스트</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">공간</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">금액</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">상태</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">결제일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">{tx.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{tx.guestName}</td>
                    <td className="px-6 py-4 text-gray-700">{tx.hostName}</td>
                    <td className="px-6 py-4 text-gray-700">{tx.spaceName}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatPrice(tx.amount)}원</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(tx.status, tx.refundRequested)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatDateTime(tx.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="p-12 text-center text-gray-500">거래가 없습니다</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedTx(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">거래 상세</h2>
              <button onClick={() => setSelectedTx(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">거래 ID</span>
                <span className="font-medium">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">게스트</span>
                <span className="font-medium">{selectedTx.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">호스트</span>
                <span className="font-medium">{selectedTx.hostName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">공간</span>
                <span className="font-medium">{selectedTx.spaceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">금액</span>
                <span className="font-medium text-violet-600">{formatPrice(selectedTx.amount)}원</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">상태</span>
                {getStatusBadge(selectedTx.status, selectedTx.refundRequested)}
              </div>
              {selectedTx.refundRequested && (
                <Link
                  to="/admin/refunds"
                  className="block p-3 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">환불 요청 접수됨</p>
                      <p className="text-xs text-orange-600 mt-0.5">환불 관리에서 처리해주세요</p>
                    </div>
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">결제일</span>
                <span className="font-medium">{formatDateTime(selectedTx.paidAt)}</span>
              </div>
              {selectedTx.refundedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">환불일</span>
                  <span className="font-medium">{formatDateTime(selectedTx.refundedAt)}</span>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
              >
                닫기
              </button>
              {selectedTx.status === 'completed' && (
                <button
                  onClick={() => handleRefund(selectedTx)}
                  className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700"
                >
                  환불 처리
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
