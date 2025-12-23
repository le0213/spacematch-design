import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getQuote } from '../stores/quoteStore'
import { formatPrice } from '../stores/paymentStore'

export default function QuoteSheet() {
  const { quoteId } = useParams()
  const { user, loading: authLoading } = useAuth()

  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/login?redirect=/quote-sheet/${quoteId}`)
      return
    }

    if (user && quoteId) {
      loadData()
    }
  }, [user, authLoading, quoteId])

  const loadData = () => {
    const quoteData = getQuote(quoteId)
    if (!quoteData) {
      // Mock 데이터가 없으면 기본 데이터 사용
      const mockQuote = {
        id: quoteId,
        host: {
          id: 'host_1',
          name: '강남 프리미엄 회의실',
          representative: '김스페이스',
          businessNumber: '123-45-67890',
          phone: '02-1234-5678',
          email: 'gangnam@spacematch.com',
          address: '서울시 강남구 테헤란로 123, 4층',
          profileImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop',
          rating: 4.9,
          reviewCount: 128,
        },
        spaceName: '강남 프리미엄 회의실',
        price: 150000,
        description: '강남역 3번 출구에서 도보 3분 거리에 위치한 프리미엄 회의실입니다.',
        items: [
          { name: '공간 대여료 (4시간)', price: 120000 },
          { name: '빔프로젝터 사용', price: 0 },
          { name: '음료 서비스', price: 30000 },
        ],
        estimatedDuration: '4시간',
        eventName: '팀 워크숍',
        eventDate: '2025년 1월 15일 (수) 14:00 - 18:00',
        guestCount: '20명',
        purpose: '팀 빌딩 워크숍',
        setupType: '세미나형',
        createdAt: new Date().toISOString(),
      }
      setQuote(mockQuote)
    } else {
      // 실제 데이터에 추가 정보 보완
      setQuote({
        ...quoteData,
        host: {
          ...quoteData.host,
          representative: quoteData.host?.representative || '호스트',
          businessNumber: quoteData.host?.businessNumber || '000-00-00000',
          phone: quoteData.host?.phone || '02-0000-0000',
          email: quoteData.host?.email || 'host@spacematch.com',
          address: quoteData.host?.address || '서울시 강남구',
        },
        eventName: quoteData.eventName || '공간 대여',
        eventDate: quoteData.eventDate || '협의 후 결정',
        guestCount: quoteData.guestCount || '미정',
        purpose: quoteData.purpose || '공간 이용',
        setupType: quoteData.setupType || '기본형',
      })
    }
    setLoading(false)
  }

  const generateQuoteNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const num = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `SCQ-${year}-${num}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">견적서를 찾을 수 없습니다.</p>
          <Link to="/quotes" className="text-violet-600 hover:underline">
            받은 견적 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = quote.items?.reduce((sum, item) => sum + item.price, 0) || quote.price
  const vat = Math.round(subtotal * 0.1)
  const total = subtotal + vat

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-4">
          <Link
            to={`/chat/${quoteId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            채팅으로 돌아가기
          </Link>
        </div>

        {/* Quote Sheet */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-violet-600 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-sm">S</span>
                  </div>
                  <span className="font-semibold">스페이스매치</span>
                </div>
                <h1 className="text-2xl font-bold">공간대여 표준견적서</h1>
              </div>
              <div className="text-right">
                <p className="text-violet-200 text-sm mb-1">견적번호</p>
                <p className="font-mono font-semibold">{generateQuoteNumber()}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Host Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  호스트 정보
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">공간명</span>
                    <span className="text-gray-900 font-medium">{quote.host?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">대표자</span>
                    <span className="text-gray-900">{quote.host?.representative}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">사업자번호</span>
                    <span className="text-gray-900">{quote.host?.businessNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">연락처</span>
                    <span className="text-gray-900">{quote.host?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">이메일</span>
                    <span className="text-gray-900">{quote.host?.email}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-gray-500">주소</span>
                    <p className="text-gray-900 mt-1">{quote.host?.address}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  고객 정보
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">고객명</span>
                    <span className="text-gray-900 font-medium">{user?.name || '고객'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">연락처</span>
                    <span className="text-gray-900">{user?.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">이메일</span>
                    <span className="text-gray-900">{user?.email || '-'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">이용 정보</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">행사명</span>
                      <span className="text-gray-900">{quote.eventName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">일시</span>
                      <span className="text-gray-900">{quote.eventDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">인원</span>
                      <span className="text-gray-900">{quote.guestCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">목적</span>
                      <span className="text-gray-900">{quote.purpose}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Details Table */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                상세 견적
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">항목</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 w-32">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quote.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {item.price === 0 ? '무료' : `${formatPrice(item.price)}원`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">소계 (공급가액)</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">부가세 (10%)</span>
                  <span className="text-gray-900">{formatPrice(vat)}원</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">총 금액</span>
                  <span className="text-2xl font-bold text-violet-600">{formatPrice(total)}원</span>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="bg-violet-50 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-violet-800">
                  <p className="font-medium mb-1">견적서 유효기간</p>
                  <p className="text-violet-600">
                    본 견적서는 발행일({formatDate(quote.createdAt)}) 기준 <strong>7일간</strong> 유효합니다.
                    모든 변경사항은 재발행을 통해 효력을 발생시킵니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Button */}
            <Link
              to={`/chat/${quoteId}`}
              className="w-full py-4 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              채팅으로 상담하기
            </Link>

            {/* Footer Note */}
            <p className="text-center text-xs text-gray-400 mt-6">
              본 견적서는 참고용이며, 결제는 채팅을 통해 진행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
