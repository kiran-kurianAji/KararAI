import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { User } from './types';
import { getCurrentUser, authAPI, removeAuthToken } from './services/api';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ContractDetails from './pages/ContractDetails';
import JobListings from './pages/JobListings';
import EmployerPortal from './pages/EmployerPortal';

// Import components
import Navbar from './components/Navbar';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = getCurrentUser();
        const token = localStorage.getItem('authToken');
        
        if (storedUser && token) {
          // Verify token is still valid by calling /auth/me
          try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data.data.user);
            setIsAuthenticated(true);
          } catch (authError) {
            // Token is invalid, clear storage
            console.warn('Token validation failed:', authError);
            removeAuthToken();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Authentication functions
  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/home" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register onRegister={handleLogin} /> : <Navigate to="/home" />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/home" 
            element={isAuthenticated ? <Home user={user!} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile user={user!} onUpdateUser={setUser} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/contract/:id" 
            element={isAuthenticated ? <ContractDetails user={user!} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/job-listings" 
            element={isAuthenticated ? <JobListings user={user!} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/active-contracts" 
            element={isAuthenticated ? <Home user={user!} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/employer-portal" 
            element={isAuthenticated ? <EmployerPortal employer={{ 
              id: '1', 
              name: 'Demo Employer', 
              email: 'employer@example.com', 
              phone: '+1234567890',
              company: 'Demo Company',
              businessId: 'GST123456789',
              businessType: 'Technology Services',
              isVerified: true,
              rating: 4.5,
              postedJobs: 5,
              completedProjects: 3,
              createdAt: new Date(),
              updatedAt: new Date(),
              location: { 
                city: 'Demo City', 
                state: 'Demo State',
                pincode: '12345',
                address: '123 Demo Street'
              }
            }} /> : <Navigate to="/login" />} 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;