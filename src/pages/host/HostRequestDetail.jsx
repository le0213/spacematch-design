import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getHostByUserId, formatPrice } from '../../stores/hostStore'
import { getRequest, markRequestAsViewed } from '../../stores/requestStore'
import { getQuotesByRequest, getHostQuoteForRequest, updateQuoteContent } from '../../stores/quoteStore'
import { addMessage, getOrCreateChatRoom } from '../../stores/chatStore'
import SpaceInfoCard from '../../components/SpaceInfoCard'

export default function HostRequestDetail() {
  const { requestId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [host, setHost] = useState(null)
  const [request, setRequest] = useState(null)
  const [sentQuotes, setSentQuotes] = useState([])
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    spaceName: '',
    description: '',
    items: [],
  })
  const [saving, setSaving] = useState(false)

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
    setHost(hostData)

    const requestData = getRequest(requestId)
    if (!requestData) {
      navigate('/host/requests')
      return
    }
    setRequest(requestData)

    // 요청을 확인했다고 표시
    if (hostData) {
      markRequestAsViewed(requestId, hostData.id)
    }

    // 이 요청에 대해 발송한 견적 확인
    const quotes = getQuotesByRequest(requestId)
    const myQuotes = quotes.filter(q => q.hostId === hostData?.id)
    setSentQuotes(myQuotes)

    // 내가 보낸 견적 가져오기
    const myQuote = getHostQuoteForRequest(hostData?.id, requestId)
    setQuote(myQuote)

    // 수정 폼 초기화
    if (myQuote) {
      setEditForm({
        spaceName: myQuote.spaceName || '',
        description: myQuote.description || '',
        items: myQuote.items ? [...myQuote.items] : [],
      })
    }

    setLoading(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const generateQuoteNumber = () => {
    if (!quote) return 'SCQ-0000-0000'
    const date = new Date(quote.createdAt)
    const year = date.getFullYear()
    const num = quote.id.slice(-4).padStart(4, '0')
    return `SCQ-${year}-${num}`
  }

  // 수정 모드 핸들러
  const handleStartEdit = () => {
    setEditForm({
      spaceName: quote?.spaceName || '',
      description: quote?.description || '',
      items: quote?.items ? quote.items.map(item => ({ ...item })) : [],
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...editForm.items]
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'price' ? parseInt(value) || 0 : value,
    }
    setEditForm({ ...editForm, items: newItems })
  }

  const handleAddItem = () => {
    setEditForm({
      ...editForm,
      items: [...editForm.items, { name: '', price: 0 }],
    })
  }

  const handleRemoveItem = (index) => {
    const newItems = editForm.items.filter((_, i) => i !== index)
    setEditForm({ ...editForm, items: newItems })
  }

  const calculateSubtotal = () => {
    return editForm.items.reduce((sum, item) => sum + (item.price || 0), 0)
  }

  const handleSaveAndResend = async () => {
    if (!quote) return

    setSaving(true)
    try {
      const subtotal = calculateSubtotal()

      // 견적 업데이트
      const updatedQuote = updateQuoteContent(quote.id, {
        spaceName: editForm.spaceName,
        description: editForm.description,
        items: editForm.items,
        price: subtotal,
      })

      // 채팅방에 수정된 견적 메시지 추가
      const chatRoom = getOrCreateChatRoom(
        quote.id,
        request.userId,
        host.id,
        updatedQuote
      )

      if (chatRoom) {
        addMessage(chatRoom.id, {
          senderId: host.id,
          senderType: 'host',
          type: 'quote',
          content: '[수정됨] 공간대여 견적서가 수정되었습니다.',
          quoteId: quote.id,
          quoteData: {
            spaceName: editForm.spaceName,
            price: subtotal,
            isModified: true,
          }
        })
      }

      // 상태 업데이트
      setQuote(updatedQuote)
      setIsEditing(false)

      alert('견적서가 수정되어 채팅방에 재발행되었습니다.')
    } catch (error) {
      console.error('Failed to save quote:', error)
      alert('견적서 수정에 실패했습니다.')
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

  if (!request) return null

  const hasSentQuote = sentQuotes.length > 0 || request.isAutoQuote
  const subtotal = quote?.items?.reduce((sum, item) => sum + (item.price || 0), 0) || quote?.price || 0
  const vat = Math.round(subtotal * 0.1)
  const total = subtotal + vat

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/host/requests" className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <Link to="/host" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl text-gray-900">스페이스매치</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">보유 캐시</div>
              <div className="font-semibold text-violet-600">{formatPrice(host?.cash || 0)}원</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Status Badge */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
            hasSentQuote
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {hasSentQuote ? '견적 발송 완료' : '대기중'}
          </span>
          {request.isAutoQuote && (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-violet-100 text-violet-700">
              바로견적
            </span>
          )}
          <span className="text-sm text-gray-500">{formatDate(request.createdAt)}</span>
        </div>

        {/* Request Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {request.summary?.category || '서비스 요청'}
        </h1>

        {/* Request Content */}
        <div className="bg-white rounded-2xl border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">요청 내용</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{request.query}</p>
          </div>

          {/* Request Details */}
          {request.summary && (
            <div className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">상세 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                {request.summary.date && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">예정일</div>
                    <div className="text-gray-900">{request.summary.date}</div>
                  </div>
                )}
                {request.summary.location && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">위치</div>
                    <div className="text-gray-900">{request.summary.location}</div>
                  </div>
                )}
                {request.summary.size && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">규모</div>
                    <div className="text-gray-900">{request.summary.size}</div>
                  </div>
                )}
                {request.summary.budget && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">예산</div>
                    <div className="text-gray-900">{request.summary.budget}</div>
                  </div>
                )}
              </div>

              {/* Additional Items */}
              {request.summary.items && request.summary.items.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-sm text-gray-500 mb-2">요청 항목</div>
                  <div className="flex flex-wrap gap-2">
                    {request.summary.items.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 발송 후: 견적서 카드 */}
        {hasSentQuote && quote && !isEditing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* 견적서 헤더 */}
            <div className="bg-violet-600 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-sm">S</span>
                    </div>
                    <span className="font-semibold text-sm">스페이스매치</span>
                  </div>
                  <h2 className="text-xl font-bold">공간대여 견적서</h2>
                </div>
                <div className="text-right">
                  <p className="text-violet-200 text-xs mb-1">견적번호</p>
                  <p className="font-mono font-semibold text-sm">{generateQuoteNumber()}</p>
                </div>
              </div>
            </div>

            {/* 견적서 내용 */}
            <div className="p-6">
              {/* 공간 정보 */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{quote.spaceName}</h3>
                <p className="text-gray-600 text-sm">{quote.description}</p>
              </div>

              {/* 공간 상세 정보 - 스페이스클라우드 연동 */}
              {quote.space && (
                <div className="mb-6">
                  <SpaceInfoCard space={quote.space} variant="compact" />
                </div>
              )}

              {/* 상세 견적 테이블 */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  상세 견적
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">항목</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 w-28">금액</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {quote.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {item.price === 0 ? '무료' : `${formatPrice(item.price)}원`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 금액 요약 */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">소계 (공급가액)</span>
                    <span className="text-gray-900">{formatPrice(subtotal)}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">부가세 (10%)</span>
                    <span className="text-gray-900">{formatPrice(vat)}원</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">총 금액</span>
                    <span className="text-xl font-bold text-violet-600">{formatPrice(total)}원</span>
                  </div>
                </div>
              </div>

              {/* 발송 정보 */}
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>발송일시</span>
                  <span>{formatDate(quote.createdAt)}</span>
                </div>
                {quote.isModified && quote.modifiedAt && (
                  <div className="flex justify-between">
                    <span>최종수정</span>
                    <span>{formatDate(quote.modifiedAt)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>상태</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      quote.status === '열람'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {quote.status}
                    </span>
                    {quote.isModified && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                        수정됨
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 수정 버튼 */}
            <div className="px-6 pb-6">
              <button
                onClick={handleStartEdit}
                className="w-full py-3 bg-white border border-violet-300 text-violet-600 font-medium rounded-xl hover:bg-violet-50 transition-colors"
              >
                견적서 수정하기
              </button>
            </div>
          </div>
        )}

        {/* 수정 모드 */}
        {hasSentQuote && quote && isEditing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* 수정 모드 헤더 */}
            <div className="bg-orange-500 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">견적서 수정</h2>
                  <p className="text-orange-100 text-sm mt-1">수정 후 채팅방에 재발행됩니다</p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>

            {/* 수정 폼 */}
            <div className="p-6">
              {/* 공간명 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">공간명</label>
                <input
                  type="text"
                  value={editForm.spaceName}
                  onChange={(e) => setEditForm({ ...editForm, spaceName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>

              {/* 설명 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">견적 설명</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                />
              </div>

              {/* 견적 항목 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">견적 항목</label>
                  <button
                    onClick={handleAddItem}
                    className="text-sm text-violet-600 font-medium hover:text-violet-700"
                  >
                    + 항목 추가
                  </button>
                </div>
                <div className="space-y-3">
                  {editForm.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="항목명"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        placeholder="금액"
                        className="w-32 px-4 py-3 border border-gray-300 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-right"
                      />
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 금액 요약 */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">소계 (공급가액)</span>
                    <span className="text-gray-900">{formatPrice(calculateSubtotal())}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">부가세 (10%)</span>
                    <span className="text-gray-900">{formatPrice(Math.round(calculateSubtotal() * 0.1))}원</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">총 금액</span>
                    <span className="text-xl font-bold text-violet-600">
                      {formatPrice(calculateSubtotal() + Math.round(calculateSubtotal() * 0.1))}원
                    </span>
                  </div>
                </div>
              </div>

              {/* 저장 버튼 */}
              <button
                onClick={handleSaveAndResend}
                disabled={saving}
                className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '저장 및 채팅창 재발행'}
              </button>
            </div>
          </div>
        )}

        {/* 발송 전: 견적서 작성하기 버튼 */}
        {!hasSentQuote && (
          <>
            <div className="bg-violet-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-violet-800">
                  <p className="font-medium mb-1">견적 발송 시 1,000원의 캐시가 차감됩니다</p>
                  <p className="text-violet-600">현재 보유 캐시: {formatPrice(host?.cash || 0)}원</p>
                </div>
              </div>
            </div>

            <Link
              to={`/host/quotes/sheet?requestId=${requestId}`}
              className="block w-full py-4 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 transition-colors text-center"
            >
              견적서 작성하기
            </Link>
          </>
        )}

        {/* 발송 후: 채팅방 이동 버튼 */}
        {hasSentQuote && (
          <div className="flex gap-4">
            <Link
              to={`/host/chats`}
              className="flex-1 py-4 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors text-center"
            >
              채팅방으로 이동
            </Link>
            <Link
              to="/host/requests"
              className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
            >
              목록으로 돌아가기
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
