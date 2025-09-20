import { useState, useEffect } from 'react';
import { 
  Plus, Eye, Users, FileText, Download, Award, Star
} from 'lucide-react';
import type { Employer, JobPost, ContractApplication, ContractDocument } from '../types';

interface EmployerPortalProps {
  employer: Employer;
}

const EmployerPortal = ({ employer }: EmployerPortalProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'post-job' | 'applications' | 'contracts'>('dashboard');
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<ContractApplication[]>([]);
  const [contracts] = useState<ContractDocument[]>([]); // Static for now, managed within ContractsContent
  const [isLoading, setIsLoading] = useState(true);

  // Load employer data
  useEffect(() => {
    const loadEmployerData = async () => {
      setIsLoading(true);
      
      // Mock data loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock job posts
      const mockJobPosts: JobPost[] = [
        {
          id: 'jp1',
          employerId: employer.id,
          title: 'Residential Construction - Phase 3',
          description: 'Complete the third phase of residential construction including roofing and plumbing work.',
          category: 'Construction',
          workDetails: {
            location: {
              address: 'Plot 67, Whitefield',
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560066'
            },
            startDate: new Date('2024-10-01'),
            endDate: new Date('2024-11-15'),
            duration: '6 weeks',
            workingHours: '8 AM - 5 PM',
            urgency: 'medium'
          },
          payment: {
            rateType: 'monthly',
            rate: 40000,
            currency: 'INR',
            paymentTerms: 'Bi-weekly payments',
            negotiable: true
          },
          requirements: {
            skills: ['Roofing', 'Plumbing', 'Masonry'],
            experience: 3,
            tools: ['Basic tools provided'],
            certifications: ['Construction Safety']
          },
          status: 'published',
          applications: [],
          createdAt: new Date('2024-09-15'),
          updatedAt: new Date('2024-09-15')
        }
      ];

      // Note: Applications are now handled within ApplicationsContent component
      const mockApplications: ContractApplication[] = [];

      setJobPosts(mockJobPosts);
      setApplications(mockApplications);
      setIsLoading(false);
    };

    loadEmployerData();
  }, [employer.id]);

  // Note: Application and contract functions are now handled within individual components

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employer portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Employer Portal</h1>
              <p className="text-slate-600">
                Welcome back, {employer.name} {employer.company && `(${employer.company})`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">Rating</p>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-semibold text-slate-800">{employer.rating}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Projects Completed</p>
                <p className="font-semibold text-slate-800">{employer.completedProjects}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Eye },
              { id: 'post-job', label: 'Post Job', icon: Plus },
              { id: 'applications', label: 'Applications', icon: Users },
              { id: 'contracts', label: 'Contracts', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-700 text-red-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardContent 
            employer={employer} 
            jobPosts={jobPosts} 
            applications={applications}
            contracts={contracts}
          />
        )}
        
        {activeTab === 'post-job' && (
          <PostJobContent 
            employer={employer}
            onJobPosted={(job) => setJobPosts(prev => [...prev, job])}
          />
        )}
        
        {activeTab === 'applications' && (
          <ApplicationsContent />
        )}
        
        {activeTab === 'contracts' && (
          <ContractsContent />
        )}
      </div>
    </div>
  );
};

