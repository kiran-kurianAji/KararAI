import { useState } from 'react';
import { 
  MapPin, Clock, IndianRupee, User, Star, AlertCircle, CheckCircle, Plus, Eye,
  Upload, Camera, FileText, DollarSign, Target, Clock4, Save, X, Receipt, 
  TrendingUp, Calendar, PlusCircle
} from 'lucide-react';
import type { Contract, User as UserType } from '../types';

interface ContractListProps {
  contracts: Contract[];
  type: 'current' | 'suggested';
  isLoading: boolean;
  onApply: (contractId: string) => void;
  onViewDetails: (contractId: string) => void;
  user: UserType;
}

const ContractList = ({ contracts, type, isLoading, onApply, onViewDetails, user }: ContractListProps) => {
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [workLog, setWorkLog] = useState<{[key: string]: {
    hoursToday: number;
    progressNotes: string;
    expenses: Array<{description: string; amount: number; category: string}>;
    receipts: File[];
    milestoneUpdate: string;
  }}>({});

  // Calculate progress based on work duration and actual work done
  const calculateProgress = (contract: Contract) => {
    const startDate = new Date(contract.workDetails.startDate);
    const endDate = contract.workDetails.endDate ? new Date(contract.workDetails.endDate) : null;
    const today = new Date();
    
    // Use actual work tracking data if available
    if (contract.workTracking) {
      const { totalHoursWorked, daysWorked, estimatedTotalHours } = contract.workTracking;
      const hourPercentage = (totalHoursWorked / estimatedTotalHours) * 100;
      
      if (!endDate) {
        return {
          type: 'days',
          completed: daysWorked,
          total: null,
          hours: totalHoursWorked,
          estimatedHours: estimatedTotalHours,
          percentage: Math.min(100, hourPercentage)
        };
      }
      
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const dayPercentage = (daysWorked / totalDays) * 100;
      
      return {
        type: 'days',
        completed: daysWorked,
        total: totalDays,
        hours: totalHoursWorked,
        estimatedHours: estimatedTotalHours,
        percentage: Math.min(100, Math.max(dayPercentage, hourPercentage))
      };
    }
    
    // Fallback to date-based calculation
    if (!endDate) {
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const workingDays = Math.max(1, daysSinceStart);
      return {
        type: 'days',
        completed: Math.min(workingDays, 999),
        total: null,
        hours: workingDays * 8, // Estimate 8 hours per day
        estimatedHours: null,
        percentage: Math.min(100, (workingDays / 30) * 100)
      };
    }
    
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const completedDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const percentage = Math.min(100, Math.max(0, (completedDays / totalDays) * 100));
    
    return {
      type: 'days',
      completed: Math.max(0, completedDays),
      total: totalDays,
      hours: completedDays * 8,
      estimatedHours: totalDays * 8,
      percentage: percentage
    };
  };

  // Quick hour logging function
  const quickLogHours = (contractId: string, hours: number) => {
    const currentData = getWorkLogData(contractId);
    updateWorkLog(contractId, 'hoursToday', currentData.hoursToday + hours);
    // You could also show a toast notification here
  };

  const toggleExpanded = (contractId: string) => {
    setExpandedContract(expandedContract === contractId ? null : contractId);
  };

  const updateWorkLog = (contractId: string, field: string, value: any) => {
    setWorkLog(prev => ({
      ...prev,
      [contractId]: {
        ...prev[contractId],
        [field]: value
      }
    }));
  };

  const getWorkLogData = (contractId: string) => {
    return workLog[contractId] || {
      hoursToday: 0,
      progressNotes: '',
      expenses: [],
      receipts: [],
      milestoneUpdate: ''
    };
  };

  const addExpense = (contractId: string) => {
    const currentExpenses = getWorkLogData(contractId).expenses;
    updateWorkLog(contractId, 'expenses', [
      ...currentExpenses,
      { description: '', amount: 0, category: 'materials' }
    ]);
  };

  const removeExpense = (contractId: string, index: number) => {
    const currentExpenses = getWorkLogData(contractId).expenses;
    updateWorkLog(contractId, 'expenses', currentExpenses.filter((_, i) => i !== index));
  };

  const handleFileUpload = (contractId: string, files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      const currentReceipts = getWorkLogData(contractId).receipts;
      updateWorkLog(contractId, 'receipts', [...currentReceipts, ...newFiles]);
    }
  };

  const removeReceipt = (contractId: string, index: number) => {
    const currentReceipts = getWorkLogData(contractId).receipts;
    updateWorkLog(contractId, 'receipts', currentReceipts.filter((_, i) => i !== index));
  };

  const submitWorkLog = (contractId: string) => {
    const data = getWorkLogData(contractId);
    console.log('Submitting work log for contract:', contractId, data);
    // Here you would make an API call to submit the work log
    alert('Work log submitted successfully!');
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

  const getFairnessColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600 bg-green-50';
    if (score >= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getFairnessLabel = (score: number) => {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7) return 'Fair';
    return 'Below Average';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-slate-400 mb-2">
          {type === 'current' ? <CheckCircle className="w-12 h-12 mx-auto" /> : <Eye className="w-12 h-12 mx-auto" />}
        </div>
        <p className="text-slate-500">
          {type === 'current' ? 'No active contracts' : 'No jobs available'}
        </p>
        <p className="text-sm text-slate-400 mt-1">
          {type === 'current' 
            ? 'Accept a job to see it here' 
            : 'Try adjusting your search or check back later'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className={`border rounded-lg transition-all duration-200 hover:shadow-md ${
              expandedContract === contract.id ? 'border-red-300 shadow-md' : 'border-slate-200'
            }`}
          >
            {/* Contract Header */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">
                    {contract.title}
                  </h3>
                  <div className="flex items-center mt-1 text-xs text-slate-600">
                    <User className="w-3 h-3 mr-1" />
                    <span>{contract.employer.name}</span>
                    {contract.employer.company && (
                      <span className="ml-1">• {contract.employer.company}</span>
                    )}
                  </div>
                </div>
                
                {/* Fairness Score */}
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getFairnessColor(contract.fairnessScore)}`}>
                  {getFairnessLabel(contract.fairnessScore)}
                </div>
              </div>

              {/* Contract Details */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{contract.workDetails.location.city}, {contract.workDetails.location.state}</span>
                </div>
                
                <div className="flex items-center">
                  <IndianRupee className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="font-medium text-slate-800">{getRateDisplay(contract)}</span>
                  {!contract.isMinimumWageCompliant && (
                    <AlertCircle className="w-3 h-3 ml-1 text-red-500" />
                  )}
                </div>

                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span>{contract.workDetails.duration}</span>
                </div>

                {/* Progress Display for Current Contracts */}
                {type === 'current' && (
                  <>
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                      <div className="flex-1">
                        {(() => {
                          const progress = calculateProgress(contract);
                          return (
                            <div className="flex items-center space-x-2">
                              <span>
                                {progress.completed} {progress.total ? `/ ${progress.total}` : ''} days 
                                ({progress.hours}h{progress.estimatedHours ? ` / ${progress.estimatedHours}h` : ''})
                              </span>
                              <div className="w-16 bg-slate-200 rounded-full h-1">
                                <div 
                                  className="bg-green-500 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${progress.percentage}%` }}
                                />
                              </div>
                              <span className="text-green-600 font-medium">{Math.round(progress.percentage)}%</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Payment Tracking */}
                    {contract.paymentTracking && (
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1 flex-shrink-0" />
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-green-600 font-medium">
                            ₹{contract.paymentTracking.totalReceived.toLocaleString()} received
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-orange-600 font-medium">
                            ₹{contract.paymentTracking.pendingAmount.toLocaleString()} due
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">
                            Total: ₹{contract.paymentTracking.totalDue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Contract Receipt Link */}
                {type === 'current' && contract.contractReceiptId && (
                  <div className="flex items-center">
                    <Receipt className="w-3 h-3 mr-1 flex-shrink-0" />
                    <button 
                      onClick={() => window.open(`/contract-receipt/${contract.contractReceiptId}`, '_blank')}
                      className="text-red-600 hover:text-red-700 underline"
                    >
                      View Digital Contract Receipt
                    </button>
                  </div>
                )}

                <div className="flex items-center">
                  <Star className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span>Employer Rating: {contract.employer.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Quick Actions for Current Contracts */}
              {type === 'current' && (
                <div className="mt-3 p-2 bg-slate-50 rounded border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs">
                      <Clock4 className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-600">Today's hours:</span>
                      <span className="font-semibold text-slate-800">
                        {getWorkLogData(contract.id).hoursToday || 0}h
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => quickLogHours(contract.id, 1)}
                        className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                        title="Add 1 hour"
                      >
                        <PlusCircle className="w-3 h-3 mr-1" />
                        +1h
                      </button>
                      <button
                        onClick={() => quickLogHours(contract.id, 4)}
                        className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                        title="Add 4 hours"
                      >
                        <PlusCircle className="w-3 h-3 mr-1" />
                        +4h
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status and Actions */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  {type === 'current' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                  {type === 'suggested' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {contract.applicantsCount} applicants
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleExpanded(contract.id)}
                    className="text-red-600 hover:text-red-700 text-xs font-medium"
                  >
                    {expandedContract === contract.id ? 'Less' : 'More'}
                  </button>
                  
                  {type === 'suggested' && user.isVerified && (
                    <button
                      onClick={() => onApply(contract.id)}
                      className="flex items-center px-3 py-1 bg-red-700 text-white text-xs font-medium rounded hover:bg-red-800 transition-colors"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Apply
                    </button>
                  )}
                  
                  {type === 'current' && (
                    <button
                      onClick={() => onViewDetails(contract.id)}
                      className="flex items-center px-3 py-1 bg-slate-600 text-white text-xs font-medium rounded hover:bg-slate-700 transition-colors"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedContract === contract.id && (
              <div className="border-t bg-slate-50 p-4">
                <div className="space-y-3 text-xs">
                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Description</h4>
                    <p className="text-slate-600">{contract.description}</p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Requirements</h4>
                    <div className="space-y-1">
                      <p><span className="font-medium">Skills:</span> {contract.requirements.skills.join(', ')}</p>
                      <p><span className="font-medium">Experience:</span> {contract.requirements.experience} years minimum</p>
                      {contract.requirements.tools && (
                        <p><span className="font-medium">Tools:</span> {contract.requirements.tools.join(', ')}</p>
                      )}
                    </div>
                  </div>

                  {/* Work Details */}
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Work Details</h4>
                    <div className="space-y-1">
                      <p><span className="font-medium">Location:</span> {contract.workDetails.location.address}</p>
                      <p><span className="font-medium">Start Date:</span> {formatDate(contract.workDetails.startDate)}</p>
                      {contract.workDetails.endDate && (
                        <p><span className="font-medium">End Date:</span> {formatDate(contract.workDetails.endDate)}</p>
                      )}
                      <p><span className="font-medium">Working Hours:</span> {contract.workDetails.workingHours}</p>
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Payment Terms</h4>
                    <p className="text-slate-600">{contract.payment.paymentTerms}</p>
                  </div>

                  {/* Employer Contact */}
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">Employer Contact</h4>
                    <p className="text-slate-600">{contract.employer.contactInfo}</p>
                  </div>

                  {/* Current Contract - Enhanced Work Tracking */}
                  {type === 'current' && (
                    <div className="mt-4 p-4 bg-white rounded border border-slate-200 space-y-4">
                      <h4 className="font-medium text-slate-800 mb-3 flex items-center">
                        <Clock4 className="w-4 h-4 mr-2" />
                        Daily Work Log - {new Date().toLocaleDateString()}
                      </h4>
                      
                      {/* Hours and Basic Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 text-xs mb-1">Hours worked today</label>
                          <input
                            type="number"
                            min="0"
                            max="12"
                            step="0.5"
                            value={getWorkLogData(contract.id).hoursToday}
                            onChange={(e) => updateWorkLog(contract.id, 'hoursToday', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-red-700 focus:border-red-700"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 text-xs mb-1">Total project hours</label>
                          <div className="px-2 py-1 bg-slate-100 rounded text-xs flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            45.5 hrs (estimated)
                          </div>
                        </div>
                      </div>

                      {/* Progress Notes */}
                      <div>
                        <label className="text-slate-600 text-xs mb-1 flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Progress Notes
                        </label>
                        <textarea
                          value={getWorkLogData(contract.id).progressNotes}
                          onChange={(e) => updateWorkLog(contract.id, 'progressNotes', e.target.value)}
                          className="w-full px-2 py-2 border border-slate-300 rounded text-xs resize-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
                          rows={2}
                          placeholder="Describe today's work progress, challenges, or achievements..."
                        />
                      </div>

                      {/* Receipt Upload */}
                      <div>
                        <label className="text-slate-600 text-xs mb-2 flex items-center">
                          <Upload className="w-3 h-3 mr-1" />
                          Upload Receipts/Photos
                        </label>
                        <div className="border-2 border-dashed border-slate-300 rounded p-3">
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={(e) => handleFileUpload(contract.id, e.target.files)}
                            className="hidden"
                            id={`file-upload-${contract.id}`}
                          />
                          <label 
                            htmlFor={`file-upload-${contract.id}`}
                            className="cursor-pointer flex flex-col items-center text-xs text-slate-500"
                          >
                            <Camera className="w-6 h-6 mb-1" />
                            <span>Click to upload files or photos</span>
                            <span className="text-xs text-gray-400">Receipts, work photos, documents</span>
                          </label>
                          
                          {/* Uploaded Files */}
                          {getWorkLogData(contract.id).receipts.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {getWorkLogData(contract.id).receipts.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                                  <span className="truncate">{file.name}</span>
                                  <button
                                    onClick={() => removeReceipt(contract.id, index)}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expenses */}
                      <div>
                        <label className="text-slate-600 text-xs mb-2 flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Expenses (reimbursable)
                          </div>
                          <button
                            onClick={() => addExpense(contract.id)}
                            className="text-red-600 hover:text-red-700 flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </button>
                        </label>
                        
                        {getWorkLogData(contract.id).expenses.length > 0 && (
                          <div className="space-y-2">
                            {getWorkLogData(contract.id).expenses.map((expense, index) => (
                              <div key={index} className="grid grid-cols-4 gap-2">
                                <input
                                  type="text"
                                  placeholder="Description"
                                  value={expense.description}
                                  onChange={(e) => {
                                    const expenses = [...getWorkLogData(contract.id).expenses];
                                    expenses[index].description = e.target.value;
                                    updateWorkLog(contract.id, 'expenses', expenses);
                                  }}
                                  className="col-span-2 px-2 py-1 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-red-700 focus:border-red-700"
                                />
                                <input
                                  type="number"
                                  placeholder="Amount"
                                  value={expense.amount}
                                  onChange={(e) => {
                                    const expenses = [...getWorkLogData(contract.id).expenses];
                                    expenses[index].amount = parseFloat(e.target.value) || 0;
                                    updateWorkLog(contract.id, 'expenses', expenses);
                                  }}
                                  className="px-2 py-1 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-red-700 focus:border-red-700"
                                />
                                <button
                                  onClick={() => removeExpense(contract.id, index)}
                                  className="text-red-500 hover:text-red-700 flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <div className="text-right text-xs font-medium">
                              Total: ₹{getWorkLogData(contract.id).expenses.reduce((sum, exp) => sum + exp.amount, 0)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Milestone Update */}
                      <div>
                        <label className="text-gray-600 text-xs mb-1 flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          Milestone/Progress Update
                        </label>
                        <textarea
                          value={getWorkLogData(contract.id).milestoneUpdate}
                          onChange={(e) => updateWorkLog(contract.id, 'milestoneUpdate', e.target.value)}
                          className="w-full px-2 py-2 border border-slate-300 rounded text-xs resize-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
                          rows={2}
                          placeholder="Update on project milestones, completion percentage, next steps..."
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        <button 
                          onClick={() => submitWorkLog(contract.id)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Submit Work Log
                        </button>
                        <button 
                          onClick={() => onViewDetails(contract.id)}
                          className="px-3 py-2 bg-red-700 text-white text-xs font-medium rounded hover:bg-red-800 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractList;