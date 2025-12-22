import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getHostByUserId, formatPrice, deductCash, canAffordQuote, QUOTE_COST } from '../../stores/hostStore'
import { getRequest, updateRequest } from '../../stores/requestStore'
import { createQuote, hasHostQuotedRequest } from '../../stores/quoteStore'
import { getOrCreateChatRoom } from '../../stores/chatStore'
import {
  getTemplatesByHost,
  incrementUsageCount,
  createTemplate
} from '../../stores/quoteTemplateStore'

export default function HostQuoteSheet() {
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('requestId')
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [host, setHost] = useState(null)
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 견적서 폼
  const [spaceName, setSpaceName] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState([
    { name: '공간 대여료', price: 0 }
  ])
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')

  // 템플릿 모달
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templates, setTemplates] = useState([])
  const [templateSearch, setTemplateSearch] = useState('')

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
      navigate('/host/requests')
      return
    }
    setHost(hostData)

    const requestData = getRequest(requestId)
    if (!requestData) {
      navigate('/host/requests')
      return
    }
    setRequest(requestData)

    // 이미 견적을 보냈는지 확인
    if (hasHostQuotedRequest(hostData.id, requestId)) {
      navigate(`/host/requests/${requestId}`)
      return
    }

    // 템플릿 불러오기
    const hostTemplates = getTemplatesByHost(hostData.id)
    setTemplates(hostTemplates)

    setLoading(false)
  }

  const loadTemplate = (template) => {
    setSpaceName(template.spaceName)
    setDescription(template.description)
    setItems([...template.items])
    setEstimatedDuration(template.estimatedDuration)
    incrementUsageCount(template.id)
    setShowTemplateModal(false)
  }

  const addItem = () => {
    setItems([...items, { name: '', price: 0 }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = field === 'price' ? parseInt(value) || 0 : value
    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const vat = Math.round(subtotal * 0.1)
  const total = subtotal + vat

  const handleSubmit = async () => {
    if (!spaceName.trim()) {
      alert('공간명을 입력해주세요.')
      return
    }

    if (!description.trim()) {
      alert('견적 설명을 입력해주세요.')
      return
    }

    if (items.some(item => !item.name.trim())) {
      alert('모든 항목의 이름을 입력해주세요.')
      return
    }

    if (subtotal <= 0) {
      alert('견적 금액을 입력해주세요.')
      return
    }

    if (!canAffordQuote(host.id)) {
      alert('캐시가 부족합니다. 충전 후 다시 시도해주세요.')
      navigate('/host/wallet/charge')
      return
    }

    setSubmitting(true)

    try {
      // 캐시 차감
      deductCash(host.id, QUOTE_COST, `견적 발송 - ${request.category || '서비스 요청'}`)

      // 견적 생성
      const newQuote = createQuote({
        requestId: requestId,
        guestId: request.userId,
        hostId: host.id,
        host: {
          id: host.id,
          name: host.name || user.name,
          profileImage: host.profileImage,
          rating: host.rating || 0,
          reviewCount: host.reviewCount || 0,
          responseRate: host.responseRate || 100
        },
        spaceName,
        description,
        items,
        price: subtotal,
        estimatedDuration,
        isAutoQuote: false
      })

      // 채팅방 생성 (견적서 카드에 필요한 전체 데이터 전달)
      getOrCreateChatRoom(newQuote.id, request.userId, host.id, {
        id: newQuote.id,
        spaceName: newQuote.spaceName,
        description: newQuote.description,
        items: newQuote.items,
        price: newQuote.price,
        estimatedDuration: newQuote.estimatedDuration
      })

      // 요청 상태 업데이트
      updateRequest(requestId, { status: '견적서 발송 완료' })

      // 템플릿 저장
      if (saveAsTemplate && templateName.trim()) {
        createTemplate({
          hostId: host.id,
          name: templateName,
          spaceName,
          description,
          items: [...items],
          totalPrice: subtotal,
          estimatedDuration,
          isDefault: false
        })
      }

      navigate(`/host/requests/${requestId}`)
    } catch (error) {
      alert(error.message || '견적 발송에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    t.spaceName.toLowerCase().includes(templateSearch.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/host/requests/${requestId}`} className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-semibold text-gray-900">견적서 작성</h1>
          </div>

          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-lg text-sm font-medium hover:bg-violet-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            템플릿 불러오기
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* 요청 정보 */}
        <div className="bg-white rounded-xl p-5 mb-6 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">요청 정보</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-gray-700">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {request.category || request.summary?.category || '서비스 요청'}
            </span>
            {(request.location || request.summary?.location) && (
              <span className="flex items-center gap-1.5 text-gray-700">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {request.location || request.summary?.location}
              </span>
            )}
            {(request.date || request.summary?.date) && (
              <span className="flex items-center gap-1.5 text-gray-700">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {request.date || request.summary?.date}
              </span>
            )}
            {(request.people || request.summary?.people) && (
              <span className="flex items-center gap-1.5 text-gray-700">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {request.people || request.summary?.people}명
              </span>
            )}
          </div>
          <p className="mt-3 text-sm text-gray-500 line-clamp-2">
            {request.query || request.summary || '요청 상세 내용'}
          </p>
        </div>

        {/* 견적서 폼 */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
          {/* 공간명 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">공간명 *</label>
            <input
              type="text"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="예: 강남 프리미엄 회의실"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* 견적 설명 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">견적 설명 *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="공간 소개 및 제공 서비스에 대해 설명해주세요."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 예상 소요 시간 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">예상 이용 시간</label>
            <input
              type="text"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="예: 4시간"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* 견적 항목 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">견적 항목 *</label>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="항목명"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <div className="relative w-40">
                    <input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">원</span>
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addItem}
              className="mt-3 flex items-center gap-2 text-violet-600 text-sm font-medium hover:text-violet-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              항목 추가
            </button>
          </div>

          {/* 금액 계산 */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">공급가액</span>
                <span className="text-gray-900">{formatPrice(subtotal)}원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">부가세 (10%)</span>
                <span className="text-gray-900">{formatPrice(vat)}원</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-900">합계</span>
                <span className="text-xl font-bold text-violet-600">{formatPrice(total)}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 템플릿으로 저장 */}
        <div className="bg-white rounded-xl p-5 mb-6 border border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">자주 작성하는 견적으로 저장</span>
          </label>
          {saveAsTemplate && (
            <div className="mt-4">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="템플릿 이름을 입력하세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* 발송 비용 안내 */}
        <div className="bg-amber-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-amber-600 text-xl">💡</span>
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">견적 발송 비용 안내</p>
              <p className="text-amber-700">
                견적 발송 시 {formatPrice(QUOTE_COST)}원이 차감됩니다. (현재 보유: {formatPrice(host?.cash || 0)}원 캐시, {formatPrice(host?.points || 0)}P 포인트)
              </p>
            </div>
          </div>
        </div>

        {/* 발송 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !canAffordQuote(host?.id)}
          className={`w-full py-4 font-semibold rounded-full transition-colors flex items-center justify-center gap-2 ${
            submitting || !canAffordQuote(host?.id)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              발송 중...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              견적서 발송하기 ({formatPrice(QUOTE_COST)}원 차감)
            </>
          )}
        </button>
      </main>

      {/* 템플릿 선택 모달 */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTemplateModal(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">템플릿 선택</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 검색 */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="템플릿 검색..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 템플릿 목록 */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">저장된 템플릿이 없습니다.</p>
                  <Link
                    to="/host/quote-templates"
                    className="inline-block mt-3 text-violet-600 text-sm font-medium hover:underline"
                  >
                    템플릿 관리하기
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {template.isDefault && (
                            <span className="text-amber-500">⭐</span>
                          )}
                          <span className="font-semibold text-gray-900">{template.name}</span>
                        </div>
                        <span className="text-violet-600 font-semibold">{formatPrice(template.totalPrice)}원</span>
                      </div>
                      <p className="text-sm text-gray-500">{template.spaceName}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {template.items.length}개 항목 · {template.usageCount}회 사용
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
