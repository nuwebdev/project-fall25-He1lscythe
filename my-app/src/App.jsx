import { useRef, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

import Navbar from './components/Navbar.jsx';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import MatchHistory from './components/MatchHistory.jsx';
import UploadPage from './components/UploadPage.jsx';
import SearchPage from './components/SearchPage.jsx';
import GameRecordViewer from './components/GameRecordViewer.jsx';
import UserProfile from './components/UserPofile.jsx';

import AdminRoute from './admin/AdminRoute.jsx';
import AdminUsers from './admin/AdminUsers.jsx';


const HomePage = () => {
  const { user } = useAuth();
  return <UserProfile userId={user.id} username={user.username} />;
};

const UserPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const username = location.state?.username;

  if (!id) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">User not found</div>
      </div>
    );
  }

  return <UserProfile userId={parseInt(id)} username={username} />;
};


const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/users" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// page with navbar
const ProtectedLayout = ({ navHeight, setNavHeight }) => {
  return (
    <ProtectedRoute>
      <>
        <Navbar onHeightChange={setNavHeight} />
        <div style={{ paddingTop: navHeight, width: "100%" }}>
          <Outlet />
        </div>
      </>
    </ProtectedRoute>
  );
};

function App() {
  const [navHeight, setNavHeight] = useState(0);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* with navbar */}
            <Route element={<ProtectedLayout navHeight={navHeight} setNavHeight={setNavHeight} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/user/:id" element={<UserPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/matchhistory" element={<MatchHistory />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/game/:uuid" element={<GameRecordViewer />} />


              <Route path="/admin/users" element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } />
              <Route path="/admin/user/:id/games" element={
                <AdminRoute>
                  <MatchHistory />
                </AdminRoute>
              } />
            </Route>

            {/* without navbar */}
            <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
            } />
            <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
            } />

            <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                    <a href="/" className="text-blue-500 hover:underline">Go back home</a>
                  </div>
                </div>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
