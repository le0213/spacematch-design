import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { Link } from 'react-router-dom'
import {
  getDashboardStats,
  getAlerts,
  formatPrice,
  getRefundStats,
  getBusinessVerificationStats,
  getAutoQuoteStats
} from '../../stores/adminStore'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [refundStats, setRefundStats] = useState(null)
  const [verificationStats, setVerificationStats] = useState(null)
  const [autoQuoteStats, setAutoQuoteStats] = useState(null)

  useEffect(() => {
    setStats(getDashboardStats())
    setAlerts(getAlerts())
    setRefundStats(getRefundStats())
    setVerificationStats(getBusinessVerificationStats())
    setAutoQuoteStats(getAutoQuoteStats())
  }, [])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">운영 대시보드</h1>
          <p className="text-gray-500 mt-1">{today}</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">신규 요청</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.today.newRequests}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">견적 발행</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.today.quotesIssued}</p>
                </div>
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">결제 완료</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.today.paymentsCompleted}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">거래 금액</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(stats.today.totalAmount)}원</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 환불 요청 대기 */}
          <Link to="/admin/refunds" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">환불 요청 대기</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{refundStats?.pending || 0}건</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 사업자 검증 대기 */}
          <Link to="/admin/business-verification" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">사업자 검증 대기</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{verificationStats?.pending || 0}건</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 바로견적 발송 현황 */}
          <Link to="/admin/auto-quotes" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">오늘 바로견적</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{autoQuoteStats?.todaySent || 0}건</p>
                <p className="text-xs text-gray-400 mt-0.5">성사율 {autoQuoteStats?.successRate || 0}%</p>
              </div>
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  이상 징후 알림
                </h2>
              </div>
              <div className="p-6">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">현재 알림이 없습니다</p>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)}`}
                      >
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(alert.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">주간 추이</h2>
            </div>
            <div className="p-6">
              {stats && (
                <div className="space-y-4">
                  {stats.weekly.map((day, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-6 text-sm text-gray-500">{day.day}</span>
                      <div className="flex-1 flex gap-1">
                        <div
                          className="h-4 bg-blue-500 rounded"
                          style={{ width: `${(day.requests / 60) * 100}%` }}
                          title={`요청: ${day.requests}`}
                        />
                        <div
                          className="h-4 bg-violet-500 rounded"
                          style={{ width: `${(day.quotes / 60) * 100}%` }}
                          title={`견적: ${day.quotes}`}
                        />
                        <div
                          className="h-4 bg-green-500 rounded"
                          style={{ width: `${(day.payments / 60) * 100}%` }}
                          title={`결제: ${day.payments}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4 mt-6 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-gray-500">요청</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-violet-500 rounded" />
                  <span className="text-gray-500">견적</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-gray-500">결제</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
