// LocalStorage 기반 채팅 관리

const STORAGE_KEY = 'spacematch_chats'
const ROOMS_KEY = 'spacematch_chat_rooms'

// ============ Mock 데이터 초기화 ============

const initialMockChatRooms = [
  {
    id: 'room_mock_1',
    quoteId: 'quote_mock_host_1',
    guestId: 'user_mock_3',
    hostId: 'host-1',
    guest: {
      id: 'user_mock_3',
      name: '이파티',
      profileImage: null
    },
    quote: {
      spaceName: '홍대 파티룸',
      price: 220000,
      estimatedDuration: '5시간'
    },
    lastMessage: '네, 그 시간에 예약 가능합니다.',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: { 'host-1': 2, 'user_mock_3': 0 },
    status: 'ongoing',
    hasActivePayment: false,
    isFavorite: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'room_mock_2',
    quoteId: 'quote_mock_host_3',
    guestId: 'user_mock_6',
    hostId: 'host-1',
    guest: {
      id: 'user_mock_6',
      name: '윤유튜브',
      profileImage: null
    },
    quote: {
      spaceName: '강남 스튜디오',
      price: 350000,
      estimatedDuration: '6시간'
    },
    lastMessage: '견적서 확인했습니다. 결제 진행할게요!',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: { 'host-1': 1, 'user_mock_6': 0 },
    status: 'ongoing',
    hasActivePayment: true,
    isFavorite: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'room_mock_3',
    quoteId: 'quote_completed_1',
    guestId: 'user_mock_completed',
    hostId: 'host-1',
    guest: {
      id: 'user_mock_completed',
      name: '김완료',
      profileImage: null
    },
    quote: {
      spaceName: '서초 세미나실',
      price: 280000,
      estimatedDuration: '4시간'
    },
    lastMessage: '이용해주셔서 감사합니다. 좋은 하루 되세요!',
    lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: { 'host-1': 0, 'user_mock_completed': 0 },
    status: 'completed',
    hasActivePayment: false,
    isFavorite: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'room_mock_4',
    quoteId: 'quote_mock_host_2',
    guestId: 'user_mock_4',
    hostId: 'host-1',
    guest: {
      id: 'user_mock_4',
      name: '최밴드',
      profileImage: null
    },
    quote: {
      spaceName: '성수 연습실',
      price: 80000,
      estimatedDuration: '3시간'
    },
    lastMessage: '바로견적으로 견적서를 보내드렸습니다.',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: { 'host-1': 0, 'user_mock_4': 1 },
    status: 'ongoing',
    hasActivePayment: false,
    isFavorite: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
]

const initialMockMessages = [
  // room_mock_1 대화
  {
    id: 'msg_mock_1_1',
    roomId: 'room_mock_1',
    senderId: 'host-1',
    type: 'quote',
    content: '견적서를 보내드립니다.',
    quote: {
      spaceName: '홍대 파티룸',
      price: 220000,
      items: [
        { name: '파티룸 대여 (5시간)', price: 150000 },
        { name: '음향 시스템', price: 30000 },
        { name: '조명 연출', price: 20000 },
        { name: '주방 사용', price: 20000 }
      ]
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_mock_1_2',
    roomId: 'room_mock_1',
    senderId: 'user_mock_3',
    type: 'text',
    content: '안녕하세요! 견적서 잘 받았습니다. 송년회 파티인데 20명 정도 되는데 가능할까요?',
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_mock_1_3',
    roomId: 'room_mock_1',
    senderId: 'host-1',
    type: 'text',
    content: '네, 최대 25명까지 수용 가능해서 20명은 문제없습니다!',
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_mock_1_4',
    roomId: 'room_mock_1',
    senderId: 'user_mock_3',
    type: 'text',
    content: '저녁 6시부터 11시까지 이용하고 싶은데 가능한가요?',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_mock_1_5',
    roomId: 'room_mock_1',
    senderId: 'host-1',
    type: 'text',
    content: '네, 그 시간에 예약 가능합니다.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },

  // room_mock_2 대화
  {
    id: 'msg_mock_2_1',
    roomId: 'room_mock_2',
    senderId: 'host-1',
    type: 'quote',
    content: '바로견적으로 견적서를 보내드립니다.',
    quote: {
      spaceName: '강남 스튜디오',
      price: 350000,
      items: [
        { name: '스튜디오 대여 (6시간)', price: 250000 },
        { name: '그린스크린', price: 0 },
        { name: '조명 장비 세트', price: 50000 },
        { name: '편집실 사용 (2시간)', price: 50000 }
      ]
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_mock_2_2',
    roomId: 'room_mock_2',
    senderId: 'user_mock_6',
    type: 'text',
    content: '안녕하세요! 유튜브 촬영용으로 딱 좋네요. 편집실도 같이 쓸 수 있나요?',
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_mock_2_3',
    roomId: 'room_mock_2',
    senderId: 'host-1',
    type: 'text',
    content: '네! 편집실은 맥북 프로와 파이널컷이 설치되어 있어요. 간단한 편집 작업이 가능합니다.',
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_mock_2_4',
    roomId: 'room_mock_2',
    senderId: 'user_mock_6',
    type: 'text',
    content: '견적서 확인했습니다. 결제 진행할게요!',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },

  // room_mock_3 대화 (완료된 채팅)
  {
    id: 'msg_mock_3_1',
    roomId: 'room_mock_3',
    senderId: 'host-1',
    type: 'quote',
    content: '견적서를 보내드립니다.',
    quote: {
      spaceName: '서초 세미나실',
      price: 280000,
      items: [
        { name: '세미나실 대여 (4시간)', price: 200000 },
        { name: '빔프로젝터', price: 0 },
        { name: '다과 서비스 (20인)', price: 80000 }
      ]
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_mock_3_2',
    roomId: 'room_mock_3',
    senderId: 'system',
    type: 'system',
    content: '결제가 완료되었습니다. (280,000원)',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg_mock_3_3',
    roomId: 'room_mock_3',
    senderId: 'user_mock_completed',
    type: 'text',
    content: '오늘 세미나 잘 진행했습니다. 공간이 깔끔하고 좋았어요!',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 1000).toISOString()
  },
  {
    id: 'msg_mock_3_4',
    roomId: 'room_mock_3',
    senderId: 'host-1',
    type: 'text',
    content: '이용해주셔서 감사합니다. 좋은 하루 되세요!',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },

  // room_mock_4 대화 (바로견적)
  {
    id: 'msg_mock_4_1',
    roomId: 'room_mock_4',
    senderId: 'host-1',
    type: 'quote',
    content: '바로견적으로 견적서를 보내드렸습니다.',
    quote: {
      spaceName: '성수 연습실',
      price: 80000,
      items: [
        { name: '연습실 대여 (3시간)', price: 60000 },
        { name: '드럼 세트', price: 0 },
        { name: '앰프 3대', price: 0 },
        { name: '마이크 4개', price: 20000 }
      ]
    },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
]

// 초기화 함수
export function initMockChatData() {
  const existingRooms = localStorage.getItem(ROOMS_KEY)
  const existingMessages = localStorage.getItem(STORAGE_KEY)

  if (!existingRooms) {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(initialMockChatRooms))
  }

  if (!existingMessages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockMessages))
  }
}

// ============ 기본 기능 ============

// 모든 채팅방 가져오기
export function getAllChatRooms() {
  initMockChatData()
  const data = localStorage.getItem(ROOMS_KEY)
  return data ? JSON.parse(data) : []
}

// 사용자의 채팅방 가져오기
export function getChatRoomsForUser(userId) {
  const rooms = getAllChatRooms()
  return rooms.filter(r => r.guestId === userId || r.hostId === userId)
}

// 호스트의 채팅방 가져오기
export function getChatRoomsForHost(hostId) {
  const rooms = getAllChatRooms()
  return rooms
    .filter(r => r.hostId === hostId)
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
}

// 호스트 채팅방 필터링
export function getFilteredHostChatRooms(hostId, filter = 'all') {
  const rooms = getChatRoomsForHost(hostId)

  switch (filter) {
    case 'unread':
      return rooms.filter(r => (r.unreadCount?.[hostId] || 0) > 0)
    case 'ongoing':
      return rooms.filter(r => r.status === 'ongoing' || r.hasActivePayment)
    case 'favorite':
      return rooms.filter(r => r.isFavorite)
    default:
      return rooms
  }
}

// 호스트 전체 안읽음 수 가져오기
export function getUnreadCountForHost(hostId) {
  const rooms = getChatRoomsForHost(hostId)
  return rooms.reduce((total, room) => total + (room.unreadCount?.[hostId] || 0), 0)
}

// 채팅방 즐겨찾기 토글
export function toggleFavorite(roomId) {
  const rooms = getAllChatRooms()
  const index = rooms.findIndex(r => r.id === roomId)

  if (index !== -1) {
    rooms[index].isFavorite = !rooms[index].isFavorite
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
    return rooms[index]
  }
  return null
}

// 채팅방 상태 업데이트
export function updateRoomStatus(roomId, status) {
  const rooms = getAllChatRooms()
  const index = rooms.findIndex(r => r.id === roomId)

  if (index !== -1) {
    rooms[index].status = status
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
    return rooms[index]
  }
  return null
}

// 결제 요청 카드 메시지 추가
export function addPaymentRequestMessage(roomId, paymentData) {
  const message = addMessage(roomId, {
    senderId: paymentData.hostId,
    type: 'payment_request',
    content: '결제 요청을 보냈습니다.',
    paymentRequest: {
      id: paymentData.id,
      spaceName: paymentData.spaceName,
      totalAmount: paymentData.totalAmount,
      depositAmount: paymentData.depositAmount,
      depositRate: paymentData.depositRate,
      discount: paymentData.discount,
      description: paymentData.description,
    },
  })

  // 채팅방에 결제 진행 중 표시
  updateChatRoom(roomId, { hasActivePayment: true, status: 'ongoing' })

  return message
}

// 간편 결제 요청 메시지 추가
export function sendSimplePaymentRequest(roomId, hostId, amount, memo = '') {
  const paymentId = `simple_pay_${Date.now()}`

  const message = addMessage(roomId, {
    senderId: hostId,
    type: 'simple_payment',
    content: '간편 결제 요청을 보냈습니다.',
    simplePayment: {
      id: paymentId,
      amount: amount,
      memo: memo,
      status: 'pending', // pending | paid | cancelled
      createdAt: new Date().toISOString(),
    },
  })

  // 채팅방에 결제 진행 중 표시
  updateChatRoom(roomId, { hasActivePayment: true, status: 'ongoing' })

  return message
}

// 간편 결제 상태 업데이트
export function updateSimplePaymentStatus(roomId, paymentId, status) {
  const messages = getAllMessages()
  const index = messages.findIndex(
    m => m.roomId === roomId && m.simplePayment?.id === paymentId
  )

  if (index !== -1) {
    messages[index].simplePayment.status = status
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))

    // 결제 완료 시 시스템 메시지 추가
    if (status === 'paid') {
      addMessage(roomId, {
        senderId: 'system',
        type: 'system',
        content: `결제가 완료되었습니다. (${messages[index].simplePayment.amount.toLocaleString()}원)`,
      })
    }

    return messages[index]
  }
  return null
}

