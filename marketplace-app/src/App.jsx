import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Auctions from './pages/Auctions';
import SellAgent from './pages/SellAgent';
import AgentDetails from './pages/AgentDetails';
import AuctionDetails from './pages/AuctionDetails';
import Identity from './pages/Identity';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import Landing from './pages/Landing';
import Footer from './components/Footer';
import { WalletProvider } from './context/WalletContext';
import { useEffect } from 'react';
import './App.css'

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Content = () => {
  const location = useLocation();
  const isWelcomePage = location.pathname === '/welcome';

  return (
    <div className="app-layout">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/welcome" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auction/:id" element={<AuctionDetails />} />
          <Route path="/sell" element={<SellAgent />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/agent/:id" element={<AgentDetails />} />
          <Route path="/identity" element={<Identity />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isWelcomePage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <WalletProvider>
      <Router>
        <ScrollToTop />
        <Content />
      </Router>
    </WalletProvider>
  )
}

export default App
