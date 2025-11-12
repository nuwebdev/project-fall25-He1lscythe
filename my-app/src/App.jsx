import { useRef, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import * as d3 from 'd3';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css'
import NavbarTest, {HomePageTest} from './test/NavbarTest.jsx';
import Navbar from './components/Navbar.jsx';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import rec from './components/Gamedata.js';
import RankingPieChart from './components/PieChart.jsx';
import RankingTrendChart from './components/Trending.jsx';
import DataGrid from './components/DataGrid.jsx';
import MatchHistoryComp from './components/MatchHistory.jsx';


const HomePage = () => {
  return (
    <div className="w-full bg-gray-100 pt-4">
      <h1 className="items-center font-bold mb-4">Ⓒ YuuNecro</h1>
      <div className="flex py-2">
        <div className="w-3/5 flex flex-col">
          <div className=""><RankingTrendChart gCount={20} /></div>
          <div><DataGrid /></div>
        </div>
        <div className="w-2/5"><RankingPieChart /></div>
      </div>
      <div>
        
      </div>
      <div className="p-4 flex flex-wrap gap-2">
          {/* <p className="p-4 rounded-lg bg-indigo-300">Column 1</p>
          <p className="p-4 rounded-lg bg-indigo-300">Column 2</p>
          <p className="p-4 rounded-lg bg-indigo-300">Column 3</p>
          <p className="p-4 rounded-lg bg-indigo-300">Column 4</p>
          <p className="p-4 rounded-lg bg-indigo-300">Column 5</p>
          <p className="p-4 rounded-lg bg-indigo-300">Column 6</p> */}
      </div>
    </div>
  );
};

const UploadPage = () => {
  return (
    <div className="w-full bg-gradient-to-br from-purple-100 to-pink-100 pt-4">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">pending</h1>
        <p className="text-gray-600">x</p>
      </div>
    </div>
  );
};

const MatchHistory = () => {
  return (
    <div className="w-full bg-gradient-to-br from-purple-100 to-pink-100 pt-4">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Match History</h1>
      </div>
        <MatchHistoryComp />
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

// page with navbar
const Home = ({ navHeight, setNavHeight }) => {
  return (
    <>
      <Navbar onHeightChange={setNavHeight} />
      <div style={{ paddingTop: navHeight, width: "100%" }}>
        <Outlet />
      </div>
    </>
  );
}

function App() {
  const [navHeight, setNavHeight] = useState(0);
  
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* with navbar */}
          <Route element={<Home navHeight={navHeight} setNavHeight={setNavHeight} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/matchhistory" element={<MatchHistory />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>

          {/* without navbar */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
