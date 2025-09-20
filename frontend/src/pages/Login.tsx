import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import type { User, LoginCredentials, FormError } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [formData, setFormData] = useState<LoginCredentials>({
    phoneOrEmail: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors for this field
    setErrors(prev => prev.filter(error => error.field !== name));
  };

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];

    if (!formData.phoneOrEmail.trim()) {
      newErrors.push({ field: 'phoneOrEmail', message: 'Phone number or email is required' });
    }

    if (!formData.password) {
      newErrors.push({ field: 'password', message: 'Password is required' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Mock authentication - in real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        phone: '+91 9876543210',
        email: 'john@example.com',
        digitalId: 'AADHAAR-123456789012',
        areaOfExpertise: ['Construction', 'Carpentry'],
        location: {
          state: 'Karnataka',
          city: 'Bangalore',
          pincode: '560001'
        },
        preferences: {
          maxTravelDistance: 25,
          preferredWorkingHours: ['Morning (6 AM - 12 PM)', 'Afternoon (12 PM - 6 PM)'],
          minimumWage: 500
        },
        experience: {
          yearsOfExperience: 5,
          previousJobs: ['House Construction', 'Furniture Making'],
          skills: ['Carpentry', 'Masonry', 'Electrical basics']
        },
        isVerified: true,
        rating: 4.5,
        completedJobs: 23,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      onLogin(mockUser);
    } catch (error) {
      setErrors([{ field: 'general', message: 'Login failed. Please try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 bg-red-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">KW</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-800">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-red-700 hover:text-red-600"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* General Error */}
          {getFieldError('general') && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{getFieldError('general')}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Phone or Email */}
            <div>
              <label htmlFor="phoneOrEmail" className="block text-sm font-medium text-slate-700">
                Phone Number or Email
              </label>
              <input
                id="phoneOrEmail"
                name="phoneOrEmail"
                type="text"
                autoComplete="username"
                value={formData.phoneOrEmail}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  getFieldError('phoneOrEmail') ? 'border-red-300' : 'border-slate-300'
                } placeholder-slate-500 text-slate-800 rounded-md focus:outline-none focus:ring-red-700 focus:border-red-700 focus:z-10 sm:text-sm`}
                placeholder="Enter your phone number or email"
              />
              {getFieldError('phoneOrEmail') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('phoneOrEmail')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    getFieldError('password') ? 'border-red-300' : 'border-slate-300'
                  } placeholder-slate-500 text-slate-800 rounded-md focus:outline-none focus:ring-red-700 focus:border-red-700 focus:z-10 sm:text-sm`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
              )}
            </div>
          </div>

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-red-700 focus:ring-red-700 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-800">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-red-700 hover:text-red-600">
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </div>
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
            <p className="text-xs text-blue-700">
              <strong>Phone/Email:</strong> demo@example.com<br />
              <strong>Password:</strong> password123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;