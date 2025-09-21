import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import type { User, Contract } from '../types';
import ContractList from '../components/ContractList';
import ChatBot from '../components/ChatBot';
import { useLanguage } from '../hooks/useLanguage';

interface HomeProps {
  user: User;
}

const Home = ({ user }: HomeProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentContracts, setCurrentContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data loading
  useEffect(() => {
    const loadContracts = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock current contracts (accepted jobs)
      const mockCurrentContracts: Contract[] = [
        {
          id: '1',
          title: 'House Construction - Phase 2',
          description: 'Complete the second phase of residential construction including brick laying and basic electrical work.',
          employer: {
            id: 'emp1',
            name: 'Rajesh Kumar',
            company: 'Kumar Constructions',
            contactInfo: '+91 9876543210',
            rating: 4.5
          },
          workDetails: {
            location: {
              address: 'Plot 45, Whitefield',
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560066'
            },
            startDate: new Date('2024-09-10'), // Started 11 days ago
            endDate: new Date('2024-10-10'), // 30-day project
            duration: '1 month',
            workingHours: '8 AM - 5 PM'
          },
          payment: {
            rateType: 'monthly',
            rate: 35000,
            currency: 'INR',
            paymentTerms: 'Weekly payments'
          },
          requirements: {
            skills: ['Masonry', 'Basic Electrical'],
            experience: 2,
            tools: ['Basic tools provided']
          },
          status: 'in-progress',
          acceptedBy: user.id,
          contractReceiptId: 'CR-2024-001-KW',
          fairnessScore: 8.5,
          isMinimumWageCompliant: true,
          applicantsCount: 12,
          workTracking: {
            totalHoursWorked: 88, // 11 days × 8 hours/day
            daysWorked: 11,
            estimatedTotalHours: 240 // 30 days × 8 hours/day
          },
          paymentTracking: {
            totalDue: 35000, // Monthly rate
            totalReceived: 12000, // Received partial payments
            pendingAmount: 23000,
            lastPaymentDate: new Date('2024-09-15')
          },
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          title: 'Office Furniture Assembly',
          description: 'Assemble and install modular office furniture for new corporate office.',
          employer: {
            id: 'emp2',
            name: 'TechCorp Solutions',
            company: 'TechCorp Pvt Ltd',
            contactInfo: '+91 9887766554',
            rating: 4.8
          },
          workDetails: {
            location: {
              address: 'Electronic City, Phase 1',
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560100'
            },
            startDate: new Date('2024-09-18'), // Started 3 days ago
            endDate: new Date('2024-09-25'), // 7-day project
            duration: '1 week',
            workingHours: '9 AM - 6 PM'
          },
          payment: {
            rateType: 'fixed',
            rate: 25000,
            currency: 'INR',
            paymentTerms: '50% advance, 50% on completion'
          },
          requirements: {
            skills: ['Carpentry', 'Furniture Assembly'],
            experience: 1,
            tools: ['Tools provided']
          },
          status: 'in-progress',
          acceptedBy: user.id,
          contractReceiptId: 'CR-2024-002-KW',
          fairnessScore: 9.2,
          isMinimumWageCompliant: true,
          applicantsCount: 8,
          workTracking: {
            totalHoursWorked: 27, // 3 days × 9 hours/day
            daysWorked: 3,
            estimatedTotalHours: 63 // 7 days × 9 hours/day
          },
          paymentTracking: {
            totalDue: 25000, // Fixed project rate
            totalReceived: 12500, // 50% advance
            pendingAmount: 12500,
            lastPaymentDate: new Date('2024-09-18')
          },
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-18')
        }
      ];

      setCurrentContracts(mockCurrentContracts);
      setIsLoading(false);
    };

    loadContracts();
  }, [user.id]);

  const handleApplyToContract = (contractId: string) => {
    console.log('Applying to contract:', contractId);
    // Implementation for applying to contract
  };

  const handleViewContractDetails = (contractId: string) => {
    navigate(`/contract/${contractId}`);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content Area (2/3 width) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{t('home.activeContracts')}</h2>
                <p className="text-sm text-slate-600">{t('home.trackProgress')}</p>
              </div>
              <button
                onClick={() => navigate('/job-listings')}
                className="flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                {t('home.browseJobs')}
              </button>
            </div>
          </div>

          {/* Contracts Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <ContractList
              contracts={currentContracts}
              type="current"
              isLoading={isLoading}
              onApply={handleApplyToContract}
              onViewDetails={handleViewContractDetails}
              user={user}
            />
          </div>
        </div>

        {/* Fixed Right Chatbot (1/3 width) */}
        <div className="w-1/3 bg-slate-200 border-l border-slate-300 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-300 bg-slate-300">
            <h2 className="text-lg font-semibold text-slate-800">{t('home.aiAssistant')}</h2>
            <p className="text-sm text-slate-600">{t('home.aiDescription')}</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatBot 
              userId={user.id}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;