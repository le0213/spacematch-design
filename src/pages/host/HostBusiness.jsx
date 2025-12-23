import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import HostHeader from '../../components/HostHeader'
import { getHostByUserId, getHostStats } from '../../stores/hostStore'
import { getUnreadCountForHost } from '../../stores/chatStore'
import {
  getBusinessByHost,
  updateBusiness,
  getOperationStatusText,
  getBusinessTypeText,
  formatPhoneNumber,
  formatBusinessNumber
} from '../../stores/businessStore'

export default function HostBusiness() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [host, setHost] = useState(null)
  const [stats, setStats] = useState(null)
  const [unreadChats, setUnreadChats] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // 폼 상태
  const [formData, setFormData] = useState({
    operationStatus: 'active',
    phone: '',
    email: '',
    businessType: 'individual',
    ownerName: '',
    businessName: '',
    businessNumber: '',
    businessAddress: '',
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/host/login')
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading])

  const loadData = () => {
    const hostData = getHostByUserId(user.id)
    if (hostData) {
      setHost(hostData)
      const hostStats = getHostStats(hostData.id)
      setStats(hostStats)

      // 채팅 안읽음 수
      const unread = getUnreadCountForHost(hostData.id)
      setUnreadChats(unread)

      // 사업자 정보 불러오기
      const businessData = getBusinessByHost(hostData.id)
      if (businessData) {
        setFormData({
          operationStatus: businessData.operationStatus || 'active',
          phone: businessData.phone || '',
          email: businessData.email || '',
          businessType: businessData.businessType || 'individual',
          ownerName: businessData.ownerName || '',
          businessName: businessData.businessName || '',
          businessNumber: businessData.businessNumber || '',
          businessAddress: businessData.businessAddress || '',
          bankName: businessData.bankName || '',
          accountNumber: businessData.accountNumber || '',
          accountHolder: businessData.accountHolder || ''
        })
      }
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!host) return

    setSaving(true)
    try {
      updateBusiness(host.id, formData)
      setSuccessMessage('사업자 정보가 저장되었습니다.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to save business info:', error)
    }
    setSaving(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader stats={stats} unreadChats={unreadChats} />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">사업자관리</h1>
          <p className="text-gray-500 mt-1">운영 상태, 연락처, 사업자 정보를 관리합니다</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 운영 상태 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">운영 상태</h2>
            <div className="flex gap-4">
              <label className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.operationStatus === 'active'
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="operationStatus"
                  value="active"
                  checked={formData.operationStatus === 'active'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.operationStatus === 'active'
                      ? 'border-violet-600'
                      : 'border-gray-300'
                  }`}>
                    {formData.operationStatus === 'active' && (
                      <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">영업중</p>
                    <p className="text-sm text-gray-500">견적 요청을 받을 수 있습니다</p>
                  </div>
                </div>
              </label>
              <label className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.operationStatus === 'paused'
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="operationStatus"
                  value="paused"
                  checked={formData.operationStatus === 'paused'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.operationStatus === 'paused'
                      ? 'border-violet-600'
                      : 'border-gray-300'
                  }`}>
                    {formData.operationStatus === 'paused' && (
                      <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">휴업중</p>
                    <p className="text-sm text-gray-500">견적 요청이 일시 중단됩니다</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">연락처 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">휴대폰</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* 사업자 정보 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">사업자 정보</h2>
            <div className="space-y-4">
              {/* 사업자 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">대표자 구분</label>
                <div className="flex gap-4">
                  <label className={`flex-1 p-3 border-2 rounded-xl cursor-pointer text-center transition-all ${
                    formData.businessType === 'individual'
                      ? 'border-violet-600 bg-violet-50 text-violet-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="businessType"
                      value="individual"
                      checked={formData.businessType === 'individual'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    개인사업자
                  </label>
                  <label className={`flex-1 p-3 border-2 rounded-xl cursor-pointer text-center transition-all ${
                    formData.businessType === 'corporate'
                      ? 'border-violet-600 bg-violet-50 text-violet-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="businessType"
                      value="corporate"
                      checked={formData.businessType === 'corporate'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    법인사업자
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">대표자명</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상호명</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="스페이스클라우드"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사업자등록번호</label>
                <input
                  type="text"
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  placeholder="123-45-67890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사업장 주소</label>
                <input
                  type="text"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  placeholder="서울특별시 강남구 테헤란로 123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* 정산 계좌 정보 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">정산 계좌 정보</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">은행명</label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  >
                    <option value="">선택</option>
                    <option value="신한은행">신한은행</option>
                    <option value="국민은행">국민은행</option>
                    <option value="우리은행">우리은행</option>
                    <option value="하나은행">하나은행</option>
                    <option value="농협은행">농협은행</option>
                    <option value="기업은행">기업은행</option>
                    <option value="카카오뱅크">카카오뱅크</option>
                    <option value="토스뱅크">토스뱅크</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">예금주</label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleChange}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">계좌번호</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="'-' 없이 입력"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 focus:ring-4 focus:ring-violet-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-8 bg-amber-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">정산 계좌 변경 안내</p>
              <p className="text-amber-600">정산 계좌 정보 변경 시, 다음 정산일부터 적용됩니다. 정확한 정보를 입력해 주세요.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
