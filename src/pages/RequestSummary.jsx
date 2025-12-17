import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { GuestHeader } from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { createRequest } from '../stores/requestStore'

// 추천 카테고리 탭
const categoryTabs = [
  { id: 'meeting', name: '회의실', icon: '🏢', recommended: true },
  { id: 'seminar', name: '세미나실', icon: '🎓' },
  { id: 'workshop', name: '워크숍 공간', icon: '💡' },
]

// AI 분석 결과 Mock Data
const getAnalyzedRequest = (query) => ({
  spaceType: { label: '공간 유형을 선택해주세요.', value: '회의실', filled: true },
  purpose: { label: '어떤 목적으로 사용하시나요?', value: '워크숍', filled: true },
  capacity: { label: '예상 인원을 입력해주세요.', value: '20명', filled: true },
  equipment: {
    label: '필요한 장비를 선택해주세요.',
    value: ['프로젝터', '화이트보드'],
    filled: true,
    isMultiple: true
  },
  catering: { label: '다과 서비스가 필요하신가요?', value: '', filled: false, placeholder: '선택해 주세요' },
  parking: { label: '주차 필요 여부를 알려주세요.', value: '', filled: false, placeholder: '선택해 주세요' },
  additionalRequest: {
    label: '추가 요청사항을 알려주세요.',
    value: '',
    filled: false,
    placeholder: '내용을 입력해 주세요',
    isTextarea: true
  },
})

// 기본 정보
const getBasicInfo = (query) => ({
  date: { label: '이용 예정일을 선택해주세요.', value: '', placeholder: '날짜를 선택해 주세요' },
  location: { label: '희망 지역을 선택해주세요.', value: query?.includes('강남') ? '서울 강남구' : '서울', filled: query?.includes('강남') || query?.includes('서울') },
  time: { label: '이용 시간대를 선택해주세요.', value: '', placeholder: '시간을 선택해 주세요' },
})

// FAQ Items
const faqItems = [
  { question: '여러 공간의 견적을 비교하고 싶어요', answer: '견적 요청을 보내시면 조건에 맞는 여러 공간에서 견적을 보내드립니다. 최대 5개의 견적을 비교해보실 수 있어요.' },
  { question: '스페이스매치 서비스 진행 과정이 궁금해요', answer: '조건 입력 → AI 분석 → 견적 수신 → 채팅 상담 → 결제 순으로 진행됩니다.' },
]

export default function RequestSummary() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const query = searchParams.get('q') || ''

  const [activeTab, setActiveTab] = useState('meeting')
  const [formData, setFormData] = useState(getAnalyzedRequest(query))
  const [basicData, setBasicData] = useState(getBasicInfo(query))
  const [openFAQ, setOpenFAQ] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // URL 쿼리에서 AI 분석 결과 생성 (Mock)
  useEffect(() => {
    if (query) {
      // 실제로는 AI API 호출
      setFormData(getAnalyzedRequest(query))
      setBasicData(getBasicInfo(query))
    }
  }, [query])

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: { ...prev[key], value, filled: !!value }
    }))
  }

  const handleBasicChange = (key, value) => {
    setBasicData(prev => ({
      ...prev,
      [key]: { ...prev[key], value, filled: !!value }
    }))
  }

  const handleSubmit = async () => {
    // 로그인 체크
    if (!isAuthenticated) {
      // 로그인 후 이 페이지로 돌아오도록 redirect 설정
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      return
    }

    setIsSubmitting(true)

    try {
      // 요청 데이터 생성
      const requestData = {
        userId: user.id,
        originalQuery: query,
        spaceType: formData.spaceType.value,
        purpose: formData.purpose.value,
        capacity: formData.capacity.value,
        equipment: formData.equipment.value,
        catering: formData.catering.value,
        parking: formData.parking.value,
        additionalRequest: formData.additionalRequest.value,
        date: basicData.date.value,
        location: basicData.location.value,
        time: basicData.time.value,
        category: activeTab,
      }

      // LocalStorage에 저장
      const newRequest = createRequest(requestData)

      // 매칭 대기 페이지로 이동
      navigate(`/matching-wait?id=${newRequest.id}`)
    } catch (error) {
      console.error('Failed to create request:', error)
      alert('요청 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAskAgain = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GuestHeader />

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* AI 분석 완료 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-violet-600 text-lg">✦</span>
            <span className="text-violet-600 font-medium text-sm">AI가 분석을 완료했어요</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                추천 서비스 {categoryTabs.length}개와 함께
              </h1>
              <h1 className="text-xl font-bold text-gray-900">
                요청 내용을 정리했어요
              </h1>
            </div>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              이용 안내
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            AI가 작성한 내용은 고객님의 상황과 다를 수 있어요
          </p>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
              {tab.recommended && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-violet-100 text-violet-600'
                }`}>
                  추천
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 요청 내용 정리 카드 */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-6">
          {/* 카드 헤더 */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-violet-600">✦</span>
              <span className="font-semibold text-gray-900">회의실</span>
            </div>
          </div>

          {/* 분석된 항목들 */}
          <div className="p-6 space-y-5">
            {Object.entries(formData).map(([key, field]) => (
              <div key={key}>
                <label className="block text-sm text-gray-500 mb-2">
                  {field.label}
                </label>
                {field.filled ? (
                  <div className="font-medium text-gray-900">
                    {field.isMultiple ? field.value.join(', ') : field.value}
                  </div>
                ) : field.isTextarea ? (
                  <textarea
                    value={field.value}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none h-20"
                  />
                ) : (
                  <div className="relative">
                    <select
                      value={field.value}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none appearance-none bg-white"
                    >
                      <option value="">{field.placeholder}</option>
                      <option value="yes">예</option>
                      <option value="no">아니오</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <span className="font-semibold text-gray-900">기본 정보</span>
          </div>

          <div className="p-6 space-y-5">
            {Object.entries(basicData).map(([key, field]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {field.label}
                </label>
                {field.filled ? (
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-900">
                    {field.value}
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type={key === 'date' ? 'date' : 'text'}
                      value={field.value}
                      onChange={(e) => handleBasicChange(key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 카드 */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <span className="font-semibold text-gray-900">자주 묻는 질문</span>
          </div>

          <div className="divide-y divide-gray-100">
            {faqItems.map((item, index) => (
              <div key={index} className="px-6">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full py-4 flex items-center justify-between text-left"
                >
                  <span className="text-gray-700">{item.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFAQ === index && (
                  <div className="pb-4 text-sm text-gray-500">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI에게 다시 물어보기 */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-2">
            추천 서비스와 정리한 요청 내용이<br />
            마음에 들지 않으세요?
          </p>
          <button
            onClick={handleAskAgain}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
          >
            AI에게 다시 물어보기
          </button>
        </div>

        {/* 하단 CTA */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '요청 중...' : isAuthenticated ? '이 요청으로 무료 견적 받기' : '로그인하고 무료 견적 받기'}
          </button>
          {!isAuthenticated && (
            <p className="text-center text-sm text-gray-500 mt-2">
              로그인 후 견적을 요청할 수 있어요
            </p>
          )}
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          ← 홈으로
        </Link>
        <Link
          to="/matching-wait"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          → 매칭 대기 보기
        </Link>
        <Link
          to="/chat"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          → 채팅방 보기
        </Link>
      </div>
    </div>
  )
}
