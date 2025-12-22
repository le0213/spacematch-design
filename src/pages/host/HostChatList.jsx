import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getHostByUserId, getHostStats } from '../../stores/hostStore'
import {
  getChatRoomsForHost,
  getFilteredHostChatRooms,
  getUnreadCountForHost,
  toggleFavorite,
} from '../../stores/chatStore'
import HostHeader from '../../components/HostHeader'

// Mock 채팅방 데이터 생성 함수 (동적 hostId 지원)
const createMockChatRooms = (hostId) => [
  {
    id: 'chat-mock-1',
    hostId: hostId,
    guest: { name: '김민수', profileImage: null },
    quote: { spaceName: '강남 스튜디오', price: 150000 },
    lastMessage: '견적서 확인했습니다. 결제 진행할게요!',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: { [hostId]: 2 },
    status: 'ongoing',
    isFavorite: false
  },
  {
    id: 'chat-mock-2',
    hostId: hostId,
    guest: { name: '박지영', profileImage: null },
    quote: { spaceName: '홍대 파티룸', price: 200000 },
    lastMessage: '인원이 5명 늘어날 것 같은데 가능할까요?',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: { [hostId]: 1 },
    status: 'ongoing',
    isFavorite: true
  },
  {
    id: 'chat-mock-3',
    hostId: hostId,
    guest: { name: '이준혁', profileImage: null },
    quote: { spaceName: '서초 세미나실', price: 300000 },
    lastMessage: '감사합니다! 다음에 또 이용할게요.',
    lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: { [hostId]: 0 },
    status: 'completed',
    isFavorite: false
  },
  {
    id: 'chat-mock-4',
    hostId: hostId,
    guest: { name: '최수진', profileImage: null },
    quote: { spaceName: '성수 연습실', price: 80000 },
    lastMessage: '주차 가능한가요?',
    lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unreadCount: { [hostId]: 3 },
    status: 'ongoing',
    isFavorite: false
  },
  {
    id: 'chat-mock-5',
    hostId: hostId,
    guest: { name: '정다은', profileImage: null },
    quote: { spaceName: '용산 루프탑', price: 450000 },
    lastMessage: '날씨가 안 좋으면 실내 공간도 사용 가능한가요?',
    lastMessageAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    unreadCount: { [hostId]: 1 },
    status: 'ongoing',
    isFavorite: true
  }
]

// 채팅방 카드 컴포넌트
function ChatRoomCard({ room, hostId, onToggleFavorite }) {
  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const unreadCount = room.unreadCount?.[hostId] || 0
  const guest = room.guest || { name: '게스트' }
  const quote = room.quote || {}

  return (
    <Link
      to={`/host/chats/${room.id}`}
      className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-violet-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Guest Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {guest.profileImage ? (
              <img src={guest.profileImage} alt={guest.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-medium text-gray-600">
                {guest.name?.[0] || 'G'}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{guest.name || '게스트'}</h3>
              {room.status === 'ongoing' && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  거래중
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{formatTime(room.lastMessageAt)}</span>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleFavorite(room.id)
                }}
                className={`text-lg ${room.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
              >
                {room.isFavorite ? '★' : '☆'}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-1 truncate">
            {quote.spaceName || '공간 정보 없음'}
          </p>

          <p className="text-sm text-gray-600 truncate">
            {room.lastMessage || '새로운 대화를 시작하세요'}
          </p>
        </div>
      </div>
    </Link>
  )
}

// 빈 상태 컴포넌트
function EmptyState({ filter }) {
  const messages = {
    all: '아직 채팅이 없습니다',
    unread: '안 읽은 채팅이 없습니다',
    ongoing: '진행중인 거래가 없습니다',
    favorite: '즐겨찾기한 채팅이 없습니다',
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <p className="text-gray-500">{messages[filter]}</p>
      <p className="text-sm text-gray-400 mt-1">견적을 발송하면 채팅이 시작됩니다</p>
    </div>
  )
}

export default function HostChatList() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [host, setHost] = useState(null)
  const [stats, setStats] = useState(null)
  const [chatRooms, setChatRooms] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/host/login')
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (host) {
      const filtered = getFilteredHostChatRooms(host.id, filter)
      setChatRooms(filtered)
    }
  }, [filter, host])

  const loadData = () => {
    const hostData = getHostByUserId(user.id)
    if (!hostData) {
      navigate('/host/register')
      return
    }

    setHost(hostData)

    // 통계 로드
    const hostStats = getHostStats(hostData.id)
    setStats(hostStats)

    // 채팅방 로드, 없으면 Mock 데이터 사용
    const rooms = getChatRoomsForHost(hostData.id)
    if (rooms.length > 0) {
      setChatRooms(rooms)
    } else {
      setChatRooms(createMockChatRooms(hostData.id))
    }

    setLoading(false)
  }

  const handleToggleFavorite = (roomId) => {
    toggleFavorite(roomId)
    // 리프레시
    const rooms = getFilteredHostChatRooms(host.id, filter)
    setChatRooms(rooms)
  }

  const unreadCount = host ? getUnreadCountForHost(host.id) : 0

  // 검색 필터링
  const filteredRooms = chatRooms.filter(room => {
    if (!searchQuery) return true
    const guest = room.guest || {}
    const quote = room.quote || {}
    const searchLower = searchQuery.toLowerCase()
    return (
      (guest.name || '').toLowerCase().includes(searchLower) ||
      (quote.spaceName || '').toLowerCase().includes(searchLower) ||
      (room.lastMessage || '').toLowerCase().includes(searchLower)
    )
  })

  const tabs = [
    { id: 'all', label: '전체', count: getChatRoomsForHost(host?.id || '').length },
    { id: 'unread', label: '안읽음', count: unreadCount },
    { id: 'ongoing', label: '거래중' },
    { id: 'favorite', label: '즐겨찾기' },
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader stats={stats} unreadChats={unreadCount} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">채팅</h1>
          <p className="text-gray-500 mt-1">게스트와의 대화를 관리하세요</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="게스트, 공간명으로 검색"
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 ${filter === tab.id ? 'text-violet-200' : 'text-gray-400'}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="space-y-3">
          {filteredRooms.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            filteredRooms.map(room => (
              <ChatRoomCard
                key={room.id}
                room={room}
                hostId={host.id}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
