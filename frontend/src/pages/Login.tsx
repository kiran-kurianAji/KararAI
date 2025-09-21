import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import type { User, LoginCredentials, FormError } from '../types';
import { authAPI, setAuthToken, setCurrentUser } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const { t } = useLanguage();
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
      newErrors.push({ field: 'phoneOrEmail', message: t('auth.phoneEmailRequired') });
    }

    if (!formData.password) {
      newErrors.push({ field: 'password', message: t('auth.passwordRequired') });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Call the backend API
      const response = await authAPI.login({
        phone_or_email: formData.phoneOrEmail,
        password: formData.password
      });

      const { access_token, user, user_type } = response.data;

      // Store token and user data
      setAuthToken(access_token);
      setCurrentUser({ ...user, user_type });

      // Call the parent component's onLogin function
      onLogin(user);
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid phone/email or password.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setErrors([{ field: 'general', message: errorMessage }]);
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
            {t('auth.signInToAccount')}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            {t('auth.or')}{' '}
            <Link
              to="/register"
              className="font-medium text-red-700 hover:text-red-600"
            >
              {t('auth.createNewAccount')}
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
                {t('auth.phoneOrEmail')}
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
                placeholder={t('auth.phoneEmailPlaceholder')}
              />
              {getFieldError('phoneOrEmail') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('phoneOrEmail')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                {t('auth.password')}
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
                  placeholder={t('auth.passwordPlaceholder')}
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
                {t('auth.rememberMe')}
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-red-700 hover:text-red-600">
                {t('auth.forgotPassword')}
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
                  {t('auth.signingIn')}
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('auth.signIn')}
                </div>
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">{t('auth.demoAccount')}</h4>
            <p className="text-xs text-blue-700 mb-3">
              <strong>{t('auth.email')}:</strong> demo@example.com<br />
              <strong>{t('auth.password')}:</strong> password123
            </p>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  phoneOrEmail: 'demo@example.com',
                  password: 'password123'
                });
              }}
              className="w-full px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('auth.useDemoAccount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;