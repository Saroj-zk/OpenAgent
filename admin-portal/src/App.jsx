import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PortalLogin from './portal/PortalLogin';
import PortalDashboard from './portal/PortalDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/portal/login" />} />
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal/dashboard" element={<PortalDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