// 견적 수정
export function updateQuoteInChat(roomId, quoteId, updates) {
  // 채팅방의 견적 정보 업데이트
  const rooms = getAllChatRooms()
  const roomIndex = rooms.findIndex(r => r.id === roomId)

  if (roomIndex !== -1 && rooms[roomIndex].quote) {
    rooms[roomIndex].quote = { ...rooms[roomIndex].quote, ...updates }
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))

    // 시스템 메시지 추가
    addMessage(roomId, {
      senderId: 'system',
      type: 'system',
      content: '견적이 수정되었습니다.',
    })

    return rooms[roomIndex].quote
  }
  return null
}

// 견적 재발송
export function resendQuote(roomId, hostId) {
  const room = getChatRoom(roomId)
  if (!room || !room.quote) return null

  // 견적서 메시지 재발송
  const message = addMessage(roomId, {
    senderId: hostId,
    type: 'quote',
    content: '견적서를 다시 보내드립니다.',
    quote: room.quote,
  })

  return message
}

// 특정 채팅방 가져오기
export function getChatRoom(roomId) {
  const rooms = getAllChatRooms()
  return rooms.find(r => r.id === roomId)
}

// 견적 기반으로 채팅방 찾기 또는 생성
export function getOrCreateChatRoom(quoteId, guestId, hostId, quote) {
  const rooms = getAllChatRooms()
  let room = rooms.find(r => r.quoteId === quoteId)

  if (!room) {
    room = {
      id: `room_${Date.now()}`,
      quoteId,
      guestId,
      hostId,
      quote,
      lastMessage: null,
      lastMessageAt: new Date().toISOString(),
      unreadCount: { [guestId]: 0, [hostId]: 0 },
      createdAt: new Date().toISOString(),
    }
    rooms.push(room)
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))

    // 견적서를 첫 메시지로 추가
    addMessage(room.id, {
      senderId: hostId,
      type: 'quote',
      content: '견적서를 보내드립니다.',
      quote: quote,
    })
  }

  return room
}

