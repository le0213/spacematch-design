import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GuestHeader } from '../components/Header'
import Footer from '../components/Footer'

// Example Request Cards
const exampleRequests = [
  {
    id: 1,
    highlight: '강남역',
    text: '워크숍 공간 필요해요. 20명 정도 수용 가능하고, 프로젝터랑 화이트보드 있으면 좋겠어요. 다과 서비스도 가능한지 궁금해요.',
  },
  {
    id: 2,
    highlight: '홍대',
    text: '촬영 스튜디오 찾아요. 자연광 들어오는 곳이면 좋고, 소품이랑 조명 장비도 대여 가능한지 알고 싶어요.',
  },
  {
    id: 3,
    highlight: '성수동',
    text: '생일파티룸 예약하고 싶어요. 10명 정도 모일 건데, 음식 반입 가능하고 음향 시설 있으면 좋겠어요.',
  },
  {
    id: 4,
    highlight: '역삼',
    text: '세미나실 대관 문의드려요. 50명 규모 강연인데, 마이크랑 빔프로젝터 필수이고 주차 가능한 곳이요.',
  },
]

// Category Cards
const categories = [
  { icon: '🏢', name: '회의실', description: '미팅·세미나' },
  { icon: '📸', name: '스튜디오', description: '촬영·라이브' },
  { icon: '🎉', name: '파티룸', description: '모임·파티' },
  { icon: '🎵', name: '연습실', description: '댄스·음악' },
  { icon: '💼', name: '오피스', description: '업무·코워킹' },
  { icon: '📦', name: '창고', description: '보관·물류' },
]

export default function GuestHome() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const scrollContainerRef = useRef(null)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 20) {
      navigate(`/request-summary?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleExampleClick = (example) => {
    setSearchQuery(`${example.highlight} ${example.text}`)
  }

  const handleCategoryClick = (category) => {
    setSearchQuery(`${category.name} 공간을 찾고 있어요. `)
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const isValidLength = searchQuery.trim().length >= 20

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <GuestHeader />

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Main Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
            어떤 공간을 찾으시나요?
          </h1>
          <p className="text-gray-500 text-center mb-12">
            원하는 조건을 자연어로 입력하면 맞춤 공간을 찾아드려요
          </p>

          {/* Example Section Title */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-violet-600 text-xl">✦</span>
            <span className="text-violet-600 font-medium">이렇게 요청할 수 있어요</span>
          </div>

          {/* Example Cards - Horizontal Scroll */}
          <div className="relative mb-10">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {exampleRequests.map((example) => (
                <button
                  key={example.id}
                  onClick={() => handleExampleClick(example)}
                  className="flex-shrink-0 w-72 p-5 bg-white rounded-2xl border border-gray-200 hover:border-violet-400 hover:shadow-md transition-all text-left group"
                >
                  <p className="text-gray-800 text-sm leading-relaxed">
                    <span className="font-semibold text-gray-900">{example.highlight}</span>{' '}
                    {example.text}
                  </p>
                </button>
              ))}
            </div>

            {/* Scroll Button */}
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600 text-xl">›</span>
            </button>
          </div>

          {/* Search Input Area */}
          <form onSubmit={handleSearch}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <textarea
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="AI가 잘 이해할 수 있도록 상황, 필요한 작업, 희망사항을 구체적으로 적어주세요."
                  className="w-full h-32 resize-none text-gray-900 placeholder-gray-400 focus:outline-none text-base leading-relaxed"
                />
              </div>

              {/* Bottom Bar */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isValidLength ? 'text-green-600' : 'text-gray-400'}`}>
                    최소 20자 ({searchQuery.trim().length}자)
                  </span>
                  {isValidLength && (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isValidLength}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isValidLength
                      ? 'bg-violet-600 hover:bg-violet-700 cursor-pointer'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">인기 카테고리</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category)}
                className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-violet-300 hover:shadow-md transition-all text-center group"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <div className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                  {category.name}
                </div>
                <div className="text-sm text-gray-500">{category.description}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">이렇게 진행돼요</h2>
          <p className="text-gray-500 text-center mb-12">간단한 3단계로 원하는 공간을 찾아보세요</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <div className="text-sm font-medium text-violet-600 mb-2">STEP 1</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">조건 입력</h3>
              <p className="text-gray-500 text-sm">
                원하는 공간 조건을<br />자연어로 입력하세요
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <div className="text-sm font-medium text-violet-600 mb-2">STEP 2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">견적 받기</h3>
              <p className="text-gray-500 text-sm">
                조건에 맞는 공간들로부터<br />견적을 받아보세요
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <div className="text-sm font-medium text-violet-600 mb-2">STEP 3</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">안전 거래</h3>
              <p className="text-gray-500 text-sm">
                채팅으로 협의하고<br />안전하게 결제하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-violet-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            내 공간을 등록하고 싶으신가요?
          </h2>
          <p className="text-violet-100 mb-8">
            스페이스매치에서 더 많은 고객을 만나보세요
          </p>
          <Link
            to="/host"
            className="inline-block px-8 py-4 bg-white text-violet-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            호스트로 시작하기
          </Link>
        </div>
      </section>

      <Footer />

      {/* Demo Navigation */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <Link
          to="/login"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          → 로그인 보기
        </Link>
        <Link
          to="/request-summary"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          → 요청서 정리 보기
        </Link>
        <Link
          to="/my-requests"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          → 내 요청 보기
        </Link>
        <Link
          to="/host"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          → 호스트 랜딩 보기
        </Link>
      </div>
    </div>
  )
}