// Dashboard Component
const DashboardContent = ({ 
  employer, 
  jobPosts, 
  applications, 
  contracts 
}: { 
  employer: Employer;
  jobPosts: JobPost[];
  applications: ContractApplication[];
  contracts: ContractDocument[];
}) => {
  const activeJobs = jobPosts.filter(job => job.status === 'published').length;
  const pendingApplications = applications.filter(app => app.status === 'applied').length;
  const activeContracts = contracts.filter(contract => contract.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Active Jobs</p>
              <p className="text-2xl font-bold text-slate-900">{activeJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Pending Applications</p>
              <p className="text-2xl font-bold text-slate-900">{pendingApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Active Contracts</p>
              <p className="text-2xl font-bold text-slate-900">{activeContracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Award className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Rating</p>
              <p className="text-2xl font-bold text-slate-900">{employer.rating}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {applications.slice(0, 3).map((application) => (
              <div key={application.id} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-800">
                    <span className="font-medium">{application.workerName}</span> applied for a job
                  </p>
                  <p className="text-xs text-slate-500">
                    {application.appliedAt.toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  application.status === 'applied' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {application.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components - I'll implement these next
const PostJobContent = ({ employer, onJobPosted }: { 
  employer: Employer; 
  onJobPosted: (job: JobPost) => void;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    startDate: '',
    endDate: '',
    duration: '',
    workingHours: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    rateType: 'fixed' as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'fixed',
    rate: '',
    paymentTerms: '',
    negotiable: false,
    skills: '',
    experience: '',
    tools: '',
    certifications: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJob: JobPost = {
      id: `jp_${Date.now()}`,
      employerId: employer.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      workDetails: {
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        duration: formData.duration,
        workingHours: formData.workingHours,
        urgency: formData.urgency
      },
      payment: {
        rateType: formData.rateType,
        rate: parseFloat(formData.rate),
        currency: 'INR',
        paymentTerms: formData.paymentTerms,
        negotiable: formData.negotiable
      },
      requirements: {
        skills: formData.skills.split(',').map(s => s.trim()),
        experience: parseInt(formData.experience),
        tools: formData.tools ? formData.tools.split(',').map(s => s.trim()) : [],
        certifications: formData.certifications ? formData.certifications.split(',').map(s => s.trim()) : []
      },
      status: 'published',
      applications: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onJobPosted(newJob);
    
    // Reset form
    setFormData({
      title: '', description: '', category: '', address: '', city: '', state: '', pincode: '',
      startDate: '', endDate: '', duration: '', workingHours: '', urgency: 'medium',
      rateType: 'fixed', rate: '', paymentTerms: '', negotiable: false,
      skills: '', experience: '', tools: '', certifications: ''
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Post New Job</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
              placeholder="e.g. House Construction Worker"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
            >
              <option value="">Select category</option>
              <option value="Construction">Construction</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Painting">Painting</option>
              <option value="Landscaping">Landscaping</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
            placeholder="Describe the work requirements, expectations, and any specific details..."
          />
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800">Work Location</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="Full work site address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="State"
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800">Work Timeline</h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="e.g. 2 weeks, 1 month"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Working Hours</label>
              <input
                type="text"
                required
                value={formData.workingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, workingHours: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="e.g. 9 AM - 6 PM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800">Payment Details</h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rate Type</label>
              <select
                value={formData.rateType}
                onChange={(e) => setFormData(prev => ({ ...prev, rateType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="fixed">Fixed Project</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rate (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.rate}
                onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="Amount"
              />
            </div>
            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={formData.negotiable}
                  onChange={(e) => setFormData(prev => ({ ...prev, negotiable: e.target.checked }))}
                  className="h-4 w-4 text-red-700 focus:ring-red-700 border-slate-300 rounded"
                />
              </div>
              <label className="ml-2 text-sm text-slate-700">Negotiable</label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Terms</label>
            <input
              type="text"
              required
              value={formData.paymentTerms}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
              placeholder="e.g. 50% advance, 50% on completion"
            />
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800">Requirements</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Required Skills</label>
              <input
                type="text"
                required
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="e.g. Masonry, Carpentry, Electrical (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Experience (years)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="Years of experience"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tools Required (Optional)</label>
              <input
                type="text"
                value={formData.tools}
                onChange={(e) => setFormData(prev => ({ ...prev, tools: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="e.g. Basic tools, Power tools (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Certifications (Optional)</label>
              <input
                type="text"
                value={formData.certifications}
                onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="e.g. Safety certification (comma separated)"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center px-6 py-3 bg-red-700 text-white font-medium rounded-md hover:bg-red-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Job
          </button>
        </div>
      </form>
    </div>
  );
};

const ApplicationsContent: React.FC = () => {
  // Mock application data with wage negotiation messages
  const applications: ContractApplication[] = [
    {
      id: '1',
      jobId: '1',
      workerId: '1',
      workerName: 'John Smith',
      status: 'applied',
      appliedAt: new Date('2024-01-15'),
      message: 'I have 5 years of experience in React development. Would you consider $35/hour instead of $30?',
      proposedWage: 35,
      originalWage: 30,
      workerProfile: {
        experience: '5 years',
        skills: ['React', 'TypeScript', 'Node.js'],
        rating: 4.8,
        completedJobs: 23
      }
    },
    {
      id: '2',
      jobId: '1',
      workerId: '2',
      workerName: 'Sarah Johnson',
      status: 'applied',
      appliedAt: new Date('2024-01-14'),
      message: 'I can start immediately and have worked on similar e-commerce projects. Open to the posted rate.',
      proposedWage: 30,
      originalWage: 30,
      workerProfile: {
        experience: '3 years',
        skills: ['React', 'JavaScript', 'CSS'],
        rating: 4.6,
        completedJobs: 15
      }
    },
    {
      id: '3',
      jobId: '2',
      workerId: '3',
      workerName: 'Mike Davis',
      status: 'applied',
      appliedAt: new Date('2024-01-13'),
      message: 'I have extensive backend experience with Node.js and MongoDB. Would $40/hour work for this project?',
      proposedWage: 40,
      originalWage: 35,
      workerProfile: {
        experience: '7 years',
        skills: ['Node.js', 'MongoDB', 'Express', 'TypeScript'],
        rating: 4.9,
        completedJobs: 31
      }
    }
  ]

  const handleAcceptApplication = (applicationId: string) => {
    console.log('Accepting application:', applicationId)
    const application = applications.find(app => app.id === applicationId)
    if (application) {
      // Generate contract from application
      const newContract: ContractDocument = {
        id: Date.now().toString(),
        jobId: application.jobId,
        employerId: '1', // Current employer
        workerId: application.workerId,
        workerName: application.workerName,
        jobTitle: `Contract for ${application.workerName}`, // Would be derived from job post
        terms: {
          hourlyRate: application.proposedWage || application.originalWage,
          totalHours: 160, // Default, would be from job post
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          description: 'Work as agreed in job application', // Would be from job post
          paymentTerms: 'Weekly payments every Friday',
          cancellationPolicy: '7 days notice required for cancellation'
        },
        status: 'pending_signatures',
        employerSigned: false,
        workerSigned: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      alert(`Contract generated for ${application.workerName}! Check the Contracts tab to review and sign.`)
      
      // In a real app, this would be saved to the backend
      console.log('Generated contract:', newContract)
    }
  }

  const handleRejectApplication = (applicationId: string) => {
    console.log('Rejecting application:', applicationId)
  }

  const handleCounterOffer = (applicationId: string, newWage: number) => {
    console.log('Counter offer for application:', applicationId, 'New wage:', newWage)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Job Applications</h2>
        <div className="text-sm text-slate-600">
          {applications.length} applications received
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-slate-100 rounded-lg p-8 text-center">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No applications yet. Your job posts will appear here when workers apply.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 font-semibold">
                      {application.workerName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{application.workerName}</h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Award className="w-4 h-4" />
                      <span>{application.workerProfile.rating}/5 ⭐</span>
                      <span>•</span>
                      <span>{application.workerProfile.completedJobs} jobs completed</span>
                      <span>•</span>
                      <span>{application.workerProfile.experience}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  Applied {application.appliedAt.toLocaleDateString()}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {application.workerProfile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Application Message */}
              <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">Message from applicant:</h4>
                <p className="text-slate-700">{application.message}</p>
              </div>

              {/* Wage Information */}
              <div className="mb-4 p-4 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-600">Original Rate: </span>
                    <span className="font-medium">${application.originalWage}/hour</span>
                  </div>
                  {application.proposedWage !== application.originalWage && (
                    <div>
                      <span className="text-slate-600">Proposed Rate: </span>
                      <span className="font-medium text-red-600">${application.proposedWage}/hour</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAcceptApplication(application.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Accept Application
                </button>
                <button
                  onClick={() => handleRejectApplication(application.id)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Decline
                </button>
                {application.proposedWage !== application.originalWage && (
                  <button
                    onClick={() => handleCounterOffer(application.id, application.originalWage)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Counter Offer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ContractsContent: React.FC = () => {
  // Mock contract data
  const contracts: ContractDocument[] = [
    {
      id: '1',
      jobId: '1',
      employerId: '1',
      workerId: '1',
      workerName: 'John Smith',
      jobTitle: 'React Developer',
      terms: {
        hourlyRate: 35,
        totalHours: 160,
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-02-20'),
        description: 'Develop e-commerce website using React and TypeScript',
        paymentTerms: 'Weekly payments every Friday',
        cancellationPolicy: '7 days notice required for cancellation'
      },
      status: 'pending_signatures',
      employerSigned: true,
      employerSignedAt: new Date('2024-01-18'),
      workerSigned: false,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: '2',
      jobId: '2',
      employerId: '1',
      workerId: '2',
      workerName: 'Sarah Johnson',
      jobTitle: 'Frontend Developer',
      terms: {
        hourlyRate: 30,
        totalHours: 120,
        startDate: new Date('2024-01-25'),
        endDate: new Date('2024-02-15'),
        description: 'Build responsive web components for marketing website',
        paymentTerms: 'Bi-weekly payments',
        cancellationPolicy: '5 days notice required for cancellation'
      },
      status: 'active',
      employerSigned: true,
      employerSignedAt: new Date('2024-01-16'),
      workerSigned: true,
      workerSignedAt: new Date('2024-01-17'),
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-17')
    }
  ]

  const handleDownloadPDF = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId)
    if (!contract) return

    // Create HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contract - ${contract.jobTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333; }
          .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .term-item { margin-bottom: 10px; }
          .term-label { font-weight: bold; }
          .signatures { margin-top: 50px; }
          .signature-box { border: 1px solid #ccc; padding: 15px; margin: 20px 0; }
          .signature-line { border-bottom: 1px solid #333; width: 300px; height: 30px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">EMPLOYMENT CONTRACT</div>
          <div>Contract ID: ${contract.id}</div>
          <div>Generated on: ${contract.createdAt.toLocaleDateString()}</div>
        </div>

        <div class="section">
          <div class="section-title">Parties</div>
          <p><strong>Employer:</strong> [Employer Name]</p>
          <p><strong>Worker:</strong> ${contract.workerName}</p>
        </div>

        <div class="section">
          <div class="section-title">Job Details</div>
          <p><strong>Position:</strong> ${contract.jobTitle}</p>
          <p><strong>Description:</strong> ${contract.terms.description}</p>
        </div>

        <div class="section">
          <div class="section-title">Terms and Conditions</div>
          <div class="terms-grid">
            <div class="term-item">
              <div class="term-label">Hourly Rate:</div>
              <div>$${contract.terms.hourlyRate}/hour</div>
            </div>
            <div class="term-item">
              <div class="term-label">Total Hours:</div>
              <div>${contract.terms.totalHours} hours</div>
            </div>
            <div class="term-item">
              <div class="term-label">Start Date:</div>
              <div>${contract.terms.startDate.toLocaleDateString()}</div>
            </div>
            <div class="term-item">
              <div class="term-label">End Date:</div>
              <div>${contract.terms.endDate.toLocaleDateString()}</div>
            </div>
            <div class="term-item">
              <div class="term-label">Payment Terms:</div>
              <div>${contract.terms.paymentTerms}</div>
            </div>
            <div class="term-item">
              <div class="term-label">Cancellation Policy:</div>
              <div>${contract.terms.cancellationPolicy}</div>
            </div>
          </div>
        </div>

        <div class="signatures">
          <div class="section-title">Signatures</div>
          
          <div class="signature-box">
            <p><strong>Employer Signature:</strong></p>
            <div class="signature-line"></div>
            <p>Date: ${contract.employerSigned ? contract.employerSignedAt?.toLocaleDateString() : '________________'}</p>
            ${contract.employerSigned ? '<p>✓ Signed electronically</p>' : '<p>Status: Pending signature</p>'}
          </div>

          <div class="signature-box">
            <p><strong>Worker Signature:</strong></p>
            <div class="signature-line"></div>
            <p>Date: ${contract.workerSigned ? contract.workerSignedAt?.toLocaleDateString() : '________________'}</p>
            ${contract.workerSigned ? '<p>✓ Signed electronically</p>' : '<p>Status: Pending signature</p>'}
          </div>
        </div>

        <div class="section" style="margin-top: 50px; font-size: 12px; color: #666;">
          <p>This contract was generated electronically on ${new Date().toLocaleDateString()} using the KararAI platform.</p>
        </div>
      </body>
      </html>
    `

    // Create and download the PDF
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `contract-${contract.jobTitle.replace(/\s+/g, '-').toLowerCase()}-${contract.id}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Note: In a real application, you would use a proper PDF generation library
    // like jsPDF, puppeteer, or send this to a backend service for PDF conversion
    alert('Contract downloaded as HTML file. You can print this as PDF from your browser.')
  }

  const handleViewContract = (contractId: string) => {
    console.log('Viewing contract:', contractId)
    // This would open a modal or navigate to contract details
  }

  const getStatusBadge = (contract: ContractDocument) => {
    switch (contract.status) {
      case 'pending_signatures':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending Signatures</span>
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Completed</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancelled</span>
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded-full">Unknown</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Contracts</h2>
        <div className="text-sm text-slate-600">
          {contracts.length} contracts
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-slate-100 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No contracts yet. Contracts will appear here when you accept job applications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">{contract.jobTitle}</h3>
                  <p className="text-slate-600">with {contract.workerName}</p>
                  <div className="mt-2">
                    {getStatusBadge(contract)}
                  </div>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <div>Created: {contract.createdAt.toLocaleDateString()}</div>
                  <div>Updated: {contract.updatedAt.toLocaleDateString()}</div>
                </div>
              </div>

              {/* Contract Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-slate-600 text-sm">Rate:</span>
                  <div className="font-medium">${contract.terms.hourlyRate}/hour</div>
                </div>
                <div>
                  <span className="text-slate-600 text-sm">Total Hours:</span>
                  <div className="font-medium">{contract.terms.totalHours} hours</div>
                </div>
                <div>
                  <span className="text-slate-600 text-sm">Start Date:</span>
                  <div className="font-medium">{contract.terms.startDate.toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-slate-600 text-sm">End Date:</span>
                  <div className="font-medium">{contract.terms.endDate.toLocaleDateString()}</div>
                </div>
              </div>

              {/* Signature Status */}
              <div className="mb-4 p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">Signature Status</h4>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${contract.employerSigned ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <span className="text-sm text-slate-600">
                      Employer {contract.employerSigned ? 'Signed' : 'Pending'}
                      {contract.employerSignedAt && ` (${contract.employerSignedAt.toLocaleDateString()})`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${contract.workerSigned ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <span className="text-sm text-slate-600">
                      Worker {contract.workerSigned ? 'Signed' : 'Pending'}
                      {contract.workerSignedAt && ` (${contract.workerSignedAt.toLocaleDateString()})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleViewContract(contract.id)}
                  className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Contract
                </button>
                <button
                  onClick={() => handleDownloadPDF(contract.id)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmployerPortal;