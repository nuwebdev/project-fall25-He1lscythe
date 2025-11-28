import { useRef, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import * as d3 from 'd3';
import './App.css'
import NavbarTest, {HomePageTest} from './test/NavbarTest.jsx';

import Navbar from './components/Navbar.jsx';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import RankingPieChart from './components/PieChart.jsx';
import RankingTrendChart from './components/Trending.jsx';
import DataGrid from './components/DataGrid.jsx';
import MatchHistory from './components/MatchHistory.jsx';
import UploadPage from './components/UploadPage.jsx'


const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="w-full bg-gray-100 pt-4">
      <h1 className="items-center font-bold mb-4">Ⓒ {user?.username || 'Player'}</h1>
      <div className="flex py-2">
        <div className="w-3/5 flex flex-col">
          <div className=""><RankingTrendChart gCount={20} /></div>
          <div><DataGrid /></div>
        </div>
        <div className="w-2/5"><RankingPieChart /></div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  return (
    <div className="w-full bg-gradient-to-br from-purple-100 to-pink-100 pt-4">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">pending</h1>
        <p className="text-gray-600">x</p>
      </div>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
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
  let userName = 'YuuNecro';
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* with navbar */}
            <Route element={<ProtectedLayout navHeight={navHeight} setNavHeight={setNavHeight} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/matchhistory" element={<MatchHistory usrName={userName}/>} />
              <Route path="/search" element={<SearchPage />} />
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
