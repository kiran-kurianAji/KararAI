import { useState } from 'react';
import { User, MapPin, Briefcase, Edit, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { User as UserType, FormError } from '../types';
import { EXPERTISE_AREAS, INDIAN_STATES, WORKING_HOURS } from '../types';

interface ProfileProps {
  user: UserType;
  onUpdateUser: (user: UserType) => void;
}

const Profile = ({ user, onUpdateUser }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserType>(user);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedUser(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserType] as any,
          [child]: type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setEditedUser(prev => ({
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
      setEditedUser(prev => {
        const currentArray = (prev[parent as keyof UserType] as any)[child] || [];
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof UserType] as any,
            [child]: checked 
              ? [...currentArray, value]
              : currentArray.filter((item: string) => item !== value)
          }
        };
      });
    } else {
      setEditedUser(prev => {
        const currentArray = prev[name as keyof UserType] as string[] || [];
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
        setEditedUser(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof UserType] as any,
            [child]: items
          }
        }));
      } else {
        setEditedUser(prev => ({
          ...prev,
          [name]: items
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];

    if (!editedUser.name.trim()) {
      newErrors.push({ field: 'name', message: 'Name is required' });
    }

    if (!editedUser.phone && !editedUser.email) {
      newErrors.push({ field: 'contact', message: 'Either phone number or email is required' });
    }

    if (editedUser.phone && !/^[+]?[1-9]\d{1,14}$/.test(editedUser.phone.replace(/\s/g, ''))) {
      newErrors.push({ field: 'phone', message: 'Please enter a valid phone number' });
    }

    if (editedUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email)) {
      newErrors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    if (editedUser.areaOfExpertise.length === 0) {
      newErrors.push({ field: 'areaOfExpertise', message: 'Please select at least one area of expertise' });
    }

    if (!editedUser.location.state) {
      newErrors.push({ field: 'location.state', message: 'State is required' });
    }

    if (!editedUser.location.city.trim()) {
      newErrors.push({ field: 'location.city', message: 'City is required' });
    }

    if (!editedUser.location.pincode.trim()) {
      newErrors.push({ field: 'location.pincode', message: 'Pincode is required' });
    } else if (!/^\d{6}$/.test(editedUser.location.pincode)) {
      newErrors.push({ field: 'location.pincode', message: 'Please enter a valid 6-digit pincode' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsUpdating(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedUser = {
        ...editedUser,
        updatedAt: new Date()
      };

      onUpdateUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      setErrors([{ field: 'general', message: 'Failed to update profile. Please try again.' }]);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setErrors([]);
    setIsEditing(false);
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span>{user.completedJobs} jobs completed</span>
                    </div>
                    <div className={`flex items-center text-sm ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {user.isVerified ? (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-1" />
                      )}
                      <span>{user.isVerified ? 'Verified' : 'Verification Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isUpdating}
                      className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* General Error */}
        {getFieldError('general') && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{getFieldError('general')}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedUser.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      getFieldError('name') ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                ) : (
                  <p className="text-gray-900">{user.name}</p>
                )}
                {getFieldError('name') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editedUser.phone || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      getFieldError('phone') || getFieldError('contact') ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                ) : (
                  <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                )}
                {getFieldError('phone') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editedUser.email || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      getFieldError('email') || getFieldError('contact') ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                ) : (
                  <p className="text-gray-900">{user.email || 'Not provided'}</p>
                )}
                {getFieldError('email') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                )}
                {getFieldError('contact') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('contact')}</p>
                )}
              </div>

              {/* Digital ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Digital ID</label>
                <p className="text-gray-900">{user.digitalId}</p>
                <p className="text-xs text-gray-500 mt-1">Contact support to update your digital ID</p>
              </div>

              {/* Account Created */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                {isEditing ? (
                  <select
                    name="location.state"
                    value={editedUser.location.state}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      getFieldError('location.state') ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{user.location.state}</p>
                )}
                {getFieldError('location.state') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('location.state')}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location.city"
                    value={editedUser.location.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      getFieldError('location.city') ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                ) : (
                  <p className="text-gray-900">{user.location.city}</p>
                )}
                {getFieldError('location.city') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('location.city')}</p>
                )}
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location.pincode"
                    value={editedUser.location.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className={`w-full px-3 py-2 border ${
                      getFieldError('location.pincode') ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                ) : (
                  <p className="text-gray-900">{user.location.pincode}</p>
                )}
                {getFieldError('location.pincode') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('location.pincode')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Professional Information
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              
              {/* Area of Expertise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area of Expertise</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {EXPERTISE_AREAS.map(area => (
                      <label key={area} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editedUser.areaOfExpertise.includes(area)}
                          onChange={(e) => handleMultiSelect('areaOfExpertise', area, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.areaOfExpertise.map(area => (
                      <span key={area} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>
                )}
                {getFieldError('areaOfExpertise') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('areaOfExpertise')}</p>
                )}
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                {isEditing ? (
                  <select
                    name="experience.yearsOfExperience"
                    value={editedUser.experience.yearsOfExperience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                ) : (
                  <p className="text-gray-900">
                    {user.experience.yearsOfExperience === 0 ? 'Fresher' : `${user.experience.yearsOfExperience} years`}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Skills</label>
                {isEditing ? (
                  <textarea
                    placeholder="List your skills, separated by commas"
                    onChange={(e) => handleArrayInput('experience.skills', e.target.value)}
                    defaultValue={editedUser.experience.skills.join(', ')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.experience.skills.length > 0 ? (
                      user.experience.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No additional skills listed</p>
                    )}
                  </div>
                )}
              </div>

              {/* Previous Jobs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Jobs</label>
                {isEditing ? (
                  <textarea
                    placeholder="List your previous jobs, separated by commas"
                    onChange={(e) => handleArrayInput('experience.previousJobs', e.target.value)}
                    defaultValue={editedUser.experience.previousJobs.join(', ')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                ) : (
                  <div className="space-y-1">
                    {user.experience.previousJobs.length > 0 ? (
                      user.experience.previousJobs.map((job, index) => (
                        <p key={index} className="text-gray-900 text-sm">• {job}</p>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No previous jobs listed</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Work Preferences</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              
              {/* Preferred Working Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Working Hours</label>
                {isEditing ? (
                  <div className="space-y-2">
                    {WORKING_HOURS.map(hours => (
                      <label key={hours} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editedUser.preferences.preferredWorkingHours.includes(hours)}
                          onChange={(e) => handleMultiSelect('preferences.preferredWorkingHours', hours, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span>{hours}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {user.preferences.preferredWorkingHours.map(hours => (
                      <p key={hours} className="text-gray-900 text-sm">• {hours}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Max Travel Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Travel Distance</label>
                {isEditing ? (
                  <div>
                    <input
                      type="range"
                      name="preferences.maxTravelDistance"
                      min="1"
                      max="100"
                      value={editedUser.preferences.maxTravelDistance}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 km</span>
                      <span>{editedUser.preferences.maxTravelDistance} km</span>
                      <span>100 km</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-900">{user.preferences.maxTravelDistance} km</p>
                )}
              </div>

              {/* Minimum Wage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Daily Wage</label>
                {isEditing ? (
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="number"
                      name="preferences.minimumWage"
                      min="100"
                      value={editedUser.preferences.minimumWage}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900">₹{user.preferences.minimumWage.toLocaleString('en-IN')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;