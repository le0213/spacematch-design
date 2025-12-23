import { useState } from 'react'
import SpacePreviewModal from './SpacePreviewModal'
import { formatPrice } from '../stores/hostStore'

export default function SpaceInfoCard({ space, variant = 'default', className = '' }) {
  const [showModal, setShowModal] = useState(false)

  if (!space) return null

  // 스페이스클라우드 URL 생성
  const getSpaceCloudUrl = () => {
    if (space.spaceCloudUrl) return space.spaceCloudUrl
    if (space.spaceCloudId) return `https://www.spacecloud.kr/space/${space.spaceCloudId}`
    return 'https://www.spacecloud.kr'
  }

  // 대표 이미지
  const mainImage = Array.isArray(space.images) ? space.images[0] : space.image

  // variant에 따른 스타일
  const isCompact = variant === 'compact'
  const isInline = variant === 'inline'

  if (isInline) {
    // 인라인 버전 (채팅 등에서 사용)
    return (
      <>
        <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${className}`}>
          {mainImage && (
            <img
              src={mainImage}
              alt={space.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{space.name}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {space.rating && (
                <span className="flex items-center gap-0.5">
                  <span className="text-yellow-400">★</span>
                  {space.rating}
                  {space.reviewCount && <span className="text-gray-400">({space.reviewCount})</span>}
                </span>
              )}
              {space.capacity && (
                <span>최대 {space.capacity}명</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 text-sm text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
          >
            상세 정보
          </button>
        </div>

        {showModal && (
          <SpacePreviewModal
            space={space}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    )
  }

  if (isCompact) {
    // 컴팩트 버전
    return (
      <>
        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
          <div className="flex items-center gap-4 p-4">
            {mainImage && (
              <img
                src={mainImage}
                alt={space.name}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">{space.name}</h3>
              {space.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {space.location}
                </p>
              )}
              <div className="flex items-center gap-3 text-sm">
                {space.rating && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <span className="text-yellow-400">★</span>
                    {space.rating}
                    {space.reviewCount && (
                      <span className="text-gray-400">({space.reviewCount})</span>
                    )}
                  </span>
                )}
                {space.capacity && (
                  <span className="text-gray-500">최대 {space.capacity}명</span>
                )}
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-2 text-sm text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors flex items-center justify-center gap-1"
            >
              상세 정보 보기
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>

        {showModal && (
          <SpacePreviewModal
            space={space}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    )
  }

  // 기본 버전 (전체 카드)
  return (
    <>
      <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
        {/* 이미지 */}
        {mainImage && (
          <div className="aspect-video relative">
            <img
              src={mainImage}
              alt={space.name}
              className="w-full h-full object-cover"
            />
            {/* 스페이스클라우드 뱃지 */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-600 flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              스페이스클라우드
            </div>
          </div>
        )}

        {/* 정보 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-2">{space.name}</h3>

          {/* 위치 */}
          {space.location && (
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {space.location}
            </p>
          )}

          {/* 가격 */}
          {(space.pricePerHour || space.price) && (
            <p className="text-lg font-bold text-violet-600 mb-3">
              {formatPrice(space.pricePerHour || space.price)}원
              <span className="text-sm font-normal text-gray-500">/시간</span>
            </p>
          )}

          {/* 평점, 리뷰, 수용인원 */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {space.rating && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="font-medium">{space.rating}</span>
                {space.reviewCount && (
                  <span className="text-gray-400">({space.reviewCount})</span>
                )}
              </span>
            )}
            {space.capacity && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                최대 {space.capacity}명
              </span>
            )}
          </div>

          {/* 버튼 */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 text-sm font-medium text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors flex items-center justify-center gap-1.5"
          >
            상세 정보 보기
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>

      {showModal && (
        <SpacePreviewModal
          space={space}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
