import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getRequest } from '../stores/requestStore'
import { generateMockQuotes } from '../stores/quoteStore'

export default function MatchingWait() {
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('id')
  const navigate = useNavigate()
  const { user } = useAuth()

  const [request, setRequest] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const hasGeneratedQuotes = useRef(false)

  useEffect(() => {
    if (requestId) {
      const req = getRequest(requestId)
      if (req) {
        setRequest(req)
      }
    }

    // 프로그레스 애니메이션
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [requestId])

  // 프로그레스 완료 시 Mock 견적 생성 및 자동 이동
  useEffect(() => {
    if (progress >= 100 && !hasGeneratedQuotes.current && requestId && user) {
      hasGeneratedQuotes.current = true
      setIsComplete(true)

      // Mock 견적 생성
      const mockQuotes = generateMockQuotes(requestId, user.id)

      // 1.5초 후 첫 번째 견적의 채팅방으로 이동
      setTimeout(() => {
        navigate(`/chat/${mockQuotes[0].id}`)
      }, 1500)
    }
  }, [progress, requestId, user, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">스페이스매치</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-lg text-center">
          {/* Animation */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-violet-100 rounded-full flex items-center justify-center mb-6 relative">
              <div className="text-5xl animate-bounce">
                {isComplete ? '✅' : '📬'}
              </div>
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-32 h-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="4"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="4"
                  strokeDasharray={`${progress * 3.64} 364`}
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isComplete ? '매칭이 완료되었어요!' : '견적 요청이 완료되었어요!'}
            </h1>
            <p className="text-gray-500 mb-6">
              {isComplete ? (
                <>잠시 후 채팅으로 이동합니다...</>
              ) : (
                <>조건에 맞는 공간을 찾고 있어요<br />곧 호스트들의 견적이 도착할 거예요</>
              )}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">
              {progress < 100 ? '공간을 찾는 중...' : '매칭 완료!'}
            </p>
          </div>

          {/* Request Summary */}
          {request && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 text-left">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-violet-600">✦</span>
                <span className="font-semibold text-gray-900">요청 요약</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">공간 유형</span>
                  <span className="text-gray-900">{request.spaceType || '회의실'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">이용 목적</span>
                  <span className="text-gray-900">{request.purpose || '워크숍'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">예상 인원</span>
                  <span className="text-gray-900">{request.capacity || '20명'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">희망 지역</span>
                  <span className="text-gray-900">{request.location || '서울 강남구'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-violet-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">다음 단계</h3>
            <div className="flex items-start gap-4 text-left">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isComplete ? 'bg-green-500 text-white' : 'bg-violet-600 text-white'}`}>
                {isComplete ? '✓' : '1'}
              </div>
              <div>
                <p className="font-medium text-gray-900">견적 도착 알림</p>
                <p className="text-sm text-gray-500">
                  호스트가 견적을 보내면 알림을 받게 됩니다
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left mt-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isComplete ? 'bg-violet-600 text-white animate-pulse' : 'bg-violet-600 text-white'}`}>
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">견적 비교 & 채팅</p>
                <p className="text-sm text-gray-500">
                  받은 견적을 비교하고 호스트와 채팅하세요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left mt-4">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">안전 결제</p>
                <p className="text-sm text-gray-500">
                  마음에 드는 공간을 안전하게 예약하세요
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          {!isComplete && (
            <p className="text-sm text-gray-400">
              평균 24시간 이내에 첫 견적이 도착해요
            </p>
          )}

          {/* Loading indicator when complete */}
          {isComplete && (
            <div className="flex items-center justify-center gap-2 text-violet-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600"></div>
              <span className="text-sm font-medium">채팅방으로 이동 중...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
