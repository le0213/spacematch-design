import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Stats Data
const stats = [
  { value: '10,000+', label: '월 견적 요청' },
  { value: '2,500+', label: '활성 호스트' },
  { value: '89%', label: '견적 수락률' },
  { value: '평균 48시간', label: '매칭 완료' },
]

// Success Stories
const successStories = [
  {
    name: '강남 프리미엄 회의실',
    owner: '김○○ 호스트',
    quote: '스페이스매치 덕분에 평일 오전 공실률이 70%에서 20%로 줄었어요. 자연어 기반 매칭이라 정확한 니즈의 고객이 찾아와서 좋아요.',
    metrics: '월 평균 45건 매칭',
    avatar: '🏢',
  },
  {
    name: '홍대 촬영 스튜디오',
    owner: '이○○ 호스트',
    quote: '바로견적 기능이 정말 편해요. 자동으로 견적이 나가니까 시간도 절약되고, 응답 속도가 빨라져서 계약 성사율도 올랐습니다.',
    metrics: '바로견적 전환율 67%',
    avatar: '📸',
  },
  {
    name: '성수 복합 문화공간',
    owner: '박○○ 호스트',
    quote: '스페이스클라우드 연동이 되니까 기존 관리하던 공간 정보 그대로 사용할 수 있어서 가입이 정말 쉬웠어요.',
    metrics: '신규 고객 35% 증가',
    avatar: '🎨',
  },
]

// Process Steps
const processSteps = [
  {
    step: '01',
    title: '스페이스클라우드 연동',
    description: '이미 등록된 공간 정보를 그대로 불러와 빠르게 시작하세요',
    icon: '🔗',
  },
  {
    step: '02',
    title: '견적 요청 받기',
    description: '조건에 맞는 견적 요청이 자동으로 매칭됩니다',
    icon: '📬',
  },
  {
    step: '03',
    title: '견적 발행 & 거래',
    description: '채팅으로 협의하고 안전결제로 거래를 완료하세요',
    icon: '🤝',
  },
]

// FAQ Items
const faqItems = [
  {
    question: '스페이스매치 이용 비용은 어떻게 되나요?',
    answer: '견적 발행 1건당 1,000원의 캐시가 차감됩니다. 게스트가 견적을 열람하지 않으면 포인트로 환급되며, 결제 성사 시 결제금액의 5%가 수수료로 정산됩니다.',
  },
  {
    question: '스페이스클라우드 계정이 없어도 가입할 수 있나요?',
    answer: '스페이스매치는 스페이스클라우드에 입점된 공간만 등록 가능합니다. 아직 입점 전이라면 스페이스클라우드에서 먼저 공간을 등록해주세요.',
  },
  {
    question: '바로견적이란 무엇인가요?',
    answer: '게스트의 요청 조건에 맞으면 자동으로 견적이 발행되는 기능입니다. 미리 조건과 가격을 설정해두면 24시간 자동 응답이 가능합니다.',
  },
  {
    question: '정산은 어떻게 이루어지나요?',
    answer: '결제 완료된 건에 대해 매주 1회 정산됩니다. 정산 금액에서 5% 수수료가 차감되며, 등록된 계좌로 입금됩니다.',
  },
  {
    question: '게스트가 환불을 요청하면 어떻게 되나요?',
    answer: '공간별 환불 정책에 따라 처리되며, 환불 시 해당 건의 수수료도 함께 환불됩니다.',
  },
]

