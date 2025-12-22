import { useState, useEffect } from 'react'
import { formatPrice } from '../stores/hostStore'

export default function QuoteCardModal({
  isOpen,
  onClose,
  onSubmit,
  space,
  request,
}) {
  const [formData, setFormData] = useState({
    totalAmount: '',
    discount: 0,
    depositRate: 30,
    description: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      // 초기화
      setFormData({
        totalAmount: '',
        discount: 0,
        depositRate: 30,
        description: '',
      })
      setErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // 유효성 검사
    const newErrors = {}
    if (!formData.totalAmount || parseInt(formData.totalAmount) <= 0) {
      newErrors.totalAmount = '금액을 입력해주세요'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const totalAmount = parseInt(formData.totalAmount)
    const discount = parseInt(formData.discount) || 0
    const finalAmount = totalAmount - discount
    const depositAmount = Math.round(finalAmount * (formData.depositRate / 100))
    const balanceAmount = finalAmount - depositAmount

    onSubmit({
      spaceName: space?.name || '내 공간',
      spaceImage: space?.image,
      totalAmount,
      discount,
      finalAmount,
      depositRate: formData.depositRate,
      depositAmount,
      balanceAmount,
      description: formData.description,
    })
  }

  const totalAmount = parseInt(formData.totalAmount) || 0
  const discount = parseInt(formData.discount) || 0
  const finalAmount = Math.max(0, totalAmount - discount)
  const depositAmount = Math.round(finalAmount * (formData.depositRate / 100))
  const balanceAmount = finalAmount - depositAmount
  const serviceFee = Math.round(finalAmount * 0.05)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">결제 요청 만들기</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Space Info */}
            {space && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {space.image ? (
                    <img src={space.image} alt={space.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{space.name}</h3>
                  <p className="text-sm text-gray-500">{space.location}</p>
                </div>
              </div>
            )}

            {/* Request Summary */}
            {request && (
              <div className="p-4 bg-violet-50 rounded-xl">
                <h4 className="text-sm font-medium text-violet-700 mb-2">요청 정보</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {request.summary?.region && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-700">{request.summary.region}</span>
                    </div>
                  )}
                  {request.summary?.date && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700">{request.summary.date}</span>
                    </div>
                  )}
                  {request.summary?.people && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-gray-700">{request.summary.people}명</span>
                    </div>
                  )}
                  {request.summary?.purpose && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-gray-700">{request.summary.purpose}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                금액 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="0"
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-violet-100 outline-none transition-all ${
                    errors.totalAmount ? 'border-red-500' : 'border-gray-200 focus:border-violet-500'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
              </div>
              {errors.totalAmount && (
                <p className="text-sm text-red-500 mt-1">{errors.totalAmount}</p>
              )}
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                할인 금액 (선택)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
              </div>
            </div>

            {/* Deposit Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                계약금 비율
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="depositRate"
                  value={formData.depositRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="10"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="w-20 px-3 py-2 bg-gray-50 rounded-lg text-center font-medium text-gray-900">
                  {formData.depositRate}%
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>계약금: {formatPrice(depositAmount)}원</span>
                <span>잔금: {formatPrice(balanceAmount)}원</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명 (선택)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="결제 관련 안내사항을 입력하세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
              />
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">서비스 금액</span>
                <span className="text-gray-900">{formatPrice(totalAmount)}원</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">할인</span>
                  <span className="text-red-500">-{formatPrice(discount)}원</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">수수료 (5%)</span>
                <span className="text-gray-900">{formatPrice(serviceFee)}원</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between">
                <span className="font-medium text-gray-900">총 결제 금액</span>
                <span className="text-xl font-bold text-violet-600">
                  {formatPrice(finalAmount + serviceFee)}원
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
            >
              결제 요청 보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
