import { useState, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getHostByUserId, formatPrice } from '../../stores/hostStore'
import {
  getChatRoom,
  getChatRoomsForHost,
  getMessagesByRoom,
  addMessage,
  markMessagesAsRead,
  toggleFavorite,
  addPaymentRequestMessage,
  sendSimplePaymentRequest,
  updateQuoteInChat,
  resendQuote,
} from '../../stores/chatStore'
import QuoteCardModal from '../../components/QuoteCardModal'

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
          <p className="text-gray-900 whitespace-pre-wrap">{content}</p>
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
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">{timestamp}</div>
      </div>
    </div>
  )
}

function PaymentRequestMessage({ data, timestamp }) {
  const { paymentRequest } = data
  if (!paymentRequest) return null

  return (
    <div className="flex justify-end items-end gap-2 mb-4">
      <div className="max-w-[85%]">
        <div className="bg-white border-2 border-violet-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 bg-violet-50 border-b border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold text-gray-900">결제 요청</span>
            </div>
            <h4 className="font-medium text-gray-900">{paymentRequest.spaceName}</h4>
          </div>

          <div className="p-5">
            {paymentRequest.description && (
              <p className="text-gray-700 text-sm mb-4">{paymentRequest.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">서비스 금액</span>
                <span className="text-gray-900">{formatPrice(paymentRequest.totalAmount)}원</span>
              </div>
              {paymentRequest.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">할인</span>
                  <span className="text-red-500">-{formatPrice(paymentRequest.discount)}원</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">계약금 ({paymentRequest.depositRate}%)</span>
                <span className="text-gray-900">{formatPrice(paymentRequest.depositAmount)}원</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">총 결제 금액</span>
                <span className="text-xl font-bold text-violet-600">
                  {formatPrice(paymentRequest.totalAmount - (paymentRequest.discount || 0))}원
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">{timestamp}</div>
      </div>
    </div>
  )
}

// 간편 결제 요청 메시지
function SimplePaymentMessage({ data, timestamp }) {
  const { simplePayment } = data
  if (!simplePayment) return null

  const statusBadge = {
    pending: { text: '결제 대기', color: 'bg-amber-100 text-amber-700' },
    paid: { text: '결제 완료', color: 'bg-green-100 text-green-700' },
    cancelled: { text: '취소됨', color: 'bg-gray-100 text-gray-500' },
  }

  const badge = statusBadge[simplePayment.status] || statusBadge.pending

  return (
    <div className="flex justify-end items-end gap-2 mb-4">
      <div className="max-w-[80%]">
        <div className="bg-white border-2 border-green-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 bg-green-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <span className="font-semibold text-gray-900">간편 결제 요청</span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                {badge.text}
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500">결제 금액</span>
              <span className="text-xl font-bold text-green-600">{formatPrice(simplePayment.amount)}원</span>
            </div>
            {simplePayment.memo && (
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{simplePayment.memo}</p>
            )}
            {simplePayment.status === 'pending' && (
              <button className="w-full mt-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700">
                결제하기
              </button>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">{timestamp}</div>
      </div>
    </div>
  )
}

// 견적서 메시지 (수정/재발송 메뉴 포함)
function QuoteMessage({ data, timestamp, onEditQuote, onResendQuote }) {
  const { quote } = data
  const [showMenu, setShowMenu] = useState(false)

  if (!quote) return null

  return (
    <div className="flex justify-end items-end gap-2 mb-4">
      <div className="max-w-[85%]">
        <div className="relative bg-white border-2 border-violet-200 rounded-2xl overflow-hidden">
          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute top-10 right-3 z-20 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                <button
                  onClick={() => { setShowMenu(false); onEditQuote(); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  견적 수정
                </button>
                <button
                  onClick={() => { setShowMenu(false); onResendQuote(); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  견적 재발송
                </button>
              </div>
            </>
          )}

          <div className="px-5 py-4 bg-violet-50 border-b border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-gray-900">견적서</span>
            </div>
            <h4 className="font-medium text-gray-900">{quote.spaceName}</h4>
          </div>

          <div className="p-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">견적 금액</span>
              <span className="text-xl font-bold text-violet-600">{formatPrice(quote.price)}원</span>
            </div>
            {quote.message && (
              <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg">{quote.message}</p>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">{timestamp}</div>
      </div>
    </div>
  )
}

// Chat List Panel (Left Column)
function ChatListPanel({ rooms, activeRoomId, hostId, onSelectRoom }) {
  const [activeTab, setActiveTab] = useState('all')

  const filteredRooms = rooms.filter(r => {
    if (activeTab === 'unread') return (r.unreadCount?.[hostId] || 0) > 0
    if (activeTab === 'ongoing') return r.status === 'ongoing'
    if (activeTab === 'favorite') return r.isFavorite
    return true
  })

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return '방금 전'
    if (hours < 24) return `${hours}시간 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex gap-1">
          {['all', 'unread', 'ongoing', 'favorite'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'all' && '전체'}
              {tab === 'unread' && '안읽음'}
              {tab === 'ongoing' && '거래중'}
              {tab === 'favorite' && '즐겨찾기'}
            </button>
          ))}
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">채팅이 없습니다</p>
          </div>
        ) : (
          filteredRooms.map(room => {
            const guest = room.guest || { name: '게스트' }
            const unread = room.unreadCount?.[hostId] || 0

            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${
                  room.id === activeRoomId ? 'bg-violet-50' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {guest.name?.[0] || 'G'}
                    </span>
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm truncate">{guest.name}</span>
                    <span className="text-xs text-gray-400">{formatTime(room.lastMessageAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{room.lastMessage || '새 대화'}</p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// Guest Info Panel (Right Column)
function GuestInfoPanel({ room, request, onToggleFavorite }) {
  if (!room) return null

  const guest = room.guest || { name: '게스트' }
  const quote = room.quote || {}

  return (
    <div className="h-full overflow-y-auto">
      {/* Guest Profile */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xl font-medium text-gray-600">
              {guest.name?.[0] || 'G'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{guest.name}</h3>
            <p className="text-sm text-gray-500">{guest.email || ''}</p>
          </div>
          <button
            onClick={() => onToggleFavorite(room.id)}
            className={`text-2xl ${room.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
          >
            {room.isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>

      {/* Request Summary */}
      {request && (
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-medium text-gray-900 mb-4">요청 정보</h4>
          <div className="space-y-3">
            {request.summary?.region && (
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-gray-600">{request.summary.region}</span>
              </div>
            )}
            {request.summary?.date && (
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">{request.summary.date}</span>
              </div>
            )}
            {request.summary?.people && (
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-gray-600">{request.summary.people}명</span>
              </div>
            )}
            {request.summary?.purpose && (
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-gray-600">{request.summary.purpose}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quote Info */}
      {quote && (
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-medium text-gray-900 mb-4">발송한 견적</h4>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-medium text-gray-900 mb-2">{quote.spaceName}</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">견적 금액</span>
              <span className="font-semibold text-violet-600">{formatPrice(quote.price)}원</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-6">
        <button className="w-full py-3 mb-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          전화 문의
        </button>
        <button className="w-full py-3 bg-white border border-red-200 text-red-500 font-medium rounded-lg hover:bg-red-50 transition-colors">
          신고하기
        </button>
      </div>
    </div>
  )
}

// Main Component
export default function HostChatRoom() {
  const { roomId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [host, setHost] = useState(null)
  const [allRooms, setAllRooms] = useState([])
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [showSimplePaymentModal, setShowSimplePaymentModal] = useState(false)
  const [showQuoteEditModal, setShowQuoteEditModal] = useState(false)
  const [simplePaymentAmount, setSimplePaymentAmount] = useState('')
  const [simplePaymentMemo, setSimplePaymentMemo] = useState('')
  const [editQuotePrice, setEditQuotePrice] = useState('')
  const [editQuoteMessage, setEditQuoteMessage] = useState('')
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
      navigate('/host/login')
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading, roomId])

  const loadData = () => {
    const hostData = getHostByUserId(user.id)
    if (!hostData) {
      navigate('/host/register')
      return
    }

    setHost(hostData)

    // 모든 채팅방 로드
    const rooms = getChatRoomsForHost(hostData.id)
    setAllRooms(rooms)

    // 현재 채팅방 로드
    if (roomId) {
      const currentRoom = getChatRoom(roomId)
      if (currentRoom) {
        setRoom(currentRoom)

        // 메시지 로드
        const roomMessages = getMessagesByRoom(roomId)
        setMessages(roomMessages)

        // 읽음 처리
        markMessagesAsRead(roomId, hostData.id)
      }
    } else if (rooms.length > 0) {
      // roomId가 없으면 첫 번째 채팅방으로
      navigate(`/host/chats/${rooms[0].id}`)
      return
    }

    setLoading(false)
  }

  const handleSelectRoom = (selectedRoomId) => {
    navigate(`/host/chats/${selectedRoomId}`)
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim() || !room) return

    const newMessage = addMessage(room.id, {
      senderId: host.id,
      type: 'text',
      content: message,
    })

    setMessages(prev => [...prev, newMessage])
    setMessage('')
  }

  const handleToggleFavorite = (roomIdToToggle) => {
    toggleFavorite(roomIdToToggle)
    const rooms = getChatRoomsForHost(host.id)
    setAllRooms(rooms)
    if (roomIdToToggle === room?.id) {
      setRoom(getChatRoom(roomIdToToggle))
    }
  }

  const handlePaymentRequest = (paymentData) => {
    // 결제 요청 메시지 추가
    const newMessage = addPaymentRequestMessage(room.id, {
      ...paymentData,
      id: `payment_${Date.now()}`,
      hostId: host.id,
    })

    setMessages(prev => [...prev, newMessage])
    setShowQuoteModal(false)
  }

  // 간편 결제 요청 핸들러
  const handleSimplePaymentSubmit = (e) => {
    e.preventDefault()
    const amount = parseInt(simplePaymentAmount.replace(/,/g, ''), 10)
    if (!amount || amount <= 0) return

    const newMessage = sendSimplePaymentRequest(room.id, host.id, amount, simplePaymentMemo)
    setMessages(prev => [...prev, newMessage])
    setShowSimplePaymentModal(false)
    setSimplePaymentAmount('')
    setSimplePaymentMemo('')
  }

  // 견적 수정 핸들러
  const handleQuoteEdit = () => {
    if (!room?.quote) return
    setEditQuotePrice(room.quote.price?.toString() || '')
    setEditQuoteMessage(room.quote.message || '')
    setShowQuoteEditModal(true)
  }

  const handleQuoteEditSubmit = (e) => {
    e.preventDefault()
    const price = parseInt(editQuotePrice.replace(/,/g, ''), 10)
    if (!price || price <= 0) return

    updateQuoteInChat(room.id, room.quote?.id, {
      price,
      message: editQuoteMessage,
    })

    // 메시지 리로드
    const updatedMessages = getMessagesByRoom(room.id)
    setMessages(updatedMessages)
    setRoom(getChatRoom(room.id))

    setShowQuoteEditModal(false)
    setEditQuotePrice('')
    setEditQuoteMessage('')
  }

  // 견적 재발송 핸들러
  const handleQuoteResend = () => {
    if (!room) return
    const newMessage = resendQuote(room.id, host.id)
    if (newMessage) {
      setMessages(prev => [...prev, newMessage])
    }
  }

  // 금액 입력 포맷팅
  const formatAmountInput = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    if (!numericValue) return ''
    return parseInt(numericValue, 10).toLocaleString()
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

  const guest = room?.guest || { name: '게스트' }
  const request = room?.quote?.request || null

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
        <Link to="/host/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-xl text-gray-900">스페이스매치</span>
          <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-600 text-xs font-medium rounded">
            호스트센터
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <Link to="/host/chats" className="text-sm text-gray-600 hover:text-gray-900">
            채팅 목록
          </Link>
          <Link to="/host/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            대시보드
          </Link>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Chat List */}
        <div className="w-72 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
          <ChatListPanel
            rooms={allRooms}
            activeRoomId={roomId}
            hostId={host?.id}
            onSelectRoom={handleSelectRoom}
          />
        </div>

        {/* Center Column - Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-100 min-w-0">
          {room ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Link to="/host/chats" className="md:hidden mr-2 p-2 text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {guest.name?.[0] || 'G'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{guest.name}</h3>
                    <p className="text-xs text-gray-500">{room.quote?.spaceName || ''}</p>
                  </div>
                </div>

                {room.status === 'ongoing' && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                    거래중
                  </span>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6">
                <SystemMessage content="견적이 발송되어 채팅이 시작되었습니다." />

                {messages.map((msg) => {
                  if (msg.type === 'system') {
                    return <SystemMessage key={msg.id} content={msg.content} />
                  } else if (msg.type === 'payment_request') {
                    return (
                      <PaymentRequestMessage
                        key={msg.id}
                        data={msg}
                        timestamp={formatTime(msg.createdAt)}
                      />
                    )
                  } else if (msg.type === 'simple_payment') {
                    return (
                      <SimplePaymentMessage
                        key={msg.id}
                        data={msg}
                        timestamp={formatTime(msg.createdAt)}
                      />
                    )
                  } else if (msg.type === 'quote') {
                    return (
                      <QuoteMessage
                        key={msg.id}
                        data={msg}
                        timestamp={formatTime(msg.createdAt)}
                        onEditQuote={handleQuoteEdit}
                        onResendQuote={handleQuoteResend}
                      />
                    )
                  } else if (msg.senderId === host?.id) {
                    return (
                      <SentMessage
                        key={msg.id}
                        content={msg.content}
                        timestamp={formatTime(msg.createdAt)}
                      />
                    )
                  } else {
                    return (
                      <ReceivedMessage
                        key={msg.id}
                        sender={guest.name}
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
                <form onSubmit={handleSend} className="space-y-3">
                  <div className="flex items-center gap-3">
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
                      className="px-6 py-3 bg-violet-600 text-white font-medium rounded-full hover:bg-violet-700 transition-colors disabled:opacity-50"
                      disabled={!message.trim()}
                    >
                      전송
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => setShowSimplePaymentModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium hover:bg-green-100 transition-colors whitespace-nowrap"
                    >
                      <span className="text-base">💳</span>
                      간편 결제 요청
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuoteModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-full text-sm font-medium hover:bg-violet-100 transition-colors whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      결제 요청 만들기
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      자주 쓰는 문구
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      일정 등록
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500">채팅방을 선택해주세요</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Info Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0 hidden lg:block">
          <GuestInfoPanel
            room={room}
            request={request}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </div>

      {/* Quote Card Modal */}
      <QuoteCardModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handlePaymentRequest}
        space={room?.quote ? { name: room.quote.spaceName } : null}
        request={request}
      />

      {/* Simple Payment Modal */}
      {showSimplePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSimplePaymentModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">간편 결제 요청</h3>
              <button
                onClick={() => setShowSimplePaymentModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSimplePaymentSubmit} className="p-6">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  결제 금액
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={simplePaymentAmount}
                    onChange={(e) => setSimplePaymentAmount(formatAmountInput(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-3 text-right text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">원</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 (선택)
                </label>
                <input
                  type="text"
                  value={simplePaymentMemo}
                  onChange={(e) => setSimplePaymentMemo(e.target.value)}
                  placeholder="예: 추가 인원 비용, 연장 비용 등"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSimplePaymentModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!simplePaymentAmount}
                  className="flex-1 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  결제 요청 보내기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quote Edit Modal */}
      {showQuoteEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowQuoteEditModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">견적 수정</h3>
              <button
                onClick={() => setShowQuoteEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleQuoteEditSubmit} className="p-6">
              <div className="mb-4 p-4 bg-violet-50 rounded-xl">
                <p className="text-sm text-violet-600 font-medium">{room?.quote?.spaceName}</p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  견적 금액
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editQuotePrice}
                    onChange={(e) => setEditQuotePrice(formatAmountInput(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-3 text-right text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">원</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  견적 메시지 (선택)
                </label>
                <textarea
                  value={editQuoteMessage}
                  onChange={(e) => setEditQuoteMessage(e.target.value)}
                  placeholder="견적에 대한 설명을 입력하세요"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuoteEditModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!editQuotePrice}
                  className="flex-1 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  수정 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
