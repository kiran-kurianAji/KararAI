import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';
import type { User, RegistrationData, FormError } from '../types';
import { EXPERTISE_AREAS, INDIAN_STATES, WORKING_HOURS } from '../types';

interface RegisterProps {
  onRegister: (user: User) => void;
}

const Register = ({ onRegister }: RegisterProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    digitalId: '',
    areaOfExpertise: [],
    location: {
      state: '',
      city: '',
      pincode: ''
    },
    preferences: {
      maxTravelDistance: 10,
      preferredWorkingHours: [],
      minimumWage: 300
    },
    experience: {
      yearsOfExperience: 0,
      previousJobs: [],
      skills: []
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof RegistrationData] as any,
          [child]: type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
    
    // Clear errors for this field
    setErrors(prev => prev.filter(error => error.field !== name));
  };

  const handleMultiSelect = (name: string, value: string, checked: boolean) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const currentArray = (prev[parent as keyof RegistrationData] as any)[child] || [];
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof RegistrationData] as any,
            [child]: checked 
              ? [...currentArray, value]
              : currentArray.filter((item: string) => item !== value)
          }
        };
      });
    } else {
      setFormData(prev => {
        const currentArray = prev[name as keyof RegistrationData] as string[] || [];
        return {
          ...prev,
          [name]: checked 
            ? [...currentArray, value]
            : currentArray.filter(item => item !== value)
        };
      });
    }
  };

  const handleArrayInput = (name: string, value: string) => {
    if (value.trim()) {
      const items = value.split(',').map(item => item.trim()).filter(item => item);
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof RegistrationData] as any,
            [child]: items
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: items
        }));
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormError[] = [];

    switch (step) {
      case 1: // Basic Information
        if (!formData.name.trim()) {
          newErrors.push({ field: 'name', message: 'Name is required' });
        }
        if (!formData.phone && !formData.email) {
          newErrors.push({ field: 'contact', message: 'Either phone number or email is required' });
        }
        if (formData.phone && !/^[+]?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
          newErrors.push({ field: 'phone', message: 'Please enter a valid phone number' });
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.push({ field: 'email', message: 'Please enter a valid email address' });
        }
        if (!formData.password) {
          newErrors.push({ field: 'password', message: 'Password is required' });
        } else if (formData.password.length < 6) {
          newErrors.push({ field: 'password', message: 'Password must be at least 6 characters' });
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
        }
        if (!formData.digitalId.trim()) {
          newErrors.push({ field: 'digitalId', message: 'Digital ID (Aadhaar/PAN) is required' });
        }
        break;

      case 2: // Professional Information
        if (formData.areaOfExpertise.length === 0) {
          newErrors.push({ field: 'areaOfExpertise', message: 'Please select at least one area of expertise' });
        }
        if (!formData.location.state) {
          newErrors.push({ field: 'location.state', message: 'State is required' });
        }
        if (!formData.location.city.trim()) {
          newErrors.push({ field: 'location.city', message: 'City is required' });
        }
        if (!formData.location.pincode.trim()) {
          newErrors.push({ field: 'location.pincode', message: 'Pincode is required' });
        } else if (!/^\d{6}$/.test(formData.location.pincode)) {
          newErrors.push({ field: 'location.pincode', message: 'Please enter a valid 6-digit pincode' });
        }
        break;

      case 3: // Preferences and Experience
        if (formData.preferences.preferredWorkingHours.length === 0) {
          newErrors.push({ field: 'preferences.preferredWorkingHours', message: 'Please select at least one working hour preference' });
        }
        if (formData.preferences.minimumWage < 100) {
          newErrors.push({ field: 'preferences.minimumWage', message: 'Minimum wage should be at least ₹100' });
        }
        break;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // Mock registration - in real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock successful registration
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        digitalId: formData.digitalId,
        areaOfExpertise: formData.areaOfExpertise,
        location: formData.location,
        preferences: formData.preferences,
        experience: formData.experience,
        isVerified: false, // New users need verification
        rating: 0,
        completedJobs: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      onRegister(newUser);
    } catch (error) {
      setErrors([{ field: 'general', message: 'Registration failed. Please try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`w-24 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>Basic Info</span>
        <span>Professional</span>
        <span>Preferences</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
      
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            getFieldError('name') ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          placeholder="Enter your full name"
        />
        {getFieldError('name') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            getFieldError('phone') || getFieldError('contact') ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          placeholder="+91 9876543210"
        />
        {getFieldError('phone') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            getFieldError('email') || getFieldError('contact') ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          placeholder="your.email@example.com"
        />
        {getFieldError('email') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
        )}
        {getFieldError('contact') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('contact')}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password *
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 pr-10 border ${
              getFieldError('password') ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Enter password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {getFieldError('password') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password *
        </label>
        <div className="mt-1 relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 pr-10 border ${
              getFieldError('confirmPassword') ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Confirm password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {getFieldError('confirmPassword') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('confirmPassword')}</p>
        )}
      </div>

      {/* Digital ID */}
      <div>
        <label htmlFor="digitalId" className="block text-sm font-medium text-gray-700">
          Digital ID (Aadhaar/PAN/Driving License) *
        </label>
        <input
          id="digitalId"
          name="digitalId"
          type="text"
          value={formData.digitalId}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            getFieldError('digitalId') ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          placeholder="Enter your Aadhaar, PAN, or DL number"
        />
        {getFieldError('digitalId') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('digitalId')}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          This will be used for verification purposes and kept secure.
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
      
      {/* Area of Expertise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Area of Expertise * (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
          {EXPERTISE_AREAS.map((area) => (
            <label key={area} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.areaOfExpertise.includes(area)}
                onChange={(e) => handleMultiSelect('areaOfExpertise', area, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span>{area}</span>
            </label>
          ))}
        </div>
        {getFieldError('areaOfExpertise') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('areaOfExpertise')}</p>
        )}
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">
            State *
          </label>
          <select
            id="location.state"
            name="location.state"
            value={formData.location.state}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              getFieldError('location.state') ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {getFieldError('location.state') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('location.state')}</p>
          )}
        </div>

        <div>
          <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            id="location.city"
            name="location.city"
            type="text"
            value={formData.location.city}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              getFieldError('location.city') ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="City name"
          />
          {getFieldError('location.city') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('location.city')}</p>
          )}
        </div>

        <div>
          <label htmlFor="location.pincode" className="block text-sm font-medium text-gray-700">
            Pincode *
          </label>
          <input
            id="location.pincode"
            name="location.pincode"
            type="text"
            value={formData.location.pincode}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              getFieldError('location.pincode') ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="123456"
            maxLength={6}
          />
          {getFieldError('location.pincode') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('location.pincode')}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences & Experience</h3>
      
      {/* Working Hours Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Working Hours * (Select all that apply)
        </label>
        <div className="space-y-2">
          {WORKING_HOURS.map((hours) => (
            <label key={hours} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.preferences.preferredWorkingHours.includes(hours)}
                onChange={(e) => handleMultiSelect('preferences.preferredWorkingHours', hours, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span>{hours}</span>
            </label>
          ))}
        </div>
        {getFieldError('preferences.preferredWorkingHours') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('preferences.preferredWorkingHours')}</p>
        )}
      </div>

      {/* Travel Distance */}
      <div>
        <label htmlFor="preferences.maxTravelDistance" className="block text-sm font-medium text-gray-700">
          Maximum Travel Distance (km)
        </label>
        <input
          id="preferences.maxTravelDistance"
          name="preferences.maxTravelDistance"
          type="number"
          min="1"
          max="100"
          value={formData.preferences.maxTravelDistance}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Minimum Wage */}
      <div>
        <label htmlFor="preferences.minimumWage" className="block text-sm font-medium text-gray-700">
          Minimum Daily Wage (₹) *
        </label>
        <input
          id="preferences.minimumWage"
          name="preferences.minimumWage"
          type="number"
          min="100"
          value={formData.preferences.minimumWage}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            getFieldError('preferences.minimumWage') ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
        />
        {getFieldError('preferences.minimumWage') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('preferences.minimumWage')}</p>
        )}
      </div>

      {/* Years of Experience */}
      <div>
        <label htmlFor="experience.yearsOfExperience" className="block text-sm font-medium text-gray-700">
          Years of Experience
        </label>
        <select
          id="experience.yearsOfExperience"
          name="experience.yearsOfExperience"
          value={formData.experience.yearsOfExperience}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value={0}>Fresher (No experience)</option>
          <option value={1}>1 year</option>
          <option value={2}>2 years</option>
          <option value={3}>3 years</option>
          <option value={4}>4 years</option>
          <option value={5}>5+ years</option>
          <option value={10}>10+ years</option>
          <option value={15}>15+ years</option>
        </select>
      </div>

      {/* Previous Jobs */}
      <div>
        <label htmlFor="previousJobs" className="block text-sm font-medium text-gray-700">
          Previous Jobs (Optional)
        </label>
        <textarea
          id="previousJobs"
          placeholder="List your previous jobs, separated by commas"
          onChange={(e) => handleArrayInput('experience.previousJobs', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          rows={3}
        />
        <p className="mt-1 text-xs text-gray-500">
          Example: House construction, Furniture making, Electrical work
        </p>
      </div>

      {/* Skills */}
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
          Additional Skills (Optional)
        </label>
        <textarea
          id="skills"
          placeholder="List your skills, separated by commas"
          onChange={(e) => handleArrayInput('experience.skills', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          rows={3}
        />
        <p className="mt-1 text-xs text-gray-500">
          Example: Team leadership, Tool maintenance, Quality control
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">KW</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* General Error */}
          {getFieldError('general') && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-600">{getFieldError('general')}</p>
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  currentStep === 1 ? 'invisible' : ''
                }`}
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;