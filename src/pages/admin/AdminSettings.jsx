import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getSystemSettings, saveSystemSettings, formatPrice } from '../../stores/adminStore'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSettings(getSystemSettings())
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = saveSystemSettings(settings)
      if (result.success) {
        alert('설정이 저장되었습니다.')
        setSettings(result.settings)
      }
    } catch (error) {
      alert('저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!settings) return null

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">시스템 설정</h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Quote Price */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">견적 단가 설정</h2>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="number"
                  value={settings.quotePricePerUnit}
                  onChange={(e) => setSettings({ ...settings, quotePricePerUnit: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-violet-500 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
              </div>
              <p className="text-gray-500">건당</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">바로견적 발송 시 차감되는 캐시 금액입니다.</p>
          </div>

          {/* Fee Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">수수료율 설정</h2>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="number"
                  value={settings.feeRate}
                  onChange={(e) => setSettings({ ...settings, feeRate: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-violet-500 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">거래 금액에서 차감되는 서비스 수수료율입니다.</p>
          </div>

          {/* Auto Quote */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">바로견적 기능</h2>
                <p className="text-sm text-gray-500 mt-1">호스트의 바로견적 기능 활성화 여부</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoQuoteEnabled: !settings.autoQuoteEnabled })}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.autoQuoteEnabled ? 'bg-violet-600' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.autoQuoteEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">시간당 발송 제한</label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.autoQuoteHourlyLimit || 10}
                    onChange={(e) => setSettings({ ...settings, autoQuoteHourlyLimit: parseInt(e.target.value) || 10 })}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:border-violet-500 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">건</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">호스트당 1시간 내 발송 가능한 바로견적 수를 제한합니다.</p>
          </div>

          {/* Refund Policy */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">환불 정책</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">7일 이상 (이용일 기준)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.refundPolicy?.over7Days || 100}
                      onChange={(e) => setSettings({
                        ...settings,
                        refundPolicy: { ...settings.refundPolicy, over7Days: parseInt(e.target.value) || 100 }
                      })}
                      className="w-full px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:border-violet-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">3~6일</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.refundPolicy?.days3to6 || 70}
                      onChange={(e) => setSettings({
                        ...settings,
                        refundPolicy: { ...settings.refundPolicy, days3to6: parseInt(e.target.value) || 70 }
                      })}
                      className="w-full px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:border-violet-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">1~2일</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.refundPolicy?.days1to2 || 50}
                      onChange={(e) => setSettings({
                        ...settings,
                        refundPolicy: { ...settings.refundPolicy, days1to2: parseInt(e.target.value) || 50 }
                      })}
                      className="w-full px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:border-violet-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">당일</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.refundPolicy?.sameDay || 0}
                      onChange={(e) => setSettings({
                        ...settings,
                        refundPolicy: { ...settings.refundPolicy, sameDay: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:border-violet-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">이용 예정일까지 남은 기간에 따른 환불률을 설정합니다.</p>
            </div>
          </div>

          {/* Business Verification */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">사업자 검증 필수</h2>
                <p className="text-sm text-gray-500 mt-1">호스트의 견적 발송 전 사업자 검증 필수 여부</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, businessVerificationRequired: !settings.businessVerificationRequired })}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.businessVerificationRequired ? 'bg-violet-600' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.businessVerificationRequired ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Notification Templates */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">알림 템플릿</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">새 요청 알림</label>
                <input
                  type="text"
                  value={settings.notificationTemplates.newRequest}
                  onChange={(e) => setSettings({
                    ...settings,
                    notificationTemplates: { ...settings.notificationTemplates, newRequest: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">결제 완료 알림</label>
                <input
                  type="text"
                  value={settings.notificationTemplates.paymentComplete}
                  onChange={(e) => setSettings({
                    ...settings,
                    notificationTemplates: { ...settings.notificationTemplates, paymentComplete: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">정산 완료 알림</label>
                <input
                  type="text"
                  value={settings.notificationTemplates.settlementComplete}
                  onChange={(e) => setSettings({
                    ...settings,
                    notificationTemplates: { ...settings.notificationTemplates, settlementComplete: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Settings History */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">변경 이력</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {settings.settingsHistory?.map((history, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{history.change}</p>
                    <p className="text-sm text-gray-500">{history.admin}</p>
                  </div>
                  <span className="text-sm text-gray-500">{history.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
