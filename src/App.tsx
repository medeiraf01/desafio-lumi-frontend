import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FaturasPage from './pages/FaturasPage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { Box } from '@mui/material';


export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <Navbar />
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Navigate to="/dashboard" />
                </Box>
              </Box>
            } />
            <Route path="/dashboard" element={
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
                <Navbar />
                <Box sx={{ flexGrow: 1, overflow: 'auto', width: '100%' }}>
                  <DashboardPage />
                </Box>
              </Box>
            } />
            <Route path="/faturas" element={
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
                <Navbar />
                <Box sx={{ flexGrow: 1, overflow: 'auto', width: '100%' }}>
                  <FaturasPage />
                </Box>
              </Box>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
