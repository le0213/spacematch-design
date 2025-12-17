import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Mock Data - Chat List
const chatListData = [
  {
    id: 1,
    hostName: '강남 프리미엄 회의실',
    lastMessage: '견적서를 보내드렸어요. 확인해주세요!',
    timestamp: '방금',
    unread: 1,
    avatar: '🏢',
    status: '견적 도착',
  },
  {
    id: 2,
    hostName: '홍대 스튜디오 A',
    lastMessage: '견적서를 보내드렸어요. 확인해주세요!',
    timestamp: '10분 전',
    unread: 1,
    avatar: '📸',
    status: '견적 도착',
  },
  {
    id: 3,
    hostName: '성수 파티룸',
    lastMessage: '결제 확인되었습니다. 당일 뵙겠습니다!',
    timestamp: '1시간 전',
    unread: 0,
    avatar: '🎉',
    status: '결제 완료',
  },
  {
    id: 4,
    hostName: '역삼 세미나실',
    lastMessage: '견적서를 보내드렸어요. 확인해주세요!',
    timestamp: '어제',
    unread: 0,
    avatar: '💼',
    status: '견적 도착',
  },
]

// Mock Data - Messages (견적서가 첫 번째 메시지)
const messagesData = [
  {
    id: 1,
    type: 'system',
    content: '강남 프리미엄 회의실에서 견적서를 보냈습니다.',
    timestamp: '2024.01.15 10:00',
  },
  {
    id: 2,
    type: 'quote',
    sender: '강남 프리미엄 회의실',
    timestamp: '10:00',
    quote: {
      title: '1월 20일 워크숍 견적서',
      space: '강남 프리미엄 회의실 A룸',
      date: '2024.01.20 (토)',
      time: '14:00 ~ 18:00 (4시간)',
      people: '20명',
      items: [
        { name: '공간 대여료 (4시간)', price: 200000 },
        { name: '프로젝터 사용', price: 0 },
        { name: '화이트보드 사용', price: 0 },
      ],
      total: 210000,
      validUntil: '2024.01.18',
    },
  },
  {
    id: 3,
    type: 'received',
    sender: '강남 프리미엄 회의실',
    content: '안녕하세요! 요청하신 조건으로 견적서 보내드렸어요. 프로젝터와 화이트보드는 기본 제공됩니다. 궁금한 점 있으시면 편하게 물어봐 주세요!',
    timestamp: '10:00',
  },
  {
    id: 4,
    type: 'sent',
    content: '감사합니다! 다과 서비스도 추가 가능할까요?',
    timestamp: '10:05',
  },
  {
    id: 5,
    type: 'received',
    sender: '강남 프리미엄 회의실',
    content: '네, 가능합니다! 1인당 5,000원이고 커피, 차, 쿠키가 포함되어 있어요. 추가하시면 수정된 견적서 다시 보내드릴게요.',
    timestamp: '10:08',
  },
]

// Mock Data - Host Info
const hostInfo = {
  name: '강남 프리미엄 회의실',
  spaceName: 'A룸 (15~20인)',
  rating: 4.9,
  reviewCount: 128,
  responseRate: '98%',
  responseTime: '평균 10분',
  avatar: '🏢',
  location: '서울 강남구 테헤란로',
  facilities: ['프로젝터', '화이트보드', '무선 마이크', 'Wi-Fi', '주차'],
}

