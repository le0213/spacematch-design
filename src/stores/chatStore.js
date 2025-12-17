// LocalStorage 기반 채팅 관리

const STORAGE_KEY = 'spacematch_chats'
const ROOMS_KEY = 'spacematch_chat_rooms'

// 모든 채팅방 가져오기
export function getAllChatRooms() {
  const data = localStorage.getItem(ROOMS_KEY)
  return data ? JSON.parse(data) : []
}

// 사용자의 채팅방 가져오기
export function getChatRoomsForUser(userId) {
  const rooms = getAllChatRooms()
  return rooms.filter(r => r.guestId === userId || r.hostId === userId)
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
}
