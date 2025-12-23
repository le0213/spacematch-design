import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  getRefundList,
  getRefundStats,
  processRefund,
  formatPrice,
  formatDateTime
} from '../../stores/adminStore'

const statusColors = {
  '취소요청': 'bg-amber-100 text-amber-700',
  '환불진행중': 'bg-blue-100 text-blue-700',
  '환불완료': 'bg-green-100 text-green-700',
  '환불거절': 'bg-red-100 text-red-700'
}

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([])
  const [stats, setStats] = useState({ pending: 0, todayProcessed: 0, monthlyAmount: 0 })
  const [filter, setFilter] = useState('all')
  const [selectedRefund, setSelectedRefund] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = () => {
    setRefunds(getRefundList(filter))
    setStats(getRefundStats())
  }

  const handleProcess = async (action) => {
    if (!selectedRefund) return

    if (action === 'reject' && !rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.')
      return
    }

    setProcessing(true)
    const result = processRefund(selectedRefund.id, action, rejectReason)

    if (result.success) {
      alert(action === 'approve' ? '환불이 승인되었습니다.' : '환불이 거절되었습니다.')
      setShowModal(false)
      setSelectedRefund(null)
      setRejectReason('')
      loadData()
    } else {
      alert(result.message)
    }
    setProcessing(false)
  }

  const openModal = (refund) => {
    setSelectedRefund(refund)
    setRejectReason('')
    setShowModal(true)
  }

  const tabs = [
    { key: 'all', label: '전체' },
    { key: '취소요청', label: '취소요청' },
    { key: '환불진행중', label: '검토중' },
    { key: '환불완료', label: '환불완료' },
    { key: '환불거절', label: '환불거절' }
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">환불 관리</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">대기 중 환불요청</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}건</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">오늘 처리</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayProcessed}건</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">이번 달 환불액</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.monthlyAmount)}원</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    filter === tab.key
                      ? 'border-violet-600 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">게스트</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">호스트</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">공간명</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">결제금액</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">환불요청액</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">사유</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">요청일</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">처리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refunds.map(refund => (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{refund.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{refund.guestName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{refund.hostName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{refund.spaceName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatPrice(refund.originalAmount)}원</td>
                    <td className="px-4 py-3 text-sm text-violet-600 font-medium text-right">{formatPrice(refund.refundAmount)}원</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{refund.reason}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(refund.requestedAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColors[refund.status]}`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openModal(refund)}
                        className="text-violet-600 hover:text-violet-700 text-sm font-medium"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
                {refunds.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                      환불 요청이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">환불 상세 정보</h2>
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
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[selectedRefund.status]}`}>
                  {selectedRefund.status}
                </span>
                <span className="text-sm text-gray-500">요청일: {formatDateTime(selectedRefund.requestedAt)}</span>
              </div>

              {/* 거래 정보 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-3">거래 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">공간명</span>
                    <span className="text-gray-900">{selectedRefund.spaceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">호스트</span>
                    <span className="text-gray-900">{selectedRefund.hostName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">게스트</span>
                    <span className="text-gray-900">{selectedRefund.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">이용 예정일</span>
                    <span className="text-gray-900">{selectedRefund.usageDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">결제 금액</span>
                    <span className="text-gray-900 font-medium">{formatPrice(selectedRefund.originalAmount)}원</span>
                  </div>
                </div>
              </div>

              {/* 환불 정보 */}
              <div className="bg-violet-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-3">환불 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">환불 사유</span>
                    <span className="text-gray-900">{selectedRefund.reason}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">상세 내용</span>
                    <p className="text-gray-900 mt-1">{selectedRefund.description}</p>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-violet-200">
                    <span className="text-gray-700 font-medium">환불 요청액</span>
                    <span className="text-violet-600 font-bold text-lg">{formatPrice(selectedRefund.refundAmount)}원</span>
                  </div>
                </div>
              </div>

              {/* 거절 사유 (거절된 경우) */}
              {selectedRefund.status === '환불거절' && selectedRefund.rejectReason && (
                <div className="bg-red-50 rounded-xl p-4">
                  <h3 className="font-medium text-red-800 mb-2">거절 사유</h3>
                  <p className="text-sm text-red-700">{selectedRefund.rejectReason}</p>
                </div>
              )}

              {/* 처리 액션 (대기 중인 경우만) */}
              {(selectedRefund.status === '취소요청' || selectedRefund.status === '환불진행중') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      거절 시 사유 (선택)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="거절 사유를 입력하세요..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleProcess('approve')}
                      disabled={processing}
                      className="flex-1 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      환불 승인
                    </button>
                    <button
                      onClick={() => handleProcess('reject')}
                      disabled={processing}
                      className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      환불 거절
                    </button>
                  </div>
                </div>
              )}

              {/* 처리 완료된 경우 */}
              {selectedRefund.processedAt && (
                <div className="text-center text-sm text-gray-500">
                  처리일: {formatDateTime(selectedRefund.processedAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