// 채팅방 업데이트
export function updateChatRoom(roomId, updates) {
  const rooms = getAllChatRooms()
  const index = rooms.findIndex(r => r.id === roomId)

  if (index !== -1) {
    rooms[index] = { ...rooms[index], ...updates }
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
  }

  return rooms[index]
}

// 모든 메시지 가져오기
export function getAllMessages() {
  initMockChatData()
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// 채팅방별 메시지 가져오기
export function getMessagesByRoom(roomId) {
  const messages = getAllMessages()
  return messages.filter(m => m.roomId === roomId).sort((a, b) =>
    new Date(a.createdAt) - new Date(b.createdAt)
  )
}

// 메시지 추가
export function addMessage(roomId, messageData) {
  const messages = getAllMessages()

  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    roomId,
    ...messageData,
    createdAt: new Date().toISOString(),
  }

  messages.push(newMessage)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))

  // 채팅방 마지막 메시지 업데이트
  updateChatRoom(roomId, {
    lastMessage: newMessage.content,
    lastMessageAt: newMessage.createdAt,
  })

  return newMessage
}

// 메시지 읽음 처리
export function markMessagesAsRead(roomId, userId) {
  const rooms = getAllChatRooms()
  const index = rooms.findIndex(r => r.id === roomId)

  if (index !== -1) {
    rooms[index].unreadCount[userId] = 0
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
  }
}

