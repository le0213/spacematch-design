import { useState, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getQuote, getQuotesForUser } from '../stores/quoteStore'
import { getOrCreateChatRoom, getMessagesByRoom, addMessage } from '../stores/chatStore'
import { createPayment, getPaymentByQuote, formatPrice } from '../stores/paymentStore'

// Message Components
function SystemMessage({ content }) {
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

function QuoteMessage({ sender, timestamp, quote, onPayment }) {
  const serviceFee = Math.round(quote.price * 0.05)
  const totalPrice = quote.price + serviceFee

  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="max-w-[85%]">
        <div className="text-xs text-gray-500 mb-1">{sender}</div>
        <div className="bg-white border-2 border-violet-200 rounded-2xl overflow-hidden">
          {/* Quote Header */}
          <div className="px-5 py-4 bg-violet-50 border-b border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-gray-900">견적서</span>
            </div>
            <h4 className="font-medium text-gray-900">{quote.spaceName}</h4>
          </div>

          {/* Quote Body */}
          <div className="p-5">
            <p className="text-gray-700 text-sm mb-4">{quote.description}</p>

            {/* Items */}
            {quote.items && quote.items.length > 0 && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                {quote.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-900">
                      {item.price === 0 ? '무료' : `${formatPrice(item.price)}원`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">서비스 금액</span>
                <span className="text-gray-900">{formatPrice(quote.price)}원</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">수수료 (5%)</span>
                <span className="text-gray-900">{formatPrice(serviceFee)}원</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-900">총 결제 금액</span>
                <span className="text-xl font-bold text-violet-600">
                  {formatPrice(totalPrice)}원
                </span>
              </div>
            </div>

            <button
              onClick={() => onPayment(quote)}
              className="w-full py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
            >
              결제하기
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">{timestamp}</div>
      </div>
    </div>
  )
}

// Chat List Item Component
function ChatListItem({ quote, isActive, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '어제'
    } else if (days < 7) {
      return `${days}일 전`
    }
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
        isActive ? 'bg-violet-50 border-l-2 border-violet-600' : 'border-l-2 border-transparent'
      }`}
    >
      <img
        src={quote.host?.profileImage || `https://ui-avatars.com/api/?name=${quote.host?.name || 'Host'}&background=random`}
        alt={quote.host?.name}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-gray-900 truncate">{quote.host?.name || '호스트'}</h4>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {formatDate(quote.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{quote.spaceName}</p>
        <p className="text-sm text-violet-600 font-medium mt-1">
          {formatPrice(quote.price)}원
        </p>
      </div>
      {quote.status === '미열람' && (
        <div className="w-2 h-2 bg-violet-600 rounded-full flex-shrink-0 mt-2"></div>
      )}
    </button>
  )
}

// Chat List Panel Component
function ChatListPanel({ quotes, activeQuoteId, onSelectQuote }) {
  const [activeTab, setActiveTab] = useState('all')

  const filteredQuotes = quotes.filter(q => {
    if (activeTab === 'unread') return q.status === '미열람'
    if (activeTab === 'ongoing') return q.status === '열람'
    return true
  })

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체 ({quotes.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'unread'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            안 읽음
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'ongoing'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            거래 중
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">받은 견적이 없습니다</p>
          </div>
        ) : (
          filteredQuotes.map(quote => (
            <ChatListItem
              key={quote.id}
              quote={quote}
              isActive={quote.id === activeQuoteId}
              onClick={() => onSelectQuote(quote.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Info Panel Component
function InfoPanel({ host, quote }) {
  if (!host) return null

  return (
    <div className="h-full overflow-y-auto">
      {/* Host Profile */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={host.profileImage || `https://ui-avatars.com/api/?name=${host.name}&background=random`}
            alt={host.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{host.name}</h3>
            {quote && <p className="text-sm text-gray-500">{quote.spaceName}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
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
            <span className="text-gray-900 font-medium">{host.responseRate}%</span>
          </div>
        </div>
      </div>

      {/* Quote Summary */}
      {quote && (
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-medium text-gray-900 mb-3">견적 요약</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">공간 대여료</span>
              <span className="text-gray-900">{formatPrice(quote.price)}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">예상 이용시간</span>
              <span className="text-gray-900">{quote.estimatedDuration}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6">
        <Link
          to="/quotes"
          className="block w-full py-3 mb-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          다른 견적 보기
        </Link>
        <button className="w-full py-3 bg-white border border-red-200 text-red-500 font-medium rounded-lg hover:bg-red-50 transition-colors">
          신고하기
        </button>
      </div>
    </div>
  )
}

// Main Component
export default function ChatRoom() {
  const { quoteId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [allQuotes, setAllQuotes] = useState([])
  const [quote, setQuote] = useState(null)
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/login?redirect=/chat/${quoteId}`)
      return
    }

    if (user && quoteId) {
      loadData()
    }
  }, [user, authLoading, quoteId])

  const loadData = () => {
    // 사용자의 모든 견적 로드
    const userQuotes = getQuotesForUser(user.id)
    setAllQuotes(userQuotes)

    // 현재 견적 정보 로드
    const quoteData = getQuote(quoteId)
    if (!quoteData) {
      // Mock 데이터가 없으면 기본 데이터 사용 (공간대여 컨셉)
      const mockQuote = {
        id: quoteId,
        host: {
          id: 'host_1',
          name: '강남 프리미엄 회의실',
          profileImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop',
          rating: 4.9,
          reviewCount: 128,
          responseRate: 98,
        },
        spaceName: '강남 프리미엄 회의실',
        price: 150000,
        description: '안녕하세요! 강남역 3번 출구에서 도보 3분 거리에 위치한 프리미엄 회의실입니다. 최대 20명 수용 가능하며, 빔프로젝터와 화이트보드를 무료로 제공해드립니다.',
        items: [
          { name: '공간 대여료 (4시간)', price: 120000 },
          { name: '빔프로젝터 사용', price: 0 },
          { name: '음료 서비스', price: 30000 },
        ],
        estimatedDuration: '4시간',
        createdAt: new Date().toISOString(),
      }
      setQuote(mockQuote)

      // 채팅방 생성
      const chatRoom = getOrCreateChatRoom(quoteId, user.id, mockQuote.host.id, mockQuote)
      setRoom(chatRoom)

      // 메시지 로드
      const roomMessages = getMessagesByRoom(chatRoom.id)
      setMessages(roomMessages)
    } else {
      setQuote(quoteData)

      // 채팅방 생성/조회
      const chatRoom = getOrCreateChatRoom(quoteId, user.id, quoteData.hostId, quoteData)
      setRoom(chatRoom)

      // 메시지 로드
      const roomMessages = getMessagesByRoom(chatRoom.id)
      setMessages(roomMessages)
    }

    setLoading(false)
  }

  const handleSelectQuote = (selectedQuoteId) => {
    navigate(`/chat/${selectedQuoteId}`)
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim() || !room) return

    const newMessage = addMessage(room.id, {
      senderId: user.id,
      type: 'text',
      content: message,
    })

    setMessages(prev => [...prev, newMessage])
    setMessage('')
  }

  const handlePayment = (quoteData) => {
    // 이미 결제 정보가 있는지 확인
    const existingPayment = getPaymentByQuote(quoteData.id)

    if (existingPayment) {
      navigate(`/payment/${existingPayment.id}`)
    } else {
      // 새 결제 생성
      const payment = createPayment({
        quoteId: quoteData.id,
        guestId: user.id,
        hostId: quoteData.host?.id || quoteData.hostId,
        amount: quoteData.price,
        spaceName: quoteData.spaceName,
        hostName: quoteData.host?.name,
      })
      navigate(`/payment/${payment.id}`)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  const host = quote?.host

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
          <Link to="/quotes" className="text-sm text-gray-600 hover:text-gray-900">
            받은 견적
          </Link>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {user?.name ? (
              <span className="text-sm font-medium">{user.name[0]}</span>
            ) : (
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Chat List */}
        <div className="w-72 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
          <ChatListPanel
            quotes={allQuotes}
            activeQuoteId={quoteId}
            onSelectQuote={handleSelectQuote}
          />
        </div>

        {/* Center Column - Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-100 min-w-0">
          {/* Chat Header */}
          <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile back button */}
              <Link to="/quotes" className="md:hidden mr-2 p-2 text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <img
                src={host?.profileImage || `https://ui-avatars.com/api/?name=${host?.name || 'Host'}&background=random`}
                alt={host?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium text-gray-900">{host?.name || '호스트'}</h3>
                <p className="text-xs text-gray-500">{quote?.spaceName}</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 시스템 메시지 */}
            <SystemMessage content={`${host?.name}에서 견적서를 보냈습니다.`} />

            {/* 견적서 (첫 번째 메시지로 표시) */}
            {quote && (
              <QuoteMessage
                sender={host?.name}
                timestamp={formatTime(quote.createdAt || new Date().toISOString())}
                quote={quote}
                onPayment={handlePayment}
              />
            )}

            {/* 채팅 메시지 */}
            {messages.filter(msg => msg.type !== 'quote').map((msg) => {
              if (msg.type === 'system') {
                return <SystemMessage key={msg.id} content={msg.content} />
              } else if (msg.senderId === user?.id) {
                return <SentMessage key={msg.id} content={msg.content} timestamp={formatTime(msg.createdAt)} />
              } else {
                return (
                  <ReceivedMessage
                    key={msg.id}
                    sender={host?.name}
                    content={msg.content}
                    timestamp={formatTime(msg.createdAt)}
                  />
                )
              }
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
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
          <InfoPanel host={host} quote={quote} />
        </div>
      </div>
    </div>
  )
}
