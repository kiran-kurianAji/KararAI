import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, IndianRupee, User, Star, FileText, Download, Plus, Calendar } from 'lucide-react';
import type { Contract, User as UserType, WorkLog, DigitalLedger } from '../types';

interface ContractDetailsProps {
  user: UserType;
}

const ContractDetails = ({ user }: ContractDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [ledger, setLedger] = useState<DigitalLedger | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'work-log' | 'payments'>('details');
  const [newHours, setNewHours] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [isAddingWork, setIsAddingWork] = useState(false);

  useEffect(() => {
    const loadContractDetails = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock contract data
      const mockContract: Contract = {
        id: id || '1',
        title: 'House Construction - Phase 2',
        description: 'Complete the second phase of residential construction including brick laying, basic electrical work, and interior preparation. This project involves working on a 2-story residential building with modern architecture.',
        employer: {
          id: 'emp1',
          name: 'Rajesh Kumar',
          company: 'Kumar Constructions',
          contactInfo: '+91 9876543210',
          rating: 4.5
        },
        workDetails: {
          location: {
            address: 'Plot 45, Whitefield Extension, Near Phoenix Marketcity',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560066'
          },
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-02-15'),
          duration: '1 month',
          workingHours: '8 AM - 5 PM'
        },
        payment: {
          rateType: 'daily',
          rate: 800,
          currency: 'INR',
          paymentTerms: 'Weekly payment every Friday. Overtime rates: 1.5x after 8 hours.'
        },
        requirements: {
          skills: ['Masonry', 'Basic Electrical', 'Construction'],
          experience: 2,
          tools: ['Hand tools provided', 'Safety equipment mandatory']
        },
        status: 'in-progress',
        acceptedBy: user.id,
        contractReceiptId: 'receipt_001',
        fairnessScore: 8.5,
        isMinimumWageCompliant: true,
        applicantsCount: 1,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15')
      };

      // Mock digital ledger
      const mockLedger: DigitalLedger = {
        id: 'ledger_1',
        workerId: user.id,
        contractId: id || '1',
        totalHoursWorked: 72,
        totalDaysWorked: 9,
        totalAmountDue: 7200,
        totalAmountReceived: 3200,
        totalAmountPending: 4000,
        workLogs: [
          {
            id: 'log_1',
            contractId: id || '1',
            workerId: user.id,
            date: new Date('2024-01-15'),
            hoursWorked: 8,
            description: 'Started foundation work and material preparation',
            status: 'approved',
            approvedBy: 'emp1',
            approvedAt: new Date('2024-01-16'),
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-16')
          },
          {
            id: 'log_2',
            contractId: id || '1',
            workerId: user.id,
            date: new Date('2024-01-16'),
            hoursWorked: 8,
            description: 'Continued foundation work and brick laying preparation',
            status: 'approved',
            approvedBy: 'emp1',
            approvedAt: new Date('2024-01-17'),
            createdAt: new Date('2024-01-16'),
            updatedAt: new Date('2024-01-17')
          },
          {
            id: 'log_3',
            contractId: id || '1',
            workerId: user.id,
            date: new Date('2024-01-17'),
            hoursWorked: 8,
            description: 'Brick laying for ground floor walls',
            status: 'pending',
            createdAt: new Date('2024-01-17'),
            updatedAt: new Date('2024-01-17')
          }
        ],
        paymentRecords: [
          {
            id: 'payment_1',
            contractId: id || '1',
            workerId: user.id,
            employerId: 'emp1',
            amount: 3200,
            currency: 'INR',
            paymentType: 'milestone',
            status: 'completed',
            paymentMethod: 'upi',
            transactionId: 'TXN123456789',
            dueDate: new Date('2024-01-19'),
            paidDate: new Date('2024-01-19'),
            notes: 'Payment for first 4 days of work',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-19')
          },
          {
            id: 'payment_2',
            contractId: id || '1',
            workerId: user.id,
            employerId: 'emp1',
            amount: 4000,
            currency: 'INR',
            paymentType: 'milestone',
            status: 'pending',
            paymentMethod: 'bank_transfer',
            dueDate: new Date('2024-01-26'),
            notes: 'Payment for days 5-9',
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date('2024-01-20')
          }
        ],
        lastUpdated: new Date()
      };

      setContract(mockContract);
      setLedger(mockLedger);
      setIsLoading(false);
    };

    if (id) {
      loadContractDetails();
    }
  }, [id, user.id]);

  const handleAddWorkLog = async () => {
    if (!newHours || !workDescription.trim()) return;

    setIsAddingWork(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newWorkLog: WorkLog = {
      id: `log_${Date.now()}`,
      contractId: contract!.id,
      workerId: user.id,
      date: new Date(),
      hoursWorked: parseFloat(newHours),
      description: workDescription.trim(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setLedger(prev => ({
      ...prev!,
      workLogs: [...prev!.workLogs, newWorkLog],
      totalHoursWorked: prev!.totalHoursWorked + parseFloat(newHours),
      totalDaysWorked: prev!.totalDaysWorked + (parseFloat(newHours) >= 4 ? 1 : 0),
      totalAmountDue: prev!.totalAmountDue + (contract!.payment.rate * parseFloat(newHours) / 8),
      totalAmountPending: prev!.totalAmountPending + (contract!.payment.rate * parseFloat(newHours) / 8),
      lastUpdated: new Date()
    }));

    setNewHours('');
    setWorkDescription('');
    setIsAddingWork(false);
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF
    alert('Contract receipt download functionality would be implemented here');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contract || !ledger) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Contract not found</h2>
          <button
            onClick={() => navigate('/home')}
            className="text-blue-600 hover:text-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{contract.title}</h1>
              <p className="text-sm text-gray-600">{contract.employer.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-lg font-semibold text-gray-900">{ledger.totalHoursWorked}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Days Worked</p>
                <p className="text-lg font-semibold text-gray-900">{ledger.totalDaysWorked}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <IndianRupee className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Amount Due</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(ledger.totalAmountDue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <IndianRupee className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pending Payment</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(ledger.totalAmountPending)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'details', name: 'Contract Details', icon: FileText },
                { id: 'work-log', name: 'Work Log', icon: Clock },
                { id: 'payments', name: 'Payments', icon: IndianRupee }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Contract Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="mt-1 text-sm text-gray-900">{contract.description}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className="mt-1 inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {contract.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <p className="mt-1 text-sm text-gray-900">{contract.workDetails.duration}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Working Hours</label>
                        <p className="mt-1 text-sm text-gray-900">{contract.workDetails.workingHours}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(contract.workDetails.startDate)}</p>
                      </div>

                      {contract.workDetails.endDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">End Date</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(contract.workDetails.endDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Employer & Location */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Employer & Location</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Employer</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{contract.employer.name}</span>
                          {contract.employer.company && (
                            <span className="text-sm text-gray-600">• {contract.employer.company}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rating</label>
                        <div className="mt-1 flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-900">{contract.employer.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact</label>
                        <p className="mt-1 text-sm text-gray-900">{contract.employer.contactInfo}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Work Location</label>
                        <div className="mt-1 flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="text-sm text-gray-900">
                            <p>{contract.workDetails.location.address}</p>
                            <p>{contract.workDetails.location.city}, {contract.workDetails.location.state} - {contract.workDetails.location.pincode}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Payment Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rate</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatCurrency(contract.payment.rate)} per {contract.payment.rateType}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                        <p className="mt-1 text-sm text-gray-900">{contract.payment.paymentTerms}</p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Skills Required</label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {contract.requirements.skills.map(skill => (
                            <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Minimum Experience</label>
                        <p className="mt-1 text-sm text-gray-900">{contract.requirements.experience} years</p>
                      </div>

                      {contract.requirements.tools && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tools & Equipment</label>
                          <ul className="mt-1 text-sm text-gray-900">
                            {contract.requirements.tools.map((tool, index) => (
                              <li key={index}>• {tool}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 pt-4 border-t">
                  <button
                    onClick={handleDownloadReceipt}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Contract Receipt
                  </button>
                </div>
              </div>
            )}

            {/* Work Log Tab */}
            {activeTab === 'work-log' && (
              <div className="space-y-6">
                
                {/* Add Work Log */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Today's Work</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        value={newHours}
                        onChange={(e) => setNewHours(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="8"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Description</label>
                      <input
                        type="text"
                        value={workDescription}
                        onChange={(e) => setWorkDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe what you worked on today..."
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddWorkLog}
                    disabled={!newHours || !workDescription.trim() || isAddingWork}
                    className="mt-4 flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAddingWork ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Work Log
                  </button>
                </div>

                {/* Work Log History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Work History</h3>
                  <div className="space-y-3">
                    {ledger.workLogs.map((log) => (
                      <div key={log.id} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {formatDate(log.date)}
                              </span>
                              <span className="text-sm text-gray-600">
                                • {log.hoursWorked} hours
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                log.status === 'approved' 
                                  ? 'bg-green-100 text-green-800'
                                  : log.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {log.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{log.description}</p>
                            {log.approvedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Approved on {formatDate(log.approvedAt)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency((contract.payment.rate / 8) * log.hoursWorked)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                
                {/* Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800">Amount Received</h4>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(ledger.totalAmountReceived)}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-800">Amount Pending</h4>
                    <p className="text-xl font-bold text-yellow-900">{formatCurrency(ledger.totalAmountPending)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800">Total Due</h4>
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(ledger.totalAmountDue)}</p>
                  </div>
                </div>

                {/* Payment History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                  <div className="space-y-3">
                    {ledger.paymentRecords.map((payment) => (
                      <div key={payment.id} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(payment.amount)}
                              </span>
                              <span className="text-sm text-gray-600">
                                • {payment.paymentType}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                payment.status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{payment.notes}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Due: {formatDate(payment.dueDate)}</span>
                              {payment.paidDate && (
                                <span>Paid: {formatDate(payment.paidDate)}</span>
                              )}
                              <span>Method: {payment.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                              {payment.transactionId && (
                                <span>TXN: {payment.transactionId}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;