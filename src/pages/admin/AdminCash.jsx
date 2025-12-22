import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getHostList, formatPrice, formatDateTime } from '../../stores/adminStore'

// Mock 캐시 내역
const mockCashHistory = [
  { id: 'ch-1', hostName: '스튜디오 호스트', type: 'charge', amount: 50000, balance: 50000, createdAt: '2024-12-20T10:00:00Z' },
  { id: 'ch-2', hostName: '스튜디오 호스트', type: 'use', amount: -5000, balance: 45000, createdAt: '2024-12-20T14:30:00Z' },
  { id: 'ch-3', hostName: '파티룸 호스트', type: 'charge', amount: 30000, balance: 30000, createdAt: '2024-12-19T09:00:00Z' },
  { id: 'ch-4', hostName: '세미나실 호스트', type: 'charge', amount: 100000, balance: 100000, createdAt: '2024-12-18T11:00:00Z', flagged: true },
  { id: 'ch-5', hostName: '세미나실 호스트', type: 'refund', amount: -80000, balance: 20000, createdAt: '2024-12-18T15:00:00Z', flagged: true }
]

export default function AdminCash() {
  const [tab, setTab] = useState('cash')
  const [cashHistory, setCashHistory] = useState([])
  const [hosts, setHosts] = useState([])
  const [selectedHost, setSelectedHost] = useState('')
  const [pointAmount, setPointAmount] = useState('')
  const [pointAction, setPointAction] = useState('give')

  useEffect(() => {
    setCashHistory(mockCashHistory)
    setHosts(getHostList())
  }, [])

  const getTypeBadge = (type) => {
    switch (type) {
      case 'charge':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">충전</span>
      case 'use':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">사용</span>
      case 'refund':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">환불</span>
      default:
        return null
    }
  }

  const handlePointAction = () => {
    if (!selectedHost || !pointAmount) {
      alert('호스트와 금액을 입력해주세요')
      return
    }
    const action = pointAction === 'give' ? '지급' : '회수'
    alert(`${selectedHost}에게 ${formatPrice(parseInt(pointAmount))}P ${action} 완료 (Mock)`)
    setSelectedHost('')
    setPointAmount('')
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">캐시/포인트 관리</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('cash')}
            className={`px-6 py-3 font-medium rounded-xl transition-colors ${
              tab === 'cash'
                ? 'bg-violet-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            캐시 내역
          </button>
          <button
            onClick={() => setTab('point')}
            className={`px-6 py-3 font-medium rounded-xl transition-colors ${
              tab === 'point'
                ? 'bg-violet-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            포인트 관리
          </button>
        </div>

        {tab === 'cash' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">캐시 충전/사용/환불 내역</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">호스트</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">구분</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">금액</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">잔액</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cashHistory.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50 ${item.flagged ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{item.hostName}</span>
                          {item.flagged && (
                            <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">이상</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">{getTypeBadge(item.type)}</td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        item.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.amount > 0 ? '+' : ''}{formatPrice(item.amount)}원
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">{formatPrice(item.balance)}원</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">{formatDateTime(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'point' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Point Action */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">포인트 지급/회수</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">호스트 선택</label>
                  <select
                    value={selectedHost}
                    onChange={(e) => setSelectedHost(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 outline-none"
                  >
                    <option value="">선택하세요</option>
                    {hosts.map((host) => (
                      <option key={host.id} value={host.name}>{host.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">금액</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pointAmount}
                      onChange={(e) => setPointAmount(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-violet-500 outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">P</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">처리 유형</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPointAction('give')}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        pointAction === 'give'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      지급
                    </button>
                    <button
                      onClick={() => setPointAction('take')}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        pointAction === 'take'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      회수
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePointAction}
                  className="w-full py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700"
                >
                  처리하기
                </button>
              </div>
            </div>

            {/* Host Balances */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">호스트별 잔액</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {hosts.map((host) => (
                  <div key={host.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{host.name}</p>
                      <p className="text-sm text-gray-500">{host.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-violet-600">{formatPrice(host.cashBalance)}원</p>
                      <p className="text-sm text-gray-500">캐시 잔액</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
