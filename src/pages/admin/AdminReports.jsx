import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getReports, processReport, formatDateTime } from '../../stores/adminStore'

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    loadReports()
  }, [filter])

  const loadReports = () => {
    setReports(getReports(filter))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">접수</span>
      case 'reviewing':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">검토중</span>
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">처리완료</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">기각</span>
      default:
        return null
    }
  }

  const getActionBadge = (action) => {
    switch (action) {
      case 'warning':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">경고</span>
      case 'suspend':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">이용정지</span>
      case 'ban':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-800 text-white rounded-full">강제탈퇴</span>
      default:
        return null
    }
  }

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'pending', label: '접수' },
    { id: 'reviewing', label: '검토중' },
    { id: 'completed', label: '처리완료' }
  ]

  const handleAction = (action) => {
    if (!selectedReport) return

    const result = processReport(selectedReport.id, action)
    if (result.success) {
      alert(`${action === 'warning' ? '경고' : action === 'suspend' ? '이용정지' : '강제탈퇴'} 처리되었습니다.`)
      setSelectedReport(null)
      loadReports()
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">신고 관리</h1>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === tab.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">신고자</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">피신고자</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">사유</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">상태</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">조치</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">접수일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">{report.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{report.reporterName}</p>
                        <p className="text-xs text-gray-500">{report.reporterType === 'guest' ? '게스트' : '호스트'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{report.targetName}</p>
                        <p className="text-xs text-gray-500">{report.targetType === 'guest' ? '게스트' : '호스트'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{report.reason}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(report.status)}</td>
                    <td className="px-6 py-4 text-center">{report.action && getActionBadge(report.action)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatDateTime(report.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.length === 0 && (
              <div className="p-12 text-center text-gray-500">신고가 없습니다</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedReport(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">신고 상세</h2>
              <button onClick={() => setSelectedReport(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">신고 ID</span>
                <span className="font-medium">{selectedReport.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">신고자</span>
                <span className="font-medium">{selectedReport.reporterName} ({selectedReport.reporterType === 'guest' ? '게스트' : '호스트'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">피신고자</span>
                <span className="font-medium">{selectedReport.targetName} ({selectedReport.targetType === 'guest' ? '게스트' : '호스트'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">신고 사유</span>
                <span className="font-medium">{selectedReport.reason}</span>
              </div>
              <div>
                <span className="text-gray-600 block mb-2">상세 내용</span>
                <p className="p-3 bg-gray-50 rounded-lg text-gray-700">{selectedReport.description}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">상태</span>
                {getStatusBadge(selectedReport.status)}
              </div>
              {selectedReport.action && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">조치</span>
                  {getActionBadge(selectedReport.action)}
                </div>
              )}
            </div>

            {selectedReport.status !== 'completed' && (
              <div className="p-6 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-3">제재 조치 선택</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction('warning')}
                    className="flex-1 py-2 bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200"
                  >
                    경고
                  </button>
                  <button
                    onClick={() => handleAction('suspend')}
                    className="flex-1 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200"
                  >
                    이용정지
                  </button>
                  <button
                    onClick={() => handleAction('ban')}
                    className="flex-1 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900"
                  >
                    강제탈퇴
                  </button>
                </div>
              </div>
            )}

            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