// 안읽은 메시지 수 증가
export function incrementUnreadCount(roomId, userId) {
  const rooms = getAllChatRooms()
  const index = rooms.findIndex(r => r.id === roomId)

  if (index !== -1) {
    if (!rooms[index].unreadCount) {
      rooms[index].unreadCount = {}
    }
    rooms[index].unreadCount[userId] = (rooms[index].unreadCount[userId] || 0) + 1
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
  }
}

// Mock 대화 생성
export function generateMockConversation(roomId, guestId, hostId, hostName) {
  const mockMessages = [
    {
      senderId: guestId,
      type: 'text',
      content: '안녕하세요, 견적서 잘 받았습니다. 몇 가지 문의드릴게요.',
    },
    {
      senderId: hostId,
      type: 'text',
      content: `안녕하세요! ${hostName}입니다. 네, 편하게 문의해 주세요.`,
    },
    {
      senderId: guestId,
      type: 'text',
      content: '작업 시간은 어느 정도 걸릴까요?',
    },
    {
      senderId: hostId,
      type: 'text',
      content: '평수와 상태에 따라 다르지만, 보통 2~3시간 정도 소요됩니다.',
    },
  ]

  mockMessages.forEach((msg, index) => {
    setTimeout(() => {
      addMessage(roomId, msg)
    }, index * 100)
  })
}

// 채팅 통계
export function getChatStats(hostId) {
  const rooms = getChatRoomsForHost(hostId)

  return {
    totalRooms: rooms.length,
    unreadCount: rooms.reduce((sum, r) => sum + (r.unreadCount?.[hostId] || 0), 0),
    ongoingRooms: rooms.filter(r => r.status === 'ongoing').length,
    favoriteRooms: rooms.filter(r => r.isFavorite).length
  }
}

export default {
  getAllChatRooms,
  getChatRoomsForUser,
  getChatRoom,
  getOrCreateChatRoom,
  updateChatRoom,
  getAllMessages,
  getMessagesByRoom,
  addMessage,
  markMessagesAsRead,
  incrementUnreadCount,
  generateMockConversation,
  sendSimplePaymentRequest,
  updateSimplePaymentStatus,
  updateQuoteInChat,
  resendQuote,
  initMockChatData,
  getChatStats,
  getChatRoomsForHost,
  getFilteredHostChatRooms,
  getUnreadCountForHost,
  toggleFavorite,
  updateRoomStatus,
  addPaymentRequestMessage
}