// Chat List Item Component
function ChatListItem({ chat, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${
        isActive ? 'bg-violet-50 border-l-4 border-l-violet-600' : ''
      }`}
    >
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
        {chat.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-gray-900 truncate">{chat.hostName}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">{chat.timestamp}</span>
        </div>
        <p className="text-sm text-gray-500 truncate mb-1">{chat.lastMessage}</p>
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              chat.status === '견적 도착'
                ? 'bg-violet-100 text-violet-600'
                : chat.status === '결제 완료'
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {chat.status}
          </span>
          {chat.unread > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// Message Components
function SystemMessage({ content, timestamp }) {
  return (
    <div className="flex justify-center my-4">
      <div className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500">
        {content}
      </div>
    </div>
  )
}

function ReceivedMessage({ sender, content, timestamp }) {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="max-w-[70%]">
        <div className="text-xs text-gray-500 mb-1">{sender}</div>
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-md">
          <p className="text-gray-900">{content}</p>
        </div>
        <div className="text-xs text-gray-400 mt-1">{timestamp}</div>
      </div>
    </div>
  )
}

function SentMessage({ content, timestamp }) {
  return (
    <div className="flex justify-end items-end gap-2 mb-4">
      <div className="max-w-[70%]">
        <div className="px-4 py-3 bg-violet-600 text-white rounded-2xl rounded-br-md">
          <p>{content}</p>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">{timestamp}</div>
      </div>
    </div>
  )
}

function QuoteMessage({ sender, timestamp, quote }) {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="max-w-[85%]">
        <div className="text-xs text-gray-500 mb-1">{sender}</div>
        <div className="bg-white border-2 border-violet-200 rounded-2xl overflow-hidden">
          {/* Quote Header */}
          <div className="px-5 py-4 bg-violet-50 border-b border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-violet-600">📋</span>
              <span className="font-semibold text-gray-900">견적서</span>
            </div>
            <h4 className="font-medium text-gray-900">{quote.title}</h4>
          </div>

          {/* Quote Body */}
          <div className="p-5">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">공간</span>
                <span className="text-gray-900 font-medium">{quote.space}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">날짜</span>
                <span className="text-gray-900">{quote.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">시간</span>
                <span className="text-gray-900">{quote.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">인원</span>
                <span className="text-gray-900">{quote.people}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              {quote.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-900">
                    {item.price === 0 ? '무료' : `${item.price.toLocaleString()}원`}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">총 결제 금액</span>
                <span className="text-xl font-bold text-violet-600">
                  {quote.total.toLocaleString()}원
                </span>
              </div>
              <div className="text-xs text-gray-400 text-right mt-1">
                (수수료 5% 포함)
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              견적 유효기간: {quote.validUntil}까지
            </div>

            <button className="w-full py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors">
              결제하기
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">{timestamp}</div>
      </div>
    </div>
  )
}

// Info Panel Component
function InfoPanel({ host }) {
  return (
    <div className="h-full overflow-y-auto">
      {/* Host Profile */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
            {host.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{host.name}</h3>
            <p className="text-sm text-gray-500">{host.spaceName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="font-medium text-gray-900">{host.rating}</span>
            <span className="text-gray-400">({host.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Response Info */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="font-medium text-gray-900 mb-3">응답 정보</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">응답률</span>
            <span className="text-gray-900 font-medium">{host.responseRate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">평균 응답시간</span>
            <span className="text-gray-900">{host.responseTime}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="font-medium text-gray-900 mb-3">위치</h4>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <span>📍</span>
          <span>{host.location}</span>
        </div>
        <div className="mt-3 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
          지도 영역
        </div>
      </div>

      {/* Facilities */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="font-medium text-gray-900 mb-3">시설/편의</h4>
        <div className="flex flex-wrap gap-2">
          {host.facilities.map((facility) => (
            <span
              key={facility}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              {facility}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6">
        <button className="w-full py-3 mb-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          공간 상세보기
        </button>
        <button className="w-full py-3 bg-white border border-red-200 text-red-500 font-medium rounded-lg hover:bg-red-50 transition-colors">
          신고하기
        </button>
      </div>
    </div>
  )
}

// Main Component
export default function ChatRoom() {
  const [activeChat, setActiveChat] = useState(1)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(messagesData)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: 'sent',
      content: message,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages([...messages, newMessage])
    setMessage('')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-xl text-gray-900">스페이스매치</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <button className="relative p-2 text-gray-500 hover:text-gray-700">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Chat List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Chat List Header */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">채팅</h2>
            <div className="mt-3 relative">
              <input
                type="text"
                placeholder="호스트 검색"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chatListData.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={activeChat === chat.id}
                onClick={() => setActiveChat(chat.id)}
              />
            ))}
          </div>
        </div>

        {/* Middle Column - Chat Timeline */}
        <div className="flex-1 flex flex-col bg-gray-100 min-w-0">
          {/* Chat Header */}
          <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                🏢
              </div>
              <div>
                <h3 className="font-medium text-gray-900">강남 프리미엄 회의실</h3>
                <p className="text-xs text-gray-500">A룸 (15~20인)</p>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <span>⋮</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.map((msg) => {
              if (msg.type === 'system') {
                return <SystemMessage key={msg.id} content={msg.content} timestamp={msg.timestamp} />
              } else if (msg.type === 'received') {
                return (
                  <ReceivedMessage
                    key={msg.id}
                    sender={msg.sender}
                    content={msg.content}
                    timestamp={msg.timestamp}
                  />
                )
              } else if (msg.type === 'sent') {
                return <SentMessage key={msg.id} content={msg.content} timestamp={msg.timestamp} />
              } else if (msg.type === 'quote') {
                return (
                  <QuoteMessage
                    key={msg.id}
                    sender={msg.sender}
                    timestamp={msg.timestamp}
                    quote={msg.quote}
                  />
                )
              }
              return null
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600">
                <span className="text-xl">📎</span>
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 입력하세요"
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-violet-500 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-violet-600 text-white font-medium rounded-full hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!message.trim()}
              >
                전송
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Info Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0 hidden lg:block">
          <InfoPanel host={hostInfo} />
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          ← 홈으로
        </Link>
        <Link
          to="/request-summary"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          → 요청서 정리 보기
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
