import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getRequest } from '../stores/requestStore'

export default function MatchingWait() {
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('id')
  const navigate = useNavigate()
  const { user } = useAuth()

  const [request, setRequest] = useState(null)
  const [progress, setProgress] = useState(0)

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
                📬
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
              견적 요청이 완료되었어요!
            </h1>
            <p className="text-gray-500 mb-6">
              조건에 맞는 공간을 찾고 있어요<br />
              곧 호스트들의 견적이 도착할 거예요
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
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">견적 도착 알림</p>
                <p className="text-sm text-gray-500">
                  호스트가 견적을 보내면 알림을 받게 됩니다
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left mt-4">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
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

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              to="/my-requests"
              className="block w-full py-4 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 transition-colors"
            >
              내 요청 보러가기
            </Link>
            <Link
              to="/"
              className="block w-full py-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>

          {/* Info */}
          <p className="mt-6 text-sm text-gray-400">
            평균 24시간 이내에 첫 견적이 도착해요
          </p>
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          ← 홈으로
        </Link>
        <Link
          to="/my-requests"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          → 내 요청 보기
        </Link>
      </div>
    </div>
  )
}
