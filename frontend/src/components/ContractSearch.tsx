import { useState } from 'react';
import { Search, Filter, MapPin, IndianRupee, Clock } from 'lucide-react';
import type { Contract, ContractFilters, User } from '../types';
import { EXPERTISE_AREAS, INDIAN_STATES } from '../types';

interface ContractSearchProps {
  onSearch: (results: Contract[]) => void;
  user: User;
}

const ContractSearch = ({ onSearch, user }: ContractSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ContractFilters>({
    location: {
      maxDistance: 25
    },
    payment: {
      minRate: user.preferences.minimumWage
    },
    skills: user.areaOfExpertise
  });
  const [isSearching, setIsSearching] = useState(false);

  // Mock contract data for search results
  const mockContracts: Contract[] = [
    {
      id: 'search_1',
      title: 'Kitchen Renovation - Modular Cabinets',
      description: 'Complete kitchen renovation including modular cabinet installation, countertop fitting, and electrical work for switches and lighting.',
      employer: {
        id: 'emp_search_1',
        name: 'Anjali Reddy',
        company: 'Reddy Interiors',
        contactInfo: '+91 9876543210',
        rating: 4.7
      },
      workDetails: {
        location: {
          address: 'Villa 12, Prestige Lakeside Habitat',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560103'
        },
        startDate: new Date('2024-02-05'),
        endDate: new Date('2024-02-20'),
        duration: '15 days',
        workingHours: '9 AM - 6 PM'
      },
      payment: {
        rateType: 'fixed',
        rate: 45000,
        currency: 'INR',
        paymentTerms: '30% advance, 40% at 50% completion, 30% on final completion'
      },
      requirements: {
        skills: ['Carpentry', 'Furniture Making'],
        experience: 3,
        tools: ['Basic tools provided, specialized tools available']
      },
      status: 'available',
      fairnessScore: 9.1,
      isMinimumWageCompliant: true,
      applicantsCount: 2,
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-01-22')
    },
    {
      id: 'search_2',
      title: 'Residential Plumbing - New Construction',
      description: 'Complete plumbing installation for a new 2-story residential building including water supply lines, drainage, and bathroom fixtures.',
      employer: {
        id: 'emp_search_2',
        name: 'Kumar Construction Co.',
        contactInfo: '+91 9123456789',
        rating: 4.3
      },
      workDetails: {
        location: {
          address: 'Plot 67, Electronic City Phase 2',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560100'
        },
        startDate: new Date('2024-01-30'),
        duration: '3 weeks',
        workingHours: '8 AM - 5 PM'
      },
      payment: {
        rateType: 'daily',
        rate: 700,
        currency: 'INR',
        paymentTerms: 'Weekly payment every Saturday'
      },
      requirements: {
        skills: ['Plumbing', 'Pipe Fitting'],
        experience: 2,
        tools: ['All tools and materials provided']
      },
      status: 'available',
      fairnessScore: 8.3,
      isMinimumWageCompliant: true,
      applicantsCount: 7,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-21')
    },
    {
      id: 'search_3',
      title: 'Electrical Work - Office Complex',
      description: 'Electrical wiring and fixture installation for a new office complex including LED lighting, power outlets, and safety systems.',
      employer: {
        id: 'emp_search_3',
        name: 'Metro Developers',
        company: 'Metro Real Estate Pvt Ltd',
        contactInfo: '+91 9988776655',
        rating: 4.1
      },
      workDetails: {
        location: {
          address: 'Commercial Complex, Outer Ring Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560037'
        },
        startDate: new Date('2024-02-10'),
        duration: '1 month',
        workingHours: '9 AM - 6 PM'
      },
      payment: {
        rateType: 'daily',
        rate: 800,
        currency: 'INR',
        paymentTerms: 'Bi-weekly payment'
      },
      requirements: {
        skills: ['Electrical', 'Wiring'],
        experience: 4,
        tools: ['Specialized tools provided, basic tools required']
      },
      status: 'available',
      fairnessScore: 8.7,
      isMinimumWageCompliant: true,
      applicantsCount: 4,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-19')
    }
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simulate API search delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Filter contracts based on search query and filters
    let results = mockContracts;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(contract => 
        contract.title.toLowerCase().includes(query) ||
        contract.description.toLowerCase().includes(query) ||
        contract.employer.name.toLowerCase().includes(query) ||
        contract.requirements.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (filters.location?.city) {
      results = results.filter(contract => 
        contract.workDetails.location.city.toLowerCase().includes(filters.location!.city!.toLowerCase())
      );
    }

    if (filters.location?.state) {
      results = results.filter(contract => 
        contract.workDetails.location.state === filters.location!.state
      );
    }

    // Payment filter
    if (filters.payment?.minRate) {
      results = results.filter(contract => {
        // Convert all rates to daily equivalent for comparison
        let dailyRate = contract.payment.rate;
        switch (contract.payment.rateType) {
          case 'hourly':
            dailyRate = contract.payment.rate * 8; // Assume 8 hour workday
            break;
          case 'weekly':
            dailyRate = contract.payment.rate / 7;
            break;
          case 'monthly':
            dailyRate = contract.payment.rate / 30;
            break;
          case 'fixed':
            // For fixed contracts, estimate daily rate based on duration
            const durationMatch = contract.workDetails.duration.match(/(\d+)/);
            const days = durationMatch ? parseInt(durationMatch[1]) : 30;
            dailyRate = contract.payment.rate / days;
            break;
        }
        return dailyRate >= filters.payment!.minRate!;
      });
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(contract => 
        filters.skills!.some(skill => 
          contract.requirements.skills.includes(skill)
        )
      );
    }

    setIsSearching(false);
    onSearch(results);
  };

  const handleFilterChange = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ContractFilters] as any,
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleSkillToggle = (skill: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      skills: checked 
        ? [...(prev.skills || []), skill]
        : (prev.skills || []).filter(s => s !== skill)
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: {
        maxDistance: 25
      },
      payment: {
        minRate: user.preferences.minimumWage
      },
      skills: user.areaOfExpertise
    });
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for jobs, skills, or companies..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 text-sm border rounded-md transition-colors ${
            showFilters 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>

        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          </div>

          {/* Location Filters */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              Location
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">State</label>
                <select
                  value={filters.location?.state || ''}
                  onChange={(e) => handleFilterChange('location.state', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any state</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">City</label>
                <input
                  type="text"
                  value={filters.location?.city || ''}
                  onChange={(e) => handleFilterChange('location.city', e.target.value)}
                  placeholder="Any city"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-xs text-gray-600 mb-1">
                Max Distance: {filters.location?.maxDistance || 25} km
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={filters.location?.maxDistance || 25}
                onChange={(e) => handleFilterChange('location.maxDistance', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Payment Filters */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
              <IndianRupee className="w-3 h-3 mr-1" />
              Payment
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min Daily Rate (₹)</label>
                <input
                  type="number"
                  value={filters.payment?.minRate || ''}
                  onChange={(e) => handleFilterChange('payment.minRate', parseInt(e.target.value) || 0)}
                  placeholder="300"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Rate Type</label>
                <select
                  value={filters.payment?.rateType || ''}
                  onChange={(e) => handleFilterChange('payment.rateType', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Any type</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills Filter */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Skills Required
            </h4>
            <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
              {EXPERTISE_AREAS.map(skill => (
                <label key={skill} className="flex items-center space-x-1 text-xs">
                  <input
                    type="checkbox"
                    checked={filters.skills?.includes(skill) || false}
                    onChange={(e) => handleSkillToggle(skill, e.target.checked)}
                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="truncate">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">Duration</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min Duration (days)</label>
                <input
                  type="number"
                  value={filters.duration?.minDuration || ''}
                  onChange={(e) => handleFilterChange('duration.minDuration', parseInt(e.target.value) || 0)}
                  placeholder="1"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max Duration (days)</label>
                <input
                  type="number"
                  value={filters.duration?.maxDuration || ''}
                  onChange={(e) => handleFilterChange('duration.maxDuration', parseInt(e.target.value) || 0)}
                  placeholder="365"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractSearch;