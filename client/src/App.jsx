import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignupNGO from './pages/SignupNGO';
import SignupSupplier from './pages/SignupSupplier';
import DashboardSupplier from './pages/DashboardSupplier';
import HistorySupplier from './pages/HistorySupplier';
import PostFood from './pages/PostFood';
import ScheduleDonation from './pages/ScheduleDonation';
import ManagePost from './pages/ManagePost';
import SettingsSupplier from './pages/SettingsSupplier';

// NGO Pages
import DashboardNGO from './pages/DashboardNGO';
import ListingsNGO from './pages/ListingsNGO';
import FoodDetailNGO from './pages/FoodDetailNGO';
import SettingsNGO from './pages/SettingsNGO';
import ClaimsNGO from './pages/ClaimsNGO';
import HistoryNGO from './pages/HistoryNGO';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

const AuthRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) return <Navigate to={user.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard'} replace />;
  return children;
};

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={user.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard'} replace />;
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1e293b', color: '#fff', fontSize: '14px', borderRadius: '8px' },
              success: { style: { background: '#059669' } },
              error: { style: { background: '#e11d48' } },
            }} 
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/signup/ngo" element={<AuthRoute><SignupNGO /></AuthRoute>} />
            <Route path="/signup/supplier" element={<AuthRoute><SignupSupplier /></AuthRoute>} />

            {/* Supplier Routes */}
            <Route path="/supplier/dashboard" element={<ProtectedRoute allowedRole="Supplier"><DashboardSupplier /></ProtectedRoute>} />
            <Route path="/supplier/post" element={<ProtectedRoute allowedRole="Supplier"><PostFood /></ProtectedRoute>} />
            <Route path="/supplier/schedule" element={<ProtectedRoute allowedRole="Supplier"><ScheduleDonation /></ProtectedRoute>} />
            <Route path="/supplier/history" element={<ProtectedRoute allowedRole="Supplier"><HistorySupplier /></ProtectedRoute>} />
            <Route path="/supplier/manage/:id" element={<ProtectedRoute allowedRole="Supplier"><ManagePost /></ProtectedRoute>} />
            <Route path="/supplier/settings" element={<ProtectedRoute allowedRole="Supplier"><SettingsSupplier /></ProtectedRoute>} />

            {/* NGO Routes */}
            <Route path="/ngo/dashboard" element={<ProtectedRoute allowedRole="NGO"><DashboardNGO /></ProtectedRoute>} />
            <Route path="/ngo/listings" element={<ProtectedRoute allowedRole="NGO"><ListingsNGO /></ProtectedRoute>} />
            <Route path="/ngo/food/:id" element={<ProtectedRoute allowedRole="NGO"><FoodDetailNGO /></ProtectedRoute>} />
            <Route path="/ngo/settings" element={<ProtectedRoute allowedRole="NGO"><SettingsNGO /></ProtectedRoute>} />
            
            {/* NEW NGO Pages */}
            <Route path="/ngo/claims" element={<ProtectedRoute allowedRole="NGO"><ClaimsNGO /></ProtectedRoute>} />
            <Route path="/ngo/history" element={<ProtectedRoute allowedRole="NGO"><HistoryNGO /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;