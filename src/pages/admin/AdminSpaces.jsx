import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  getSpaceList,
  getSpaceStats,
  updateSpaceStatus,
  formatPrice,
  formatDateTime
} from '../../stores/adminStore'

export default function AdminSpaces() {
  const [spaces, setSpaces] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [filter, setFilter] = useState({ status: 'all', region: 'all', search: '' })
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = () => {
    setSpaces(getSpaceList(filter))
    setStats(getSpaceStats())
  }

  const handleStatusChange = (spaceId, status) => {
    const result = updateSpaceStatus(spaceId, status)
    if (result.success) {
      alert(status === 'active' ? '공간이 활성화되었습니다.' : '공간이 비활성화되었습니다.')
      loadData()
      setShowModal(false)
    }
  }

  const openModal = (space) => {
    setSelectedSpace(space)
    setShowModal(true)
  }

  const regions = ['all', '강남', '홍대', '성수', '신촌', '마포']

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">공간 관리</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">전체 공간</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}개</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">활성</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}개</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">비활성</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}개</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="공간명, 호스트명 검색..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
              />
            </div>
            <select
              value={filter.region}
              onChange={(e) => setFilter({ ...filter, region: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
            >
              <option value="all">전체 지역</option>
              {regions.slice(1).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">공간</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">호스트</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">위치</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">수용인원</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">시간당가격</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">평점</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">견적활성</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">처리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {spaces.map(space => (
                  <tr key={space.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={space.images[0]}
                          alt={space.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{space.name}</div>
                          <div className="text-xs text-gray-500">{space.spaceCloudId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{space.hostName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{space.region}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">{space.capacity}명</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatPrice(space.pricePerHour)}원</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-900">
                        <span className="text-yellow-400">★</span> {space.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        space.quoteEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {space.quoteEnabled ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        space.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {space.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openModal(space)}
                        className="text-violet-600 hover:text-violet-700 text-sm font-medium"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
                {spaces.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      등록된 공간이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedSpace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">공간 상세 정보</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 이미지 */}
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={selectedSpace.images[0]}
                  alt={selectedSpace.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 기본 정보 */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{selectedSpace.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedSpace.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedSpace.status === 'active' ? '활성' : '비활성'}
                  </span>
                </div>
                <p className="text-gray-500">{selectedSpace.location}</p>
              </div>

              {/* 상세 정보 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">호스트</span>
                    <p className="font-medium text-gray-900">{selectedSpace.hostName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">수용인원</span>
                    <p className="font-medium text-gray-900">{selectedSpace.capacity}명</p>
                  </div>
                  <div>
                    <span className="text-gray-500">시간당 가격</span>
                    <p className="font-medium text-gray-900">{formatPrice(selectedSpace.pricePerHour)}원</p>
                  </div>
                  <div>
                    <span className="text-gray-500">평점</span>
                    <p className="font-medium text-gray-900">
                      <span className="text-yellow-400">★</span> {selectedSpace.rating} ({selectedSpace.reviewCount})
                    </p>
                  </div>
                </div>
              </div>

              {/* 편의시설 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">편의시설</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSpace.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* 통계 */}
              <div className="bg-violet-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">거래 통계</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-violet-600">{selectedSpace.quoteCount}</p>
                    <p className="text-xs text-gray-500">발송 견적</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-violet-600">{selectedSpace.transactionCount}</p>
                    <p className="text-xs text-gray-500">거래 건수</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-violet-600">{formatPrice(selectedSpace.totalRevenue / 10000)}만</p>
                    <p className="text-xs text-gray-500">총 매출</p>
                  </div>
                </div>
              </div>

              {/* 스페이스클라우드 링크 */}
              <div className="text-sm text-gray-500">
                <span>스페이스클라우드 ID: </span>
                <span className="font-mono text-gray-700">{selectedSpace.spaceCloudId}</span>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                {selectedSpace.status === 'active' ? (
                  <button
                    onClick={() => handleStatusChange(selectedSpace.id, 'inactive')}
                    className="flex-1 py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    비활성화
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(selectedSpace.id, 'active')}
                    className="flex-1 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                  >
                    활성화
                  </button>
                )}
                <a
                  href={`https://www.spacecloud.kr/space/${selectedSpace.spaceCloudId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
                >
                  스페이스클라우드 보기
                </a>
              </div>

              <p className="text-center text-xs text-gray-400">
                등록일: {formatDateTime(selectedSpace.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