// FAQ Item Component
function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{item.question}</span>
        <span className={`text-2xl text-gray-400 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {isOpen && (
        <div className="pb-5 pr-8 text-gray-600 leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  )
}

export default function HostLanding() {
  const [openFAQ, setOpenFAQ] = useState(null)
  const { user, isHost } = useAuth()
  const navigate = useNavigate()

  const handleStartHost = () => {
    if (user && isHost) {
      navigate('/host/dashboard')
    } else if (user) {
      // 이미 로그인한 사용자 - 호스트 등록 페이지로
      navigate('/host/register')
    } else {
      // 로그인 필요
      navigate('/host/signup')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">스페이스매치</span>
            <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-600 text-xs font-medium rounded">
              호스트센터
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isHost ? (
                  <Link
                    to="/host/dashboard"
                    className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-full hover:bg-violet-700 transition-colors"
                  >
                    대시보드
                  </Link>
                ) : (
                  <button
                    onClick={handleStartHost}
                    className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-full hover:bg-violet-700 transition-colors"
                  >
                    호스트 시작하기
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/host/login" className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
                  로그인
                </Link>
                <button
                  onClick={handleStartHost}
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-full hover:bg-violet-700 transition-colors"
                >
                  호스트 시작하기
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 to-violet-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              내 공간을<br />
              더 많은 고객에게<br />
              연결하세요
            </h1>
            <p className="text-xl text-violet-100 mb-8 leading-relaxed">
              스페이스매치는 AI 기반 자연어 매칭으로<br />
              정확한 니즈의 고객을 찾아드립니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartHost}
                className="px-8 py-4 bg-white text-violet-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                지금 시작하기
              </button>
              <a
                href="#why"
                className="px-8 py-4 bg-violet-500 text-white font-semibold rounded-full border-2 border-violet-400 hover:bg-violet-400 transition-colors text-center"
              >
                서비스 소개 보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-violet-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SpaceMatch Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              왜 스페이스매치인가요?
            </h2>
            <p className="text-gray-500 text-lg">
              기존 플랫폼과는 다른 스페이스매치만의 강점
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                정확한 니즈 매칭
              </h3>
              <p className="text-gray-600 leading-relaxed">
                AI가 게스트의 자연어 요청을 분석하여 공간 조건과 정확히 매칭합니다.
                불필요한 문의 없이 진성 고객만 연결됩니다.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                자동화된 견적 시스템
              </h3>
              <p className="text-gray-600 leading-relaxed">
                바로견적 기능으로 24시간 자동 응답이 가능합니다.
                빠른 응답은 계약 성사율을 높여줍니다.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                안전한 거래 보장
              </h3>
              <p className="text-gray-600 leading-relaxed">
                안전결제 시스템으로 대금을 안전하게 보호합니다.
                정산도 매주 정확하게 처리됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              간단한 3단계로 시작하세요
            </h2>
            <p className="text-gray-500 text-lg">
              스페이스클라우드 연동으로 더 빠르게
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-violet-200 -translate-x-1/2 z-0" />
                )}
                <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 z-10">
                  <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold mb-6">
                    {step.step}
                  </div>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              호스트 성공 사례
            </h2>
            <p className="text-gray-500 text-lg">
              스페이스매치로 성장한 호스트들의 이야기
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story) => (
              <div
                key={story.name}
                className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                    {story.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{story.name}</div>
                    <div className="text-sm text-gray-500">{story.owner}</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  "{story.quote}"
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <span className="inline-block px-3 py-1 bg-violet-50 text-violet-600 text-sm font-medium rounded-full">
                    {story.metrics}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              투명한 요금 정책
            </h2>
            <p className="text-gray-500 text-lg">
              성과가 있을 때만 비용이 발생합니다
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="p-8 text-center">
                <div className="text-sm text-gray-500 mb-2">견적 발행 비용</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  1,000원<span className="text-lg font-normal text-gray-500">/건</span>
                </div>
                <p className="text-gray-600 text-sm">
                  게스트 미열람 시 포인트로 환급
                </p>
              </div>
              <div className="p-8 text-center">
                <div className="text-sm text-gray-500 mb-2">거래 수수료</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  5%<span className="text-lg font-normal text-gray-500">/건</span>
                </div>
                <p className="text-gray-600 text-sm">
                  안전결제 성사 시에만 발생
                </p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>✓</span>
                <span>가입비 없음</span>
                <span className="mx-3 text-gray-300">|</span>
                <span>✓</span>
                <span>월정액 없음</span>
                <span className="mx-3 text-gray-300">|</span>
                <span>✓</span>
                <span>숨김 비용 없음</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                item={item}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-violet-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-violet-100 mb-10">
            스페이스클라우드 계정만 있으면 5분 만에 시작할 수 있습니다
          </p>
          <button
            onClick={handleStartHost}
            className="px-10 py-5 bg-white text-violet-600 font-semibold text-lg rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            호스트로 시작하기
          </button>
          <p className="mt-6 text-violet-200 text-sm">
            스페이스클라우드 미가입자는 먼저 공간을 등록해주세요
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-semibold text-white">스페이스매치</span>
              <span className="ml-2 text-gray-500 text-sm">호스트센터</span>
            </div>
            <div className="text-sm">
              © 2024 SpaceMatch. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
