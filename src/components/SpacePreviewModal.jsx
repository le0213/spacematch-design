import { useState } from 'react'
import { formatPrice } from '../stores/hostStore'

export default function SpacePreviewModal({ space, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!space) return null

  // 이미지 배열
  const images = Array.isArray(space.images) ? space.images : (space.image ? [space.image] : [])

  // 스페이스클라우드 URL 생성
  const getSpaceCloudUrl = () => {
    if (space.spaceCloudUrl) return space.spaceCloudUrl
    if (space.spaceCloudId) return `https://www.spacecloud.kr/space/${space.spaceCloudId}`
    return 'https://www.spacecloud.kr'
  }

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleOpenSpaceCloud = () => {
    window.open(getSpaceCloudUrl(), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">공간 정보</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="relative">
              <div className="aspect-video bg-gray-100">
                <img
                  src={images[currentImageIndex]}
                  alt={`${space.name} - ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Image Counter */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 rounded-full text-xs text-white">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          )}

          {/* Space Info */}
          <div className="p-5">
            {/* Name & Location */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{space.name}</h3>
            {space.location && (
              <p className="text-gray-500 flex items-center gap-1.5 mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {space.location}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4">
              {space.rating && (
                <span className="flex items-center gap-1 text-gray-700">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="font-semibold">{space.rating}</span>
                  {space.reviewCount && (
                    <span className="text-gray-400">({space.reviewCount}개 리뷰)</span>
                  )}
                </span>
              )}
              {space.capacity && (
                <span className="flex items-center gap-1 text-gray-600">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  최대 {space.capacity}명
                </span>
              )}
            </div>

            {/* Price */}
            {(space.pricePerHour || space.price) && (
              <p className="text-2xl font-bold text-violet-600 mb-4">
                {formatPrice(space.pricePerHour || space.price)}원
                <span className="text-sm font-normal text-gray-500">/시간</span>
              </p>
            )}

            {/* Description */}
            {space.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {space.description}
              </p>
            )}

            {/* Amenities */}
            {space.amenities && space.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {space.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* SpaceCloud Link Section */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                더 많은 사진과 리뷰는 스페이스클라우드에서 확인하세요.
              </p>
              <button
                onClick={handleOpenSpaceCloud}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                상세 정보 보기
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
