import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-semibold text-white">스페이스매치</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI 기반 공간 매칭 플랫폼<br />
              원하는 공간을 자연어로 검색하고<br />
              맞춤 견적을 받아보세요
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-white mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  공간 찾기
                </Link>
              </li>
              <li>
                <Link to="/host" className="hover:text-white transition-colors">
                  호스트 가입
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  이용가이드
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-4">고객센터</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  1:1 문의
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  공지사항
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-500">
              <span className="mr-4">이용약관</span>
              <span className="mr-4">개인정보처리방침</span>
              <span>사업자정보확인</span>
            </div>
            <div className="text-sm">
              © 2024 SpaceMatch. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
