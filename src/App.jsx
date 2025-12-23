import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

// Pages
import GuestHome from './pages/GuestHome'
import RequestSummary from './pages/RequestSummary'
import HostLanding from './pages/HostLanding'
import ChatRoom from './pages/ChatRoom'
import Auth from './pages/Auth'
import MatchingWait from './pages/MatchingWait'

// Phase 2 Pages
import QuoteList from './pages/QuoteList'
import QuoteDetail from './pages/QuoteDetail'
import Payment from './pages/Payment'
import PaymentComplete from './pages/PaymentComplete'
import QuoteSheet from './pages/QuoteSheet'

// Guest Pages
import GuestMyPage from './pages/GuestMyPage'
import GuestPayments from './pages/GuestPayments'
import GuestRefunds from './pages/GuestRefunds'
import GuestNotifications from './pages/GuestNotifications'

// Phase 3 - Host Pages
import HostDashboard from './pages/host/HostDashboard'
import HostRequests from './pages/host/HostRequests'
import HostRequestDetail from './pages/host/HostRequestDetail'
import HostQuoteCreate from './pages/host/HostQuoteCreate'
import HostQuoteSheet from './pages/host/HostQuoteSheet'
import HostQuoteTemplates from './pages/host/HostQuoteTemplates'

// Phase 4 - Host Chat & Auto Quote
import HostChatList from './pages/host/HostChatList'
import HostChatRoom from './pages/host/HostChatRoom'
import HostAutoQuote from './pages/host/HostAutoQuote'

// Phase 5 - Host Management
import HostSpaces from './pages/host/HostSpaces'
import HostPayments from './pages/host/HostPayments'
import HostSettlements from './pages/host/HostSettlements'
import HostWallet from './pages/host/HostWallet'
import HostWalletCharge from './pages/host/HostWalletCharge'
import HostWalletAutoCharge from './pages/host/HostWalletAutoCharge'
import HostNotifications from './pages/host/HostNotifications'
import HostMyPage from './pages/host/HostMyPage'
import HostBusiness from './pages/host/HostBusiness'

// Phase 6 - Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRequests from './pages/admin/AdminRequests'
import AdminQuotes from './pages/admin/AdminQuotes'
import AdminGuests from './pages/admin/AdminGuests'
import AdminHosts from './pages/admin/AdminHosts'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminSettlements from './pages/admin/AdminSettlements'
import AdminChats from './pages/admin/AdminChats'
import AdminReports from './pages/admin/AdminReports'
import AdminCash from './pages/admin/AdminCash'
import AdminSettings from './pages/admin/AdminSettings'
import AdminRefunds from './pages/admin/AdminRefunds'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminSpaces from './pages/admin/AdminSpaces'
import AdminBusinessVerification from './pages/admin/AdminBusinessVerification'
import AdminAutoQuotes from './pages/admin/AdminAutoQuotes'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Guest Routes */}
          <Route path="/" element={<GuestHome />} />
          <Route path="/request-summary" element={<RequestSummary />} />
          <Route path="/matching-wait" element={<MatchingWait />} />

          {/* Phase 2 - Quote & Payment Routes */}
          <Route path="/quotes" element={<QuoteList />} />
          <Route path="/quotes/:requestId" element={<QuoteDetail />} />
          <Route path="/chat/:quoteId" element={<ChatRoom />} />
          <Route path="/quote-sheet/:quoteId" element={<QuoteSheet />} />
          <Route path="/payment/:paymentId" element={<Payment />} />
          <Route path="/payment-complete/:paymentId" element={<PaymentComplete />} />

          {/* Guest Account Routes */}
          <Route path="/mypage" element={<GuestMyPage />} />
          <Route path="/payments" element={<GuestPayments />} />
          <Route path="/refunds" element={<GuestRefunds />} />
          <Route path="/notifications" element={<GuestNotifications />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* Host Routes */}
          <Route path="/host" element={<HostLanding />} />
          <Route path="/host/login" element={<Auth />} />
          <Route path="/host/signup" element={<Auth />} />
          <Route path="/host/register" element={<HostDashboard />} />
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/requests" element={<HostRequests />} />
          <Route path="/host/requests/:requestId" element={<HostRequestDetail />} />
          <Route path="/host/quotes/create" element={<HostQuoteCreate />} />
          <Route path="/host/quotes/sheet" element={<HostQuoteSheet />} />
          <Route path="/host/quote-templates" element={<HostQuoteTemplates />} />

          {/* Phase 4 - Host Chat & Auto Quote */}
          <Route path="/host/chats" element={<HostChatList />} />
          <Route path="/host/chats/:roomId" element={<HostChatRoom />} />
          <Route path="/host/auto-quote" element={<HostAutoQuote />} />

          {/* Phase 5 - Host Management */}
          <Route path="/host/spaces" element={<HostSpaces />} />
          <Route path="/host/payments" element={<HostPayments />} />
          <Route path="/host/settlements" element={<HostSettlements />} />
          <Route path="/host/wallet" element={<HostWallet />} />
          <Route path="/host/wallet/charge" element={<HostWalletCharge />} />
          <Route path="/host/wallet/auto-charge" element={<HostWalletAutoCharge />} />
          <Route path="/host/notifications" element={<HostNotifications />} />
          <Route path="/host/mypage" element={<HostMyPage />} />
          <Route path="/host/business" element={<HostBusiness />} />

          {/* Phase 6 - Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/quotes" element={<AdminQuotes />} />
          <Route path="/admin/guests" element={<AdminGuests />} />
          <Route path="/admin/hosts" element={<AdminHosts />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/settlements" element={<AdminSettlements />} />
          <Route path="/admin/chats" element={<AdminChats />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/cash" element={<AdminCash />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/refunds" element={<AdminRefunds />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/spaces" element={<AdminSpaces />} />
          <Route path="/admin/business-verification" element={<AdminBusinessVerification />} />
          <Route path="/admin/auto-quotes" element={<AdminAutoQuotes />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
