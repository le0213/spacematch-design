import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

// Pages
import GuestHome from './pages/GuestHome'
import RequestSummary from './pages/RequestSummary'
import HostLanding from './pages/HostLanding'
import ChatRoom from './pages/ChatRoom'
import Auth from './pages/Auth'
import MatchingWait from './pages/MatchingWait'
import MyRequests from './pages/MyRequests'

// Phase 2 Pages
import QuoteList from './pages/QuoteList'
import QuoteDetail from './pages/QuoteDetail'
import Payment from './pages/Payment'
import PaymentComplete from './pages/PaymentComplete'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Guest Routes */}
          <Route path="/" element={<GuestHome />} />
          <Route path="/request-summary" element={<RequestSummary />} />
          <Route path="/matching-wait" element={<MatchingWait />} />
          <Route path="/my-requests" element={<MyRequests />} />

          {/* Phase 2 - Quote & Payment Routes */}
          <Route path="/quotes" element={<QuoteList />} />
          <Route path="/quotes/:requestId" element={<QuoteDetail />} />
          <Route path="/chat/:quoteId" element={<ChatRoom />} />
          <Route path="/payment/:paymentId" element={<Payment />} />
          <Route path="/payment-complete/:paymentId" element={<PaymentComplete />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* Host Routes */}
          <Route path="/host" element={<HostLanding />} />
          <Route path="/host/login" element={<Auth />} />
          <Route path="/host/signup" element={<Auth />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
