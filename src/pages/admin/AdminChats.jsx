import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'

// Mock 채팅 데이터
const mockChatRooms = [
  {
    id: 'chat-1',
    guestName: '김민수',
    hostName: '스튜디오 호스트',
    lastMessage: '안녕하세요, 12월 28일 예약 관련해서 문의드립니다.',
    lastMessageAt: '2024-12-21T10:30:00Z',
    messageCount: 15
  },
  {
    id: 'chat-2',
    guestName: '박지영',
    hostName: '파티룸 호스트',
    lastMessage: '카톡으로 연락 가능하신가요?',
    lastMessageAt: '2024-12-20T18:45:00Z',
    messageCount: 8,
    flagged: true
  },
  {
    id: 'chat-3',
    guestName: '이준혁',
    hostName: '세미나실 호스트',
    lastMessage: '주차 가능한가요?',
    lastMessageAt: '2024-12-20T14:00:00Z',
    messageCount: 5
  }
]

const mockChatMessages = [
  { id: 'm1', sender: 'guest', name: '김민수', message: '안녕하세요', time: '10:25' },
  { id: 'm2', sender: 'host', name: '스튜디오 호스트', message: '안녕하세요! 어떤 도움이 필요하신가요?', time: '10:26' },
  { id: 'm3', sender: 'guest', name: '김민수', message: '12월 28일 오후 2시부터 4시까지 예약하고 싶어요', time: '10:28' },
  { id: 'm4', sender: 'host', name: '스튜디오 호스트', message: '네, 해당 시간 가능합니다. 몇 분이 이용하실 예정인가요?', time: '10:30' },
  { id: 'm5', sender: 'guest', name: '김민수', message: '10명 정도요', time: '10:30' }
]

export default function AdminChats() {
  const [chatRooms, setChatRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [search, setSearch] = useState('')
  const [keywords, setKeywords] = useState(['카톡', '외부', '수수료'])

  useEffect(() => {
    setChatRooms(mockChatRooms)
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      setMessages(mockChatMessages)
    }
  }, [selectedRoom])

  const getFilteredRooms = () => {
    if (!search) return chatRooms
    const searchLower = search.toLowerCase()
    return chatRooms.filter(r =>
      r.guestName.toLowerCase().includes(searchLower) ||
      r.hostName.toLowerCase().includes(searchLower)
    )
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 1) return '방금 전'
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  const filteredRooms = getFilteredRooms()

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">채팅 모니터링</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Room List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="검색"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-violet-500 outline-none"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedRoom?.id === room.id ? 'bg-violet-50' : ''
                  } ${room.flagged ? 'bg-red-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{room.guestName}</p>
                        {room.flagged && (
                          <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">의심</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{room.hostName}</p>
                      <p className="text-sm text-gray-600 truncate mt-1">{room.lastMessage}</p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTime(room.lastMessageAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            {selectedRoom ? (
              <>
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedRoom.guestName} ↔ {selectedRoom.hostName}</p>
                      <p className="text-sm text-gray-500">{selectedRoom.messageCount}개의 메시지</p>
                    </div>
                    {selectedRoom.flagged && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">외부거래 유도 의심</span>
                    )}
                  </div>
                </div>
                <div className="p-4 h-[400px] overflow-y-auto space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'guest' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[70%] ${msg.sender === 'guest' ? 'order-1' : 'order-2'}`}>
                        <p className="text-xs text-gray-500 mb-1">{msg.name} · {msg.time}</p>
                        <div className={`px-4 py-2 rounded-2xl ${
                          msg.sender === 'guest' ? 'bg-gray-100' : 'bg-violet-600 text-white'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                채팅방을 선택하세요
              </div>
            )}
          </div>
        </div>

        {/* Keyword Settings */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">키워드 알림 설정</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2">
                {keyword}
                <button
                  onClick={() => setKeywords(keywords.filter((_, i) => i !== index))}
                  className="hover:text-red-900"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                const newKeyword = prompt('새 키워드를 입력하세요')
                if (newKeyword) setKeywords([...keywords, newKeyword])
              }}
              className="px-3 py-1 border-2 border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600"
            >
              + 추가
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">위 키워드가 포함된 메시지는 자동으로 플래그 됩니다.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
