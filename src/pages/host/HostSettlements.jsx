import { useState, useEffect } from 'react'
import HostHeader from '../../components/HostHeader'
import {
  getSettlementSummary,
  getSettlementHistory,
  getSettlementDetail,
  getBankAccount,
  saveBankAccount,
  BANK_LIST,
  formatPrice,
  formatMonth
} from '../../stores/settlementStore'

export default function HostSettlements() {
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [bankAccount, setBankAccount] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [accountForm, setAccountForm] = useState({
    bankCode: '',
    accountNumber: '',
    accountHolder: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const hostId = 'host-1'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setSummary(getSettlementSummary(hostId))
    setHistory(getSettlementHistory(hostId))
    setBankAccount(getBankAccount(hostId))
  }

  const handleAccountEdit = () => {
    if (bankAccount) {
      setAccountForm({
        bankCode: bankAccount.bankCode,
        accountNumber: bankAccount.accountNumber,
        accountHolder: bankAccount.accountHolder
      })
    }
    setIsModalOpen(true)
  }

  const handleAccountSave = async () => {
    if (!accountForm.bankCode || !accountForm.accountNumber || !accountForm.accountHolder) {
      alert('모든 정보를 입력해주세요')
      return
    }

    setIsSaving(true)

    try {
      const result = saveBankAccount(hostId, accountForm)
      if (result.success) {
        setBankAccount(result.account)
        setIsModalOpen(false)
        alert('계좌 정보가 저장되었습니다')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">정산예정</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">정산완료</span>
      default:
        return null
    }
  }

  const handleViewDetail = (settlementId) => {
    const detail = getSettlementDetail(hostId, settlementId)
    if (detail) {
      setSelectedSettlement(detail)
      setShowDetailModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">정산 관리</h1>

        {/* 정산 요약 카드 */}
        {summary && (
          <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-6 mb-6 text-white">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-violet-200 text-sm mb-1">정산 예정금액</p>
                <p className="text-3xl font-bold">{formatPrice(summary.pendingAmount)}원</p>
                <p className="text-sm text-violet-200 mt-1">{summary.pendingTransactions}건의 거래</p>
              </div>
              <div className="text-right">
                <p className="text-violet-200 text-sm mb-1">총 정산 완료</p>
                <p className="text-xl font-semibold">{formatPrice(summary.totalSettled)}원</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-violet-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-violet-200">다음 정산일</span>
              </div>
              <span className="font-semibold">{summary.nextSettlementDate}</span>
            </div>
          </div>
        )}

        {/* 수수료 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-amber-600 text-xl">💡</span>
            <div>
              <p className="font-medium text-amber-800">정산 안내</p>
              <p className="text-sm text-amber-700 mt-1">
                결제 금액의 5%가 서비스 수수료로 차감됩니다. 정산은 매월 5일에 진행됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 계좌 정보 */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">정산 계좌</h2>
            <button
              onClick={handleAccountEdit}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              {bankAccount ? '수정' : '등록'}
            </button>
          </div>

          {bankAccount ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">{bankAccount.bankName}</p>
                <p className="text-sm text-gray-500">{bankAccount.accountNumber} · {bankAccount.accountHolder}</p>
              </div>
              {bankAccount.isVerified && (
                <span className="ml-auto px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  인증완료
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors"
            >
              + 정산 계좌 등록
            </button>
          )}
        </div>

        {/* 정산 내역 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">정산 내역</h2>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">정산 내역이 없습니다</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      정산월
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      거래건수
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      거래금액
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      수수료
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      정산금액
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleViewDetail(item.id)}
                      className="hover:bg-violet-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{formatMonth(item.month)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                        {item.transactionCount}건
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                        {formatPrice(item.totalAmount)}원
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-red-500">
                        -{formatPrice(item.feeAmount)}원
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-semibold text-gray-900">{formatPrice(item.settlementAmount)}원</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusBadge(item.status)}
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 계좌 등록/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {bankAccount ? '계좌 정보 수정' : '정산 계좌 등록'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="p-6 space-y-4">
              {/* 은행 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  은행 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  value={accountForm.bankCode}
                  onChange={(e) => setAccountForm({ ...accountForm, bankCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                >
                  <option value="">은행을 선택하세요</option>
                  {BANK_LIST.map((bank) => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>

              {/* 계좌번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계좌번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountForm.accountNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                  placeholder="- 없이 입력"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              {/* 예금주 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예금주 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountForm.accountHolder}
                  onChange={(e) => setAccountForm({ ...accountForm, accountHolder: e.target.value })}
                  placeholder="예금주명 입력"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAccountSave}
                disabled={isSaving}
                className="flex-1 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정산 상세 모달 */}
      {showDetailModal && selectedSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDetailModal(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {formatMonth(selectedSettlement.month)} 정산 상세
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 정산 요약 */}
            <div className="p-6 bg-gradient-to-br from-violet-50 to-violet-100 border-b border-violet-100">
              <h3 className="font-medium text-violet-900 mb-4">정산 요약</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">총 거래건수</p>
                  <p className="text-xl font-bold text-gray-900">{selectedSettlement.transactionCount}건</p>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">거래 금액</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(selectedSettlement.totalAmount)}원</p>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">수수료 ({selectedSettlement.feeRate}%)</p>
                  <p className="text-xl font-bold text-red-500">-{formatPrice(selectedSettlement.feeAmount)}원</p>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">정산 금액</p>
                  <p className="text-xl font-bold text-violet-600">{formatPrice(selectedSettlement.settlementAmount)}원</p>
                </div>
              </div>
            </div>

            {/* 거래 내역 */}
            <div className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">거래 내역</h3>
              <div className="space-y-3">
                {selectedSettlement.transactions?.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">{txn.date.slice(5, 7)}월</p>
                        <p className="text-lg font-bold text-gray-900">{txn.date.slice(8)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{txn.spaceName}</p>
                        <p className="text-sm text-gray-500">{txn.guestName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(txn.amount)}원</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowDetailModal(false)}
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
