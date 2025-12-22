import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAdminUser, adminLogout } from '../stores/adminStore'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [admin, setAdmin] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const adminUser = getAdminUser()
    if (!adminUser && location.pathname !== '/admin/login') {
      navigate('/admin/login')
    } else {
      setAdmin(adminUser)
    }
  }, [navigate, location.pathname])

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  // 로그인 페이지는 레이아웃 없이 표시
  if (location.pathname === '/admin/login') {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-800 text-white z-50 flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg">스페이스매치</span>
            <span className="px-2 py-0.5 bg-violet-600 text-white text-xs font-medium rounded">
              어드민
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {admin && (
            <>
              <span className="text-sm text-slate-300">{admin.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : ''}`}>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
