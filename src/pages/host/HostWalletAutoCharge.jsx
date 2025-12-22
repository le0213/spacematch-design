import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAutoChargeSettings, saveAutoChargeSettings, formatPrice } from '../../stores/walletStore'

export default function HostWalletAutoCharge() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    enabled: false,
    thresholdAmount: 10000,
    chargeAmount: 30000,
    paymentMethod: null
  })
  const [isSaving, setIsSaving] = useState(false)

  const hostId = 'host-1'

  useEffect(() => {
    const savedSettings = getAutoChargeSettings(hostId)
    setSettings(savedSettings)
  }, [])

  const thresholdOptions = [5000, 10000, 20000, 30000]
  const chargeAmountOptions = [10000, 30000, 50000, 100000]

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const result = saveAutoChargeSettings(hostId, settings)

      if (result.success) {
        alert('자동충전 설정이 저장되었습니다.')
        navigate('/host/wallet')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="ml-2 text-lg font-semibold text-gray-900">자동충전 설정</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 자동충전 ON/OFF */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">자동충전</h2>
              <p className="text-sm text-gray-500 mt-1">
                잔액이 부족할 때 자동으로 충전됩니다
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.enabled ? 'bg-violet-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 설정 영역 */}
        <div className={`space-y-4 transition-opacity ${settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          {/* 기준 잔액 */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">기준 잔액</h3>
            <p className="text-sm text-gray-500 mb-4">
              잔액이 이 금액 이하일 때 자동 충전됩니다
            </p>
            <div className="grid grid-cols-2 gap-3">
              {thresholdOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSettings({ ...settings, thresholdAmount: amount })}
                  className={`py-3 rounded-xl border-2 font-medium transition-all ${
                    settings.thresholdAmount === amount
                      ? 'border-violet-600 bg-violet-50 text-violet-600'
                      : 'border-gray-200 text-gray-700 hover:border-violet-300'
                  }`}
                >
                  {formatPrice(amount)}원 이하
                </button>
              ))}
            </div>
          </div>

          {/* 충전 금액 */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">충전 금액</h3>
            <p className="text-sm text-gray-500 mb-4">
              자동 충전 시 충전할 금액
            </p>
            <div className="grid grid-cols-2 gap-3">
              {chargeAmountOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSettings({ ...settings, chargeAmount: amount })}
                  className={`py-3 rounded-xl border-2 font-medium transition-all ${
                    settings.chargeAmount === amount
                      ? 'border-violet-600 bg-violet-50 text-violet-600'
                      : 'border-gray-200 text-gray-700 hover:border-violet-300'
                  }`}
                >
                  {formatPrice(amount)}원
                </button>
              ))}
            </div>
          </div>

          {/* 결제 수단 */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">결제 수단</h3>
            <p className="text-sm text-gray-500 mb-4">
              자동 충전에 사용할 카드를 등록하세요
            </p>

            {settings.paymentMethod ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{settings.paymentMethod.cardName}</p>
                    <p className="text-sm text-gray-500">•••• {settings.paymentMethod.lastFour}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, paymentMethod: null })}
                  className="text-sm text-violet-600 hover:text-violet-700"
                >
                  변경
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  // Mock 카드 등록
                  setSettings({
                    ...settings,
                    paymentMethod: {
                      cardName: '신한카드',
                      lastFour: '1234'
                    }
                  })
                }}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors"
              >
                + 결제 카드 등록
              </button>
            )}
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={isSaving || (settings.enabled && !settings.paymentMethod)}
          className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-colors ${
            !isSaving && (!settings.enabled || settings.paymentMethod)
              ? 'bg-violet-600 text-white hover:bg-violet-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              저장 중...
            </span>
          ) : (
            '설정 저장'
          )}
        </button>

        {/* 안내 문구 */}
        <div className="mt-6 p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-600 leading-relaxed">
            • 자동충전은 바로견적 발송 시 잔액이 부족할 때 실행됩니다.<br />
            • 결제 실패 시 바로견적이 발송되지 않습니다.<br />
            • 자동충전 내역은 캐시 지갑에서 확인할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  )
}
