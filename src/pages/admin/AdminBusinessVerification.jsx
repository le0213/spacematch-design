import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  getBusinessVerificationList,
  getBusinessVerificationStats,
  verifyBusiness,
  formatDateTime
} from '../../stores/adminStore'

export default function AdminBusinessVerification() {
  const [verifications, setVerifications] = useState([])
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0 })
  const [filter, setFilter] = useState('all')
  const [selectedVerification, setSelectedVerification] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = () => {
    setVerifications(getBusinessVerificationList(filter))
    setStats(getBusinessVerificationStats())
  }

  const handleVerify = async (type, approved) => {
    if (!selectedVerification) return

    if (!approved && !rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.')
      return
    }

    setProcessing(true)
    const result = verifyBusiness(selectedVerification.id, type, approved, rejectReason)

    if (result.success) {
      alert(approved ? '검증이 승인되었습니다.' : '검증이 거절되었습니다.')
      loadData()
      // 모달 내 데이터 갱신
      const updated = getBusinessVerificationList().find(v => v.id === selectedVerification.id)
      setSelectedVerification(updated)
      setRejectReason('')
    } else {
      alert(result.message)
    }
    setProcessing(false)
  }

  const openModal = (verification) => {
    setSelectedVerification(verification)
    setRejectReason('')
    setShowModal(true)
  }

  const tabs = [
    { key: 'all', label: '전체' },
    { key: 'pending', label: '검증대기' },
    { key: 'verified', label: '검증완료' },
    { key: 'rejected', label: '검증실패' }
  ]

  const getVerificationBadge = (verified, rejected) => {
    if (rejected) return { text: '거절', color: 'bg-red-100 text-red-700' }
    if (verified) return { text: '완료', color: 'bg-green-100 text-green-700' }
    return { text: '대기', color: 'bg-amber-100 text-amber-700' }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">사업자 검증 관리</h1>

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
                <p className="text-sm text-gray-500">검증 대기</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}건</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">검증 완료</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}건</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">검증 실패</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}건</p>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">호스트</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">대표자구분</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">상호명</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">사업자번호</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">계좌정보</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">제출일</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">사업자검증</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">계좌검증</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">처리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {verifications.map(v => {
                  const bizBadge = getVerificationBadge(v.businessVerified, v.rejectReason && !v.businessVerified)
                  const accBadge = getVerificationBadge(v.accountVerified, v.rejectReason && !v.accountVerified)

                  return (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{v.hostName}</div>
                          <div className="text-xs text-gray-500">{v.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{v.ownerType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{v.businessName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{v.businessNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {v.bankName} {v.accountNumber?.slice(-4)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(v.submittedAt)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${bizBadge.color}`}>
                          {bizBadge.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${accBadge.color}`}>
                          {accBadge.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openModal(v)}
                          className="text-violet-600 hover:text-violet-700 text-sm font-medium"
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {verifications.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      검증 요청이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">사업자 검증 상세</h2>
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
              {/* 호스트 정보 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-3">호스트 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">호스트명</span>
                    <span className="text-gray-900">{selectedVerification.hostName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">이메일</span>
                    <span className="text-gray-900">{selectedVerification.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">제출일</span>
                    <span className="text-gray-900">{formatDateTime(selectedVerification.submittedAt)}</span>
                  </div>
                </div>
              </div>

              {/* 사업자 정보 */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">사업자 정보</h3>
                  {(() => {
                    const badge = getVerificationBadge(selectedVerification.businessVerified, selectedVerification.rejectReason && !selectedVerification.businessVerified)
                    return (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                        {badge.text}
                      </span>
                    )
                  })()}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">대표자 구분</span>
                    <span className="text-gray-900">{selectedVerification.ownerType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">대표자명</span>
                    <span className="text-gray-900">{selectedVerification.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">상호명</span>
                    <span className="text-gray-900">{selectedVerification.businessName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">사업자등록번호</span>
                    <span className="text-gray-900 font-mono">{selectedVerification.businessNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">사업장 주소</span>
                    <span className="text-gray-900">{selectedVerification.businessAddress || '-'}</span>
                  </div>
                </div>
                {!selectedVerification.businessVerified && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleVerify('business', true)}
                      disabled={processing}
                      className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleVerify('business', false)}
                      disabled={processing || !rejectReason.trim()}
                      className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      거절
                    </button>
                  </div>
                )}
              </div>

              {/* 계좌 정보 */}
              <div className="bg-violet-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">정산 계좌 정보</h3>
                  {(() => {
                    const badge = getVerificationBadge(selectedVerification.accountVerified, selectedVerification.rejectReason && !selectedVerification.accountVerified)
                    return (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                        {badge.text}
                      </span>
                    )
                  })()}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">은행</span>
                    <span className="text-gray-900">{selectedVerification.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">예금주</span>
                    <span className="text-gray-900">{selectedVerification.accountHolder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">계좌번호</span>
                    <span className="text-gray-900 font-mono">{selectedVerification.accountNumber}</span>
                  </div>
                </div>
                {!selectedVerification.accountVerified && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleVerify('account', true)}
                      disabled={processing}
                      className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleVerify('account', false)}
                      disabled={processing || !rejectReason.trim()}
                      className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      거절
                    </button>
                  </div>
                )}
              </div>

              {/* 거절 사유 입력 */}
              {(!selectedVerification.businessVerified || !selectedVerification.accountVerified) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    거절 사유 (거절 시 필수)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="거절 사유를 입력하세요..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* 기존 거절 사유 */}
              {selectedVerification.rejectReason && (
                <div className="bg-red-50 rounded-xl p-4">
                  <h3 className="font-medium text-red-800 mb-2">거절 사유</h3>
                  <p className="text-sm text-red-700">{selectedVerification.rejectReason}</p>
                </div>
              )}

              {/* 검증 완료일 */}
              {selectedVerification.verifiedAt && (
                <div className="text-center text-sm text-gray-500">
                  검증 완료일: {formatDateTime(selectedVerification.verifiedAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
