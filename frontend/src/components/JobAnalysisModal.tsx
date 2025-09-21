import { useState } from 'react';
import { X, Brain, Star, MapPin, IndianRupee, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Contract, User } from '../types';
import ChatBot from './ChatBot';

interface JobAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  user: User;
}

const JobAnalysisModal = ({ isOpen, onClose, contract, user }: JobAnalysisModalProps) => {
  const [analysisType, setAnalysisType] = useState<'overview' | 'wage' | 'location' | 'chat'>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRateDisplay = (contract: Contract) => {
    const { rate, rateType } = contract.payment;
    switch (rateType) {
      case 'hourly':
        return `${formatCurrency(rate)}/hr`;
      case 'daily':
        return `${formatCurrency(rate)}/day`;
      case 'weekly':
        return `${formatCurrency(rate)}/week`;
      case 'monthly':
        return `${formatCurrency(rate)}/month`;
      case 'fixed':
        return `${formatCurrency(rate)} (Fixed)`;
      default:
        return formatCurrency(rate);
    }
  };

  const getSkillMatch = () => {
    const userSkills = user.experience?.skills || [];
    const requiredSkills = contract.requirements.skills;
    const matchingSkills = requiredSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    return {
      matching: matchingSkills,
      percentage: Math.round((matchingSkills.length / requiredSkills.length) * 100)
    };
  };

  const getLocationAnalysis = () => {
    const userLocation = user.location;
    const jobLocation = contract.workDetails.location;
    const sameCity = userLocation.city.toLowerCase() === jobLocation.city.toLowerCase();
    const sameState = userLocation.state.toLowerCase() === jobLocation.state.toLowerCase();
    
    return {
      sameCity,
      sameState,
      distance: sameCity ? '0-5 km' : sameState ? '20-50 km' : '50+ km',
      commute: sameCity ? 'Local' : sameState ? 'Within state' : 'Interstate'
    };
  };

  const getWageAnalysis = () => {
    const userMinWage = user.preferences?.minimumWage || 500;
    const contractRate = contract.payment.rate;
    const isAboveMinimum = contractRate >= userMinWage;
    const percentage = Math.round((contractRate / userMinWage) * 100);
    
    return {
      isAboveMinimum,
      percentage,
      difference: contractRate - userMinWage,
      recommendation: percentage >= 120 ? 'Excellent pay' : 
                     percentage >= 100 ? 'Fair pay' : 'Below expectations'
    };
  };

  const skillMatch = getSkillMatch();
  const locationAnalysis = getLocationAnalysis();
  const wageAnalysis = getWageAnalysis();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-xl font-semibold text-white">AI Job Analysis</h2>
                  <p className="text-blue-100 text-sm">{contract.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Navigation */}
              <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
                <nav className="space-y-2">
                  {[
                    { id: 'overview', label: 'Overview', icon: Brain },
                    { id: 'wage', label: 'Wage Analysis', icon: IndianRupee },
                    { id: 'location', label: 'Location & Commute', icon: MapPin },
                    { id: 'chat', label: 'Ask AI', icon: Brain }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setAnalysisType(tab.id as 'overview' | 'wage' | 'location' | 'chat')}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          analysisType === tab.id
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Quick Stats */}
                <div className="mt-6 p-3 bg-white rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Analysis</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Skills Match</span>
                      <span className={`font-semibold ${skillMatch.percentage >= 70 ? 'text-green-600' : skillMatch.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {skillMatch.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className={`font-semibold ${locationAnalysis.sameCity ? 'text-green-600' : locationAnalysis.sameState ? 'text-yellow-600' : 'text-red-600'}`}>
                        {locationAnalysis.commute}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Wage</span>
                      <span className={`font-semibold ${wageAnalysis.isAboveMinimum ? 'text-green-600' : 'text-red-600'}`}>
                        {wageAnalysis.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Fairness Score</span>
                      <span className={`font-semibold ${contract.fairnessScore >= 8 ? 'text-green-600' : contract.fairnessScore >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {contract.fairnessScore}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
                {analysisType === 'overview' && (
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Overview Analysis</h3>
                      
                      {/* Overall Recommendation */}
                      <div className={`p-4 rounded-lg border-l-4 mb-6 ${
                        contract.fairnessScore >= 8 ? 'bg-green-50 border-green-400' :
                        contract.fairnessScore >= 6 ? 'bg-yellow-50 border-yellow-400' :
                        'bg-red-50 border-red-400'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {contract.fairnessScore >= 8 ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : contract.fairnessScore >= 6 ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          <h4 className={`font-semibold ${
                            contract.fairnessScore >= 8 ? 'text-green-800' :
                            contract.fairnessScore >= 6 ? 'text-yellow-800' :
                            'text-red-800'
                          }`}>
                            {contract.fairnessScore >= 8 ? 'Highly Recommended' :
                             contract.fairnessScore >= 6 ? 'Moderately Recommended' :
                             'Not Recommended'}
                          </h4>
                        </div>
                        <p className={`text-sm ${
                          contract.fairnessScore >= 8 ? 'text-green-700' :
                          contract.fairnessScore >= 6 ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {contract.fairnessScore >= 8 
                            ? 'This job shows excellent terms and high fairness. Great match for your profile!'
                            : contract.fairnessScore >= 6
                            ? 'This job has decent terms but consider the areas of concern below.'
                            : 'This job shows several concerning factors. Consider other opportunities.'
                          }
                        </p>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-800">Skills Match</h4>
                            <Star className="w-4 h-4 text-yellow-500" />
                          </div>
                          <div className="text-2xl font-bold text-purple-600">{skillMatch.percentage}%</div>
                          <p className="text-xs text-gray-600 mt-1">
                            {skillMatch.matching.length} of {contract.requirements.skills.length} skills match
                          </p>
                          <div className="mt-2">
                            <div className="text-xs text-gray-600 mb-1">Matching skills:</div>
                            <div className="flex flex-wrap gap-1">
                              {skillMatch.matching.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-800">Wage Analysis</h4>
                            <IndianRupee className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="text-2xl font-bold text-green-600">{getRateDisplay(contract)}</div>
                          <p className="text-xs text-gray-600 mt-1">
                            {wageAnalysis.percentage}% of your minimum wage
                          </p>
                          <div className={`text-xs mt-1 ${wageAnalysis.isAboveMinimum ? 'text-green-600' : 'text-red-600'}`}>
                            {wageAnalysis.isAboveMinimum 
                              ? `₹${wageAnalysis.difference} above your minimum`
                              : `₹${Math.abs(wageAnalysis.difference)} below your minimum`
                            }
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-800">Location</h4>
                            <MapPin className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="text-lg font-bold text-blue-600">{locationAnalysis.distance}</div>
                          <p className="text-xs text-gray-600 mt-1">{locationAnalysis.commute}</p>
                          <div className="text-xs text-gray-600 mt-1">
                            {contract.workDetails.location.city}, {contract.workDetails.location.state}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-800">Duration</h4>
                            <Clock className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="text-lg font-bold text-purple-600">{contract.workDetails.duration}</div>
                          <p className="text-xs text-gray-600 mt-1">{contract.workDetails.workingHours}</p>
                          <div className="text-xs text-gray-600 mt-1">
                            Employer rating: {contract.employer.rating}/5
                          </div>
                        </div>
                      </div>

                      {/* Detailed Analysis */}
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-2">Strengths</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {contract.fairnessScore >= 8 && <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Excellent fairness score</li>}
                            {contract.isMinimumWageCompliant && <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Meets minimum wage requirements</li>}
                            {skillMatch.percentage >= 70 && <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Strong skills match</li>}
                            {locationAnalysis.sameCity && <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Local job - minimal commute</li>}
                            {wageAnalysis.isAboveMinimum && <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Wage meets your expectations</li>}
                            {contract.employer.rating >= 4.5 && <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Highly rated employer</li>}
                          </ul>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-2">Areas of Concern</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {contract.fairnessScore < 6 && <li className="flex items-center"><AlertTriangle className="w-4 h-4 text-red-500 mr-2" />Low fairness score</li>}
                            {!contract.isMinimumWageCompliant && <li className="flex items-center"><AlertTriangle className="w-4 h-4 text-red-500 mr-2" />Below minimum wage</li>}
                            {skillMatch.percentage < 50 && <li className="flex items-center"><AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />Limited skills match</li>}
                            {!locationAnalysis.sameState && <li className="flex items-center"><AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />Interstate travel required</li>}
                            {!wageAnalysis.isAboveMinimum && <li className="flex items-center"><AlertTriangle className="w-4 h-4 text-red-500 mr-2" />Wage below expectations</li>}
                            {contract.employer.rating < 4 && <li className="flex items-center"><AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />Employer has lower ratings</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {analysisType === 'wage' && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Wage Analysis</h3>
                    
                    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-green-600 mb-1">{getRateDisplay(contract)}</div>
                        <div className="text-gray-600">Offered Rate</div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-800">₹{user.preferences?.minimumWage || 500}</div>
                          <div className="text-xs text-gray-600">Your Minimum</div>
                        </div>
                        <div>
                          <div className={`text-lg font-semibold ${wageAnalysis.isAboveMinimum ? 'text-green-600' : 'text-red-600'}`}>
                            {wageAnalysis.percentage}%
                          </div>
                          <div className="text-xs text-gray-600">Of Your Minimum</div>
                        </div>
                        <div>
                          <div className={`text-lg font-semibold ${wageAnalysis.isAboveMinimum ? 'text-green-600' : 'text-red-600'}`}>
                            {wageAnalysis.isAboveMinimum ? '+' : ''}₹{wageAnalysis.difference}
                          </div>
                          <div className="text-xs text-gray-600">Difference</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Payment Terms</h4>
                        <p className="text-sm text-gray-600">{contract.payment.paymentTerms}</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Market Comparison</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>• Average rate for {contract.requirements.skills[0]} in {contract.workDetails.location.city}: ₹400-600/day</p>
                          <p>• This job: {wageAnalysis.recommendation}</p>
                          <p>• Minimum wage compliance: {contract.isMinimumWageCompliant ? '✅ Yes' : '❌ No'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {analysisType === 'location' && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Location & Commute Analysis</h3>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Your Location</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">City:</span> {user.location.city}</p>
                          <p><span className="font-medium">State:</span> {user.location.state}</p>
                          <p><span className="font-medium">Pincode:</span> {user.location.pincode}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Job Location</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Address:</span> {contract.workDetails.location.address}</p>
                          <p><span className="font-medium">City:</span> {contract.workDetails.location.city}</p>
                          <p><span className="font-medium">State:</span> {contract.workDetails.location.state}</p>
                          <p><span className="font-medium">Pincode:</span> {contract.workDetails.location.pincode}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4">Commute Analysis</h4>
                      
                      <div className="grid grid-cols-3 gap-4 text-center mb-6">
                        <div className={`p-4 rounded-lg ${locationAnalysis.sameCity ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                          <div className={`text-lg font-semibold ${locationAnalysis.sameCity ? 'text-green-600' : 'text-gray-600'}`}>
                            {locationAnalysis.distance}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Estimated Distance</div>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${locationAnalysis.sameCity ? 'bg-green-50 border border-green-200' : locationAnalysis.sameState ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className={`text-lg font-semibold ${locationAnalysis.sameCity ? 'text-green-600' : locationAnalysis.sameState ? 'text-yellow-600' : 'text-red-600'}`}>
                            {locationAnalysis.commute}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Commute Type</div>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="text-lg font-semibold text-blue-600">
                            {user.preferences?.maxTravelDistance || 25} km
                          </div>
                          <div className="text-xs text-gray-600 mt-1">Your Max Distance</div>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${locationAnalysis.sameCity ? 'bg-green-500' : locationAnalysis.sameState ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                          <span>
                            {locationAnalysis.sameCity 
                              ? 'Same city - Minimal travel time and cost'
                              : locationAnalysis.sameState 
                              ? 'Within state - Moderate travel required'
                              : 'Interstate - Significant travel and potential accommodation needs'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${(user.preferences?.maxTravelDistance || 25) >= 50 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span>
                            Travel preference: You're willing to travel up to {user.preferences?.maxTravelDistance || 25} km
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {analysisType === 'chat' && (
                  <div className="h-full">
                    <ChatBot 
                      userId={user.id}
                      contractId={contract.id}
                      sessionType="job-analysis"
                      className="h-full"
                      jobData={contract}
                      userData={user}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JobAnalysisModal;