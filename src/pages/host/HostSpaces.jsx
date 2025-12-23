import { useState, useEffect } from 'react'
import HostHeader from '../../components/HostHeader'
import SpacePreviewModal from '../../components/SpacePreviewModal'

// Mock 공간 데이터 (스페이스클라우드 연동 시뮬레이션)
const mockSpaces = [
  {
    id: 'space-1',
    spaceCloudId: 'sc_gangnam_studio_001',
    name: '강남 스튜디오 A',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
    ],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop',
    location: '서울 강남구 테헤란로 123',
    capacity: 20,
    pricePerHour: 50000,
    price: 50000,
    rating: 4.9,
    reviewCount: 128,
    amenities: ['빔프로젝터', '화이트보드', 'WiFi', '에어컨', '주차'],
    description: '강남역 인근 프리미엄 스튜디오. 세미나, 촬영, 미팅에 최적화.',
    spaceCloudUrl: 'https://www.spacecloud.kr/space/sc_gangnam_studio_001',
    quoteEnabled: true
  },
  {
    id: 'space-2',
    spaceCloudId: 'sc_hongdae_party_001',
    name: '홍대 파티룸',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800'
    ],
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200&h=200&fit=crop',
    location: '서울 마포구 홍익로 45',
    capacity: 30,
    pricePerHour: 80000,
    price: 80000,
    rating: 4.7,
    reviewCount: 89,
    amenities: ['음향시스템', '조명', '주방', 'WiFi', '에어컨'],
    description: '홍대 중심가 파티룸. 생일파티, 팀 행사에 최적화.',
    spaceCloudUrl: 'https://www.spacecloud.kr/space/sc_hongdae_party_001',
    quoteEnabled: true
  },
  {
    id: 'space-3',
    spaceCloudId: 'sc_seongsu_seminar_001',
    name: '성수 세미나실',
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800'
    ],
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=200&fit=crop',
    location: '서울 성동구 성수이로 88',
    capacity: 50,
    pricePerHour: 120000,
    price: 120000,
    rating: 4.8,
    reviewCount: 156,
    amenities: ['빔프로젝터', '마이크', 'WiFi', '에어컨', '주차', '휴게공간'],
    description: '성수역 근처 대형 세미나실. 강연, 컨퍼런스에 최적화.',
    spaceCloudUrl: 'https://www.spacecloud.kr/space/sc_seongsu_seminar_001',
    quoteEnabled: false
  }
]

export default function HostSpaces() {
  const [spaces, setSpaces] = useState([])
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [selectedSpace, setSelectedSpace] = useState(null)

  useEffect(() => {
    // Mock 데이터 로드
    const savedSpaces = localStorage.getItem('spacematch_host_spaces')
    if (savedSpaces) {
      setSpaces(JSON.parse(savedSpaces))
    } else {
      setSpaces(mockSpaces)
      localStorage.setItem('spacematch_host_spaces', JSON.stringify(mockSpaces))
    }
  }, [])

  const toggleQuote = (spaceId) => {
    setSpaces(prev => prev.map(space =>
      space.id === spaceId
        ? { ...space, quoteEnabled: !space.quoteEnabled }
        : space
    ))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // 저장 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))
      localStorage.setItem('spacematch_host_spaces', JSON.stringify(spaces))
      setHasChanges(false)
      alert('변경사항이 저장되었습니다.')
    } catch (error) {
      console.error('Save error:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">공간 관리</h1>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? '저장 중...' : '변경사항 저장'}
            </button>
          )}
        </div>

        {/* 스페이스클라우드 연동 상태 */}
        <div className={`rounded-xl p-4 mb-6 ${isConnected ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-800">스페이스클라우드 연동됨</p>
                  <p className="text-sm text-green-600">공간 정보가 자동으로 동기화됩니다</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-amber-800">스페이스클라우드 연동 필요</p>
                  <p className="text-sm text-amber-600">공간을 등록하려면 연동이 필요합니다</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-violet-600 text-xl">💡</span>
            <div>
              <p className="font-medium text-violet-800">견적 활성화 안내</p>
              <p className="text-sm text-violet-600 mt-1">
                견적을 활성화하면 해당 공간이 게스트 견적 요청 시 노출됩니다.
                바로견적 설정과 함께 사용하면 자동으로 견적을 발송할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 공간 리스트 */}
        {spaces.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">등록된 공간이 없습니다</p>
            <a
              href="https://spacecloud.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:text-violet-700 font-medium"
            >
              스페이스클라우드에서 공간 등록하기 →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {spaces.map((space) => (
              <div key={space.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  {/* 공간 이미지 */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {space.image ? (
                      <img
                        src={space.image}
                        alt={space.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 공간 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg">{space.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{space.location}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {space.rating && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <span className="text-yellow-400">★</span>
                          {space.rating}
                          {space.reviewCount && (
                            <span className="text-gray-400">({space.reviewCount})</span>
                          )}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        최대 {space.capacity}명
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        시간당 {formatPrice(space.price)}원
                      </span>
                    </div>
                    {/* 상세 정보 보기 버튼 */}
                    <button
                      onClick={() => setSelectedSpace(space)}
                      className="mt-3 text-sm text-violet-600 hover:text-violet-700 font-medium inline-flex items-center gap-1"
                    >
                      상세 정보 보기
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>

                  {/* 견적 토글 */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => toggleQuote(space.id)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        space.quoteEnabled ? 'bg-violet-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                          space.quoteEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-medium ${space.quoteEnabled ? 'text-violet-600' : 'text-gray-500'}`}>
                      {space.quoteEnabled ? '견적 활성' : '견적 비활성'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 공간 추가 안내 */}
        <div className="mt-6 text-center">
          <a
            href="https://spacecloud.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:text-violet-700 font-medium inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            스페이스클라우드에서 새 공간 등록하기
          </a>
        </div>
      </main>

      {/* Space Preview Modal */}
      {selectedSpace && (
        <SpacePreviewModal
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
        />
      )}
    </div>
  )
}
