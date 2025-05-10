import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Recipe from './pages/Recipe/Recipe';
import Login from './pages/Login/Login';
import MyPage from './pages/MyPage/MyPage';
import ProfileEdit from './pages/ProfileEdit/ProfileEdit';
import OAuthCallback from './components/OAuthCallback/OAuthCallback';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    alert('로그인이 필요한 페이지입니다.');
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipe" element={<Recipe />} />
            <Route path="/login" element={<Login />} />
            
            {/* OAuth 콜백 처리 경로 */}
            <Route path="/oauth/:provider/callback" element={<OAuthCallback />} />
            
            <Route
              path="/mypage"
              element={
                <ProtectedRoute>
                  <MyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mypage/favorites"
              element={
                <ProtectedRoute>
                  <MyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mypage/uploads"
              element={
                <ProtectedRoute>
                  <MyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mypage/profile"
              element={
                <ProtectedRoute>
                  <ProfileEdit />
                </ProtectedRoute>
              }
            />
            {/* 모든 경로를 처리하지 못한 경우 홈으로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;