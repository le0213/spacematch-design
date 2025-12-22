import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getHostByUserId, getHostStats, formatPrice } from '../../stores/hostStore'
import { getUnreadCountForHost } from '../../stores/chatStore'
import {
  getAutoQuoteSettings,
  saveAutoQuoteSettings,
  getQuoteTemplates,
  calculateExpectedCost,
  REGION_OPTIONS,
  DAY_OPTIONS,
  TIME_SLOT_OPTIONS,
  PURPOSE_OPTIONS,
} from '../../stores/autoQuoteStore'
import HostHeader from '../../components/HostHeader'

// Multi Select Chip Component
function MultiSelectChips({ label, options, selected, onChange }) {
  const handleToggle = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => handleToggle(option)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              selected.includes(option)
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

// Toggle Switch Component
function ToggleSwitch({ enabled, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-violet-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function HostAutoQuote() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [host, setHost] = useState(null)
  const [stats, setStats] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    enabled: false,
    templateId: null,
    templateName: '',
    templatePrice: 0,
    templateDescription: '',
    conditions: {
      regions: [],
      days: [],
      timeSlots: [],
      minPeople: 1,
      maxPeople: 100,
      purposes: [],
    },
    limits: {
      maxDailyQuotes: 10,
      maxDailyBudget: 10000,
    },
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
      navigate('/host/register')
      return
    }

    setHost(hostData)

    // 통계 로드
    const hostStats = getHostStats(hostData.id)
    setStats(hostStats)

    // 안읽음 수 로드
    const unread = getUnreadCountForHost(hostData.id)
    setUnreadCount(unread)

    // 바로견적 설정 로드
    const autoQuoteSettings = getAutoQuoteSettings(hostData.id)
    setSettings(autoQuoteSettings)

    // 템플릿 로드
    const quoteTemplates = getQuoteTemplates(hostData.id)
    setTemplates(quoteTemplates)

    setLoading(false)
  }

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSettings(prev => ({
        ...prev,
        templateId: template.id,
        templateName: template.name,
        templatePrice: template.price,
        templateDescription: template.description,
      }))
    }
  }

  const handleConditionChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [field]: value,
      },
    }))
  }

  const handleLimitChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [field]: parseInt(value) || 0,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)

    // 저장
    saveAutoQuoteSettings(host.id, settings)

    // 저장 완료 표시
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 500)
  }

  const expectedCost = calculateExpectedCost(settings)

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

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">바로견적 설정</h1>
          <p className="text-gray-500 mt-1">조건에 맞는 요청이 들어오면 자동으로 견적을 발송합니다</p>
        </div>

        {/* Main Toggle */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">바로견적</h2>
              <p className="text-sm text-gray-500 mt-1">
                {settings.enabled ? '조건에 맞는 요청에 자동으로 견적을 발송합니다' : '바로견적이 비활성화되어 있습니다'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-violet-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  settings.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.enabled && (
            <div className="mt-4 p-4 bg-violet-50 rounded-xl">
              <div className="flex items-center gap-2 text-violet-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  오늘 발송: {settings.todayStats?.quotesCount || 0}건 / 사용 캐시: {formatPrice(settings.todayStats?.budgetUsed || 0)}원
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Template Selection */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">견적 템플릿</h3>

          <div className="space-y-3">
            {templates.map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateChange(template.id)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  settings.templateId === template.id
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{template.name}</span>
                  <span className="font-semibold text-violet-600">{formatPrice(template.price)}원</span>
                </div>
                <p className="text-sm text-gray-500">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">발송 조건</h3>
          <p className="text-sm text-gray-500 mb-6">설정한 조건에 100% 일치하는 요청에만 견적을 발송합니다</p>

          <div className="space-y-6">
            {/* Regions */}
            <MultiSelectChips
              label="지역"
              options={REGION_OPTIONS.slice(0, 12)}
              selected={settings.conditions.regions}
              onChange={(value) => handleConditionChange('regions', value)}
            />

            {/* Days */}
            <MultiSelectChips
              label="요일"
              options={DAY_OPTIONS}
              selected={settings.conditions.days}
              onChange={(value) => handleConditionChange('days', value)}
            />

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시간대</label>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOT_OPTIONS.map(slot => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => {
                      const current = settings.conditions.timeSlots
                      if (current.includes(slot.value)) {
                        handleConditionChange('timeSlots', current.filter(s => s !== slot.value))
                      } else {
                        handleConditionChange('timeSlots', [...current, slot.value])
                      }
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      settings.conditions.timeSlots.includes(slot.value)
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* People Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">인원 범위</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={settings.conditions.minPeople}
                    onChange={(e) => handleConditionChange('minPeople', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
                    placeholder="최소"
                  />
                </div>
                <span className="text-gray-400">~</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={settings.conditions.maxPeople}
                    onChange={(e) => handleConditionChange('maxPeople', parseInt(e.target.value) || 100)}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
                    placeholder="최대"
                  />
                </div>
                <span className="text-gray-500 text-sm">명</span>
              </div>
            </div>

            {/* Purposes */}
            <MultiSelectChips
              label="목적"
              options={PURPOSE_OPTIONS}
              selected={settings.conditions.purposes}
              onChange={(value) => handleConditionChange('purposes', value)}
            />
          </div>
        </div>

        {/* Limits */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">남발 방지 설정</h3>

          <div className="space-y-6">
            {/* Max Daily Quotes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                하루 최대 발행 수
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={settings.limits.maxDailyQuotes}
                  onChange={(e) => handleLimitChange('maxDailyQuotes', e.target.value)}
                  min="1"
                  max="50"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="w-20 px-3 py-2 bg-gray-50 rounded-lg text-center font-medium text-gray-900">
                  {settings.limits.maxDailyQuotes}건
                </div>
              </div>
            </div>

            {/* Max Daily Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                하루 최대 캐시 예산
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={settings.limits.maxDailyBudget}
                  onChange={(e) => handleLimitChange('maxDailyBudget', e.target.value)}
                  min="1000"
                  max="100000"
                  step="1000"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="w-24 px-3 py-2 bg-gray-50 rounded-lg text-center font-medium text-gray-900">
                  {formatPrice(settings.limits.maxDailyBudget)}원
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Cost */}
        <div className="bg-violet-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-violet-900">예상 일일 캐시 소모량</h4>
              <p className="text-sm text-violet-700 mt-1">
                조건에 맞는 모든 요청에 견적을 발송할 경우
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-violet-600">
                최대 {formatPrice(expectedCost)}원
              </div>
              <p className="text-sm text-violet-500">견적 1건당 1,000원</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-8 py-3 font-semibold rounded-xl transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            } disabled:opacity-50`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                저장 중...
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                저장됨
              </span>
            ) : (
              '설정 저장'
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
