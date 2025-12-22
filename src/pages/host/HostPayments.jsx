import { useState, useEffect } from 'react'
import HostHeader from '../../components/HostHeader'

// Mock 결제 데이터
const mockPayments = [
  {
    id: 'pay-1',
    spaceName: '강남 스튜디오 A',
    guestName: '김민수',
    amount: 180000,
    status: 'completed',
    paymentMethod: '카드결제',
    paidAt: '2024-12-20T15:30:00Z',
    usageDate: '2024-12-28',
    usageTime: '14:00 - 18:00'
  },
  {
    id: 'pay-2',
    spaceName: '홍대 파티룸',
    guestName: '박지영',
    amount: 320000,
    status: 'completed',
    paymentMethod: '카드결제',
    paidAt: '2024-12-19T10:00:00Z',
    usageDate: '2024-12-25',
    usageTime: '18:00 - 22:00'
  },
  {
    id: 'pay-3',
    spaceName: '성수 세미나실',
    guestName: '이준혁',
    amount: 240000,
    status: 'pending',
    paymentMethod: null,
    paidAt: null,
    usageDate: '2024-12-30',
    usageTime: '09:00 - 12:00'
  },
  {
    id: 'pay-4',
    spaceName: '강남 스튜디오 A',
    guestName: '최서연',
    amount: 150000,
    status: 'settled',
    paymentMethod: '카드결제',
    paidAt: '2024-11-28T14:00:00Z',
    usageDate: '2024-12-05',
    usageTime: '10:00 - 14:00',
    settledAt: '2024-12-05T10:00:00Z'
  }
]

export default function HostPayments() {
  const [payments, setPayments] = useState([])
  const [filter, setFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState(null)

  useEffect(() => {
    setPayments(mockPayments)
  }, [])

  const getFilteredPayments = () => {
    if (filter === 'all') return payments
    return payments.filter(p => p.status === filter)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">결제대기</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">결제완료</span>
      case 'settled':
        return <span className="px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded-full">정산완료</span>
      default:
        return null
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'pending', label: '결제대기' },
    { id: 'completed', label: '결제완료' },
    { id: 'settled', label: '정산완료' },
  ]

  const filteredPayments = getFilteredPayments()

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">결제 관리</h1>

        {/* 탭 */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-4 font-medium text-sm transition-colors relative ${
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

        {/* 결제 테이블 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">결제 내역이 없습니다</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      공간명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      게스트
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      이용일시
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      결제금액
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      결제일
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      onClick={() => setSelectedPayment(payment)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{payment.spaceName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{payment.guestName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-gray-900">{payment.usageDate}</p>
                          <p className="text-sm text-gray-500">{payment.usageTime}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-semibold text-gray-900">{formatPrice(payment.amount)}원</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {formatDate(payment.paidAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 결제 상세 모달 */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedPayment(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">결제 상세</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">공간명</span>
                <span className="font-medium text-gray-900">{selectedPayment.spaceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">게스트</span>
                <span className="font-medium text-gray-900">{selectedPayment.guestName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">이용 날짜</span>
                <span className="font-medium text-gray-900">{selectedPayment.usageDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">이용 시간</span>
                <span className="font-medium text-gray-900">{selectedPayment.usageTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">결제 수단</span>
                <span className="font-medium text-gray-900">{selectedPayment.paymentMethod || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">상태</span>
                {getStatusBadge(selectedPayment.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">결제일</span>
                <span className="font-medium text-gray-900">{formatDate(selectedPayment.paidAt)}</span>
              </div>
              {selectedPayment.settledAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">정산일</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedPayment.settledAt)}</span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-medium text-gray-900">결제 금액</span>
                <span className="text-2xl font-bold text-violet-600">{formatPrice(selectedPayment.amount)}원</span>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
