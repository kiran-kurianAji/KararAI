import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Star, ExternalLink } from 'lucide-react';
import type { User, SuggestedJob } from '../types';

interface JobListingsProps {
  user: User;
}

const JobListings = ({ user }: JobListingsProps) => {
  const [suggestedJobs, setSuggestedJobs] = useState<SuggestedJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<SuggestedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock suggested jobs with more variety
      const mockSuggestedJobs: SuggestedJob[] = [
        {
          id: 'sj1',
          title: 'Electrical Wiring - Residential',
          description: 'Complete electrical wiring for new 2BHK apartment',
          employer: {
            name: 'Sharma Builders',
            rating: 4.3
          },
          payment: {
            rateType: 'fixed',
            rate: 18000
          },
          location: {
            city: 'Bangalore',
            distance: 5.2
          },
          matchScore: 92,
          requiredSkills: ['Electrical', 'Wiring'],
          duration: '1 week',
          postedAt: new Date('2024-01-20'),
          urgency: 'medium'
        },
        {
          id: 'sj2',
          title: 'Kitchen Renovation',
          description: 'Complete kitchen renovation including cabinets and flooring',
          employer: {
            name: 'HomeStyle Interiors',
            rating: 4.6
          },
          payment: {
            rateType: 'fixed',
            rate: 45000
          },
          location: {
            city: 'Bangalore',
            distance: 8.1
          },
          matchScore: 88,
          requiredSkills: ['Carpentry', 'Flooring', 'Interior'],
          duration: '2 weeks',
          postedAt: new Date('2024-01-19'),
          urgency: 'high'
        },
        {
          id: 'sj3',
          title: 'Plumbing Installation',
          description: 'Install new plumbing system for commercial building',
          employer: {
            name: 'Metro Construction',
            rating: 4.1
          },
          payment: {
            rateType: 'daily',
            rate: 800
          },
          location: {
            city: 'Bangalore',
            distance: 12.3
          },
          matchScore: 75,
          requiredSkills: ['Plumbing', 'Pipe Fitting'],
          duration: '10 days',
          postedAt: new Date('2024-01-18'),
          urgency: 'low'
        },
        {
          id: 'sj4',
          title: 'Bathroom Tiling Work',
          description: 'Tile installation for luxury bathroom renovation project',
          employer: {
            name: 'Elite Interiors',
            rating: 4.8
          },
          payment: {
            rateType: 'fixed',
            rate: 22000
          },
          location: {
            city: 'Bangalore',
            distance: 6.7
          },
          matchScore: 85,
          requiredSkills: ['Tiling', 'Flooring'],
          duration: '1 week',
          postedAt: new Date('2024-01-17'),
          urgency: 'medium'
        },
        {
          id: 'sj5',
          title: 'Furniture Assembly & Installation',
          description: 'Assemble and install custom furniture for office spaces',
          employer: {
            name: 'Office Solutions Ltd',
            rating: 4.4
          },
          payment: {
            rateType: 'hourly',
            rate: 350
          },
          location: {
            city: 'Bangalore',
            distance: 4.5
          },
          matchScore: 90,
          requiredSkills: ['Carpentry', 'Furniture Assembly'],
          duration: '3 days',
          postedAt: new Date('2024-01-16'),
          urgency: 'high'
        }
      ];

      setSuggestedJobs(mockSuggestedJobs);
      setFilteredJobs(mockSuggestedJobs);
      setIsLoading(false);
    };

    loadJobs();
  }, []);

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = suggestedJobs;

    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.requiredSkills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedSkill !== 'all') {
      filtered = filtered.filter(job => 
        job.requiredSkills.some(skill => skill.toLowerCase().includes(selectedSkill.toLowerCase()))
      );
    }

    if (selectedUrgency !== 'all') {
      filtered = filtered.filter(job => job.urgency === selectedUrgency);
    }

    // Sort by match score by default
    filtered.sort((a, b) => b.matchScore - a.matchScore);

    setFilteredJobs(filtered);
  }, [searchQuery, selectedSkill, selectedUrgency, suggestedJobs]);

  const handleApplyToJob = (jobId: string) => {
    console.log('Applying to job:', jobId);
    // Implementation for applying to job
  };

  const uniqueSkills = Array.from(new Set(suggestedJobs.flatMap(job => job.requiredSkills)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Job Listings</h1>
              <p className="text-slate-600 mt-1">
                {filteredJobs.length} opportunities matching your skills
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Welcome back,</p>
              <p className="font-semibold text-slate-800">{user.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs by title, description, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
              >
                <option value="all">All Skills</option>
                {uniqueSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>

              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-800"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {job.title}
                  </h3>
                  <div className="flex items-center text-sm text-slate-600 mb-2">
                    <span className="font-medium">{job.employer.name}</span>
                    <div className="flex items-center ml-2">
                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      <span>{job.employer.rating}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  job.urgency === 'high' ? 'bg-red-100 text-red-700' :
                  job.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {job.urgency} priority
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {job.description}
              </p>

              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center text-slate-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{job.location.distance}km away</span>
                </div>
                <div className="flex items-center text-slate-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{job.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-green-600">
                  ₹{job.payment.rate.toLocaleString()} {job.payment.rateType}
                </span>
                <span className="text-sm text-red-600 font-medium">
                  {job.matchScore}% match
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApplyToJob(job.id)}
                  className="flex-1 bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
                >
                  Apply Now
                </button>
                <button
                  className="flex items-center justify-center w-10 h-10 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  title="View Details"
                >
                  <ExternalLink className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-3 text-center">
                Posted {Math.floor((new Date().getTime() - job.postedAt.getTime()) / (1000 * 60 * 60 * 24))} days ago
              </p>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No jobs found</h3>
            <p className="text-slate-600">
              Try adjusting your search criteria or filters to find more opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListings;