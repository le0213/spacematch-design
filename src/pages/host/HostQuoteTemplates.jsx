import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import HostHeader from '../../components/HostHeader'
import { getHostByUserId, getHostStats, formatPrice } from '../../stores/hostStore'
import {
  getTemplatesByHost,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setDefaultTemplate
} from '../../stores/quoteTemplateStore'
import { getUnreadCountForHost } from '../../stores/chatStore'

export default function HostQuoteTemplates() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [host, setHost] = useState(null)
  const [stats, setStats] = useState(null)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadChats, setUnreadChats] = useState(0)

  // 편집 모달
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    spaceName: '',
    description: '',
    items: [{ name: '', price: 0 }],
    estimatedDuration: '',
    isDefault: false
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/host/login')
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading])

  const loadData = () => {
    const hostData = getHostByUserId(user.id)
    if (!hostData) {
      navigate('/host/dashboard')
      return
    }
    setHost(hostData)

    const hostStats = getHostStats(hostData.id)
    setStats(hostStats)

    const hostTemplates = getTemplatesByHost(hostData.id)
    setTemplates(hostTemplates)

    const unread = getUnreadCountForHost(hostData.id)
    setUnreadChats(unread)

    setLoading(false)
  }

  const openCreateModal = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      spaceName: '',
      description: '',
      items: [{ name: '', price: 0 }],
      estimatedDuration: '',
      isDefault: false
    })
    setShowModal(true)
  }

  const openEditModal = (template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      spaceName: template.spaceName,
      description: template.description,
      items: [...template.items],
      estimatedDuration: template.estimatedDuration,
      isDefault: template.isDefault
    })
    setShowModal(true)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', price: 0 }]
    })
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      })
    }
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = field === 'price' ? parseInt(value) || 0 : value
    setFormData({ ...formData, items: newItems })
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('템플릿 이름을 입력해주세요.')
      return
    }
    if (!formData.spaceName.trim()) {
      alert('공간명을 입력해주세요.')
      return
    }

    const totalPrice = formData.items.reduce((sum, item) => sum + item.price, 0)

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        ...formData,
        totalPrice
      })
    } else {
      createTemplate({
        hostId: host.id,
        ...formData,
        totalPrice
      })
    }

    setShowModal(false)
    loadData()
  }

  const handleDelete = (templateId) => {
    if (confirm('정말 이 템플릿을 삭제하시겠습니까?')) {
      deleteTemplate(templateId)
      loadData()
    }
  }

  const handleSetDefault = (templateId) => {
    setDefaultTemplate(host.id, templateId)
    loadData()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader stats={stats} unreadChats={unreadChats} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/host/requests" className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">자주 작성하는 견적</h1>
              <p className="text-gray-500 mt-1">자주 사용하는 견적 템플릿을 관리하세요</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            새 템플릿
          </button>
        </div>

        {/* Template List */}
        {templates.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              아직 저장된 템플릿이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">자주 사용하는 견적을 템플릿으로 저장해보세요</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-full font-medium hover:bg-violet-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              첫 템플릿 만들기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-violet-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {template.isDefault && (
                        <span className="text-amber-500 text-lg" title="기본 템플릿">⭐</span>
                      )}
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{template.spaceName}</p>
                  </div>
                  <span className="text-lg font-bold text-violet-600">
                    {formatPrice(template.totalPrice)}원
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span>{template.items.length}개 항목</span>
                    <span>{template.usageCount}회 사용</span>
                    {template.estimatedDuration && (
                      <span>{template.estimatedDuration}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!template.isDefault && (
                      <button
                        onClick={() => handleSetDefault(template.id)}
                        className="px-3 py-1.5 text-amber-600 text-sm font-medium hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        기본으로 설정
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(template)}
                      className="px-3 py-1.5 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="px-3 py-1.5 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 안내 */}
        <div className="mt-8 bg-violet-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-violet-800">
              <p className="font-medium mb-1">템플릿 활용 팁</p>
              <p className="text-violet-600">
                템플릿을 만들어두면 견적서 작성 시 불러와서 빠르게 작성할 수 있습니다.
                기본 템플릿으로 설정하면 바로견적에서도 활용됩니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 템플릿 편집 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTemplate ? '템플릿 수정' : '새 템플릿'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* 템플릿 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 이름 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 기본 회의실 견적"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* 공간명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">공간명 *</label>
                <input
                  type="text"
                  value={formData.spaceName}
                  onChange={(e) => setFormData({ ...formData, spaceName: e.target.value })}
                  placeholder="예: 강남 프리미엄 회의실"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">견적 설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="공간 소개 및 제공 서비스에 대해 설명해주세요."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>

              {/* 예상 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">예상 이용 시간</label>
                <input
                  type="text"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                  placeholder="예: 4시간"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* 견적 항목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">견적 항목</label>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="항목명"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                      />
                      <div className="relative w-28">
                        <input
                          type="number"
                          value={item.price || ''}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 pr-6 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-right"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">원</span>
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addItem}
                  className="mt-2 flex items-center gap-1 text-violet-600 text-sm font-medium hover:text-violet-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  항목 추가
                </button>
              </div>

              {/* 합계 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">합계</span>
                  <span className="font-bold text-violet-600">
                    {formatPrice(formData.items.reduce((sum, item) => sum + item.price, 0))}원
                  </span>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
              >
                {editingTemplate ? '수정하기' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
