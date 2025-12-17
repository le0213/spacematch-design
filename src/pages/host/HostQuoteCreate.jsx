import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getHostByUserId, deductCash, formatPrice, QUOTE_COST } from '../../stores/hostStore'
import { getRequest, updateRequest } from '../../stores/requestStore'
import { createQuote } from '../../stores/quoteStore'

export default function HostQuoteCreate() {
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('requestId')
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [host, setHost] = useState(null)
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    spaceName: '',
    description: '',
    price: '',
    estimatedDuration: '',
    items: [{ name: '', price: '' }],
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/host/login')
      return
    }

    if (user && requestId) {
      loadData()
    }
  }, [user, authLoading, requestId])

  const loadData = () => {
    const hostData = getHostByUserId(user.id)
    if (!hostData) {
      navigate('/host/dashboard')
      return
    }
    setHost(hostData)

    const requestData = getRequest(requestId)
    if (!requestData) {
      navigate('/host/requests')
      return
    }
    setRequest(requestData)

    // 기본값 설정
    setFormData(prev => ({
      ...prev,
      spaceName: `${hostData.name} 전문 서비스`,
    }))

    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', price: '' }],
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length === 1) return
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseInt(item.price) || 0)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!formData.spaceName.trim()) {
      setError('서비스명을 입력해주세요.')
      return
    }
    if (!formData.description.trim()) {
      setError('견적 설명을 입력해주세요.')
      return
    }
    if (calculateTotal() <= 0) {
      setError('견적 항목을 입력해주세요.')
      return
    }

    // 캐시 확인
    if ((host.cash + host.points) < QUOTE_COST) {
      setError(`캐시가 부족합니다. (필요: ${formatPrice(QUOTE_COST)}원, 보유: ${formatPrice(host.cash + host.points)}원)`)
      return
    }

    setSubmitting(true)

    try {
      // 캐시 차감
      deductCash(host.id, QUOTE_COST)

      // 견적 생성
      const quoteData = {
        requestId,
        guestId: request.userId,
        hostId: host.id,
        host: {
          id: host.id,
          name: host.name,
          profileImage: `https://ui-avatars.com/api/?name=${host.name}&background=random`,
          rating: host.rating || 0,
          reviewCount: host.reviewCount || 0,
          responseRate: host.responseRate || 100,
        },
        spaceName: formData.spaceName,
        description: formData.description,
        price: calculateTotal(),
        items: formData.items.filter(item => item.name && item.price).map(item => ({
          name: item.name,
          price: parseInt(item.price),
        })),
        estimatedDuration: formData.estimatedDuration || '협의 후 결정',
        availableDate: '협의 후 결정',
      }

      createQuote(quoteData)

      // 요청 상태 업데이트
      updateRequest(requestId, { status: '견적서 발송 완료' })

      // 성공 페이지로 이동
      navigate(`/host/requests/${requestId}?sent=true`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!request) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/host/requests/${requestId}`} className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">견적서 작성</h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">보유 캐시</div>
            <div className="font-semibold text-violet-600">{formatPrice(host?.cash || 0)}원</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Request Summary */}
        <div className="bg-gray-100 rounded-xl p-4 mb-6">
          <div className="text-sm text-gray-500 mb-1">요청 내용</div>
          <p className="text-gray-900 line-clamp-2">{request.query}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              서비스명 *
            </label>
            <input
              type="text"
              name="spaceName"
              value={formData.spaceName}
              onChange={handleChange}
              placeholder="예: 프리미엄 청소 서비스"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              견적 설명 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="게스트에게 전달할 메시지를 입력하세요. 작업 방식, 특징, 주의사항 등을 포함하면 좋습니다."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none"
            />
          </div>

          {/* Quote Items */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">
                견적 항목 *
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                + 항목 추가
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="항목명"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                  />
                  <div className="relative w-40">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      placeholder="금액"
                      className="w-full px-4 py-3 pr-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">원</span>
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-3 text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-medium text-gray-900">총 견적금액</span>
              <span className="text-2xl font-bold text-violet-600">
                {formatPrice(calculateTotal())}원
              </span>
            </div>
          </div>

          {/* Duration */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예상 소요시간
            </label>
            <input
              type="text"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              placeholder="예: 2~3시간"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Cost Notice */}
          <div className="bg-violet-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-violet-800">
                <p className="font-medium mb-1">견적 발송 시 {formatPrice(QUOTE_COST)}원의 캐시가 차감됩니다</p>
                <p className="text-violet-600">게스트가 견적을 열람하지 않으면 포인트로 환급됩니다.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                발송 중...
              </>
            ) : (
              <>
                견적서 발송하기
                <span className="text-violet-200">({formatPrice(QUOTE_COST)}원 차감)</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
