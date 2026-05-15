import './App.css'
import './styles/Auth.css'
import './styles/Dashboard.css'
import './styles/Landing.css'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import ToastContainer from './components/Toast'

// Protected Route Component
function ProtectedRoute({ element }) {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div>
      <ToastContainer />
      {!isAuthPage && !isDashboard && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/shorten" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        </Routes>
      </main>
    </div>
  )
}


