import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserRequests } from '../stores/requestStore'
import { GuestHeader } from '../components/Header'
import Footer from '../components/Footer'

// Mock 견적 데이터 (Phase 2에서 실제 데이터로 대체)
const mockQuotes = {
  req_1: [
    { id: 'q1', hostName: '강남 프리미엄 회의실', price: 210000 },
    { id: 'q2', hostName: '홍대 스튜디오', price: 180000 },
  ],
}

// 상태별 배지 색상
const statusColors = {
  '대기중': 'bg-yellow-100 text-yellow-700',
  '견적서 발송 완료': 'bg-green-100 text-green-700',
}

export default function MyRequests() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [activeTab, setActiveTab] = useState('전체')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/my-requests')
      return
    }

    const userRequests = getUserRequests(user.id)
    setRequests(userRequests)
  }, [user, isAuthenticated, navigate])

  const tabs = ['전체', '진행중', '완료']

  const filteredRequests = requests.filter(req => {
    if (activeTab === '전체') return true
    if (activeTab === '진행중') return req.status === '대기중'
    if (activeTab === '완료') return req.status === '견적서 발송 완료'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <GuestHeader />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">내 요청</h1>
            <p className="text-gray-500">
              요청한 견적 내역을 확인하고 관리하세요
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Request List */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                아직 요청이 없어요
              </h3>
              <p className="text-gray-500 mb-6">
                원하는 공간을 찾아 견적을 요청해보세요
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-violet-600 text-white font-medium rounded-full hover:bg-violet-700 transition-colors"
              >
                공간 찾기
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(request => {
                const quotes = mockQuotes[request.id] || []
                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-violet-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[request.status]}`}>
                            {request.status}
                          </span>
                          <span className="text-sm text-gray-400">
                            {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {request.spaceType || '회의실'} - {request.location || '서울 강남구'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {request.purpose || '워크숍'} · {request.capacity || '20명'}
                        </p>
                      </div>
                      <div className="text-right">
                        {quotes.length > 0 ? (
                          <>
                            <div className="text-2xl font-bold text-violet-600">
                              {quotes.length}
                            </div>
                            <div className="text-sm text-gray-500">받은 견적</div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-400">
                            견적 대기 중
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      {quotes.length > 0 ? (
                        <>
                          <Link
                            to={`/quotes/${request.id}`}
                            className="flex-1 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg text-center hover:bg-violet-700 transition-colors"
                          >
                            견적 확인하기
                          </Link>
                          <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                            요청 수정
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                            요청 수정
                          </button>
                          <button className="px-4 py-2 text-red-500 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors">
                            요청 취소
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Demo: Add Sample Request */}
          {requests.length === 0 && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center text-sm text-gray-500">
              <p>데모: 아직 요청이 없습니다. 홈에서 견적을 요청해보세요!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Demo Navigation */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 shadow-lg"
        >
          ← 홈으로
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
