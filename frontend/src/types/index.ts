// User and Authentication Types
export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  digitalId: string; // Aadhaar or other verification
  areaOfExpertise: string[];
  location: {
    state: string;
    city: string;
    pincode: string;
  };
  preferences: {
    maxTravelDistance: number; // in km
    preferredWorkingHours: string[];
    minimumWage: number;
  };
  experience: {
    yearsOfExperience: number;
    previousJobs: string[];
    skills: string[];
  };
  isVerified: boolean;
  profilePicture?: string;
  rating: number;
  completedJobs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employer {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  businessId: string; // GST or business registration
  businessType: string;
  location: {
    state: string;
    city: string;
    pincode: string;
    address: string;
  };
  isVerified: boolean;
  rating: number;
  postedJobs: number;
  completedProjects: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  phoneOrEmail: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  phone?: string;
  email?: string;
  password: string;
  confirmPassword: string;
  digitalId: string;
  areaOfExpertise: string[];
  location: {
    state: string;
    city: string;
    pincode: string;
  };
  preferences: {
    maxTravelDistance: number;
    preferredWorkingHours: string[];
    minimumWage: number;
  };
  experience: {
    yearsOfExperience: number;
    previousJobs: string[];
    skills: string[];
  };
}

// Contract and Job Types
export interface Contract {
  id: string;
  title: string;
  description: string;
  employer: {
    id: string;
    name: string;
    company?: string;
    contactInfo: string;
    rating: number;
  };
  workDetails: {
    location: {
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    startDate: Date;
    endDate?: Date;
    duration: string; // e.g., "2 weeks", "1 month"
    workingHours: string; // e.g., "9 AM - 5 PM"
  };
  payment: {
    rateType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'fixed';
    rate: number;
    currency: 'INR';
    paymentTerms: string;
  };
  requirements: {
    skills: string[];
    experience: number; // minimum years
    tools?: string[];
  };
  status: 'available' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  acceptedBy?: string; // user ID
  contractReceiptId?: string;
  fairnessScore: number; // AI-calculated score
  isMinimumWageCompliant: boolean;
  applicantsCount: number;
  workTracking?: {
    totalHoursWorked: number;
    daysWorked: number;
    estimatedTotalHours: number;
  };
  paymentTracking?: {
    totalDue: number;
    totalReceived: number;
    pendingAmount: number;
    lastPaymentDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractApplication {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  status: 'applied' | 'accepted' | 'rejected' | 'contract_generated';
  appliedAt: Date;
  message?: string;
  proposedWage?: number;
  originalWage: number;
  proposedMessage?: string;
  employerResponse?: string;
  contractId_generated?: string;
  workerProfile: {
    experience: string;
    skills: string[];
    rating: number;
    completedJobs: number;
  };
}

export interface JobPost {
  id: string;
  employerId: string;
  title: string;
  description: string;
  category: string;
  workDetails: {
    location: {
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    startDate: Date;
    endDate?: Date;
    duration: string;
    workingHours: string;
    urgency: 'low' | 'medium' | 'high';
  };
  payment: {
    rateType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'fixed';
    rate: number;
    currency: 'INR';
    paymentTerms: string;
    negotiable: boolean;
  };
  requirements: {
    skills: string[];
    experience: number;
    tools?: string[];
    certifications?: string[];
  };
  status: 'draft' | 'published' | 'closed' | 'filled';
  applications: ContractApplication[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractDocument {
  id: string;
  jobId: string;
  employerId: string;
  workerId: string;
  workerName: string;
  jobTitle: string;
  terms: {
    hourlyRate: number;
    totalHours: number;
    startDate: Date;
    endDate: Date;
    description: string;
    paymentTerms: string;
    cancellationPolicy: string;
    responsibilities?: string[];
    deliverables?: string[];
    penalties?: string;
    bonusTerms?: string;
  };
  status: 'draft' | 'pending_signatures' | 'signed' | 'active' | 'completed' | 'cancelled';
  employerSigned: boolean;
  employerSignedAt?: Date;
  workerSigned: boolean;
  workerSignedAt?: Date;
  employerSignature?: string;
  workerSignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment and Ledger Types
export interface PaymentRecord {
  id: string;
  contractId: string;
  workerId: string;
  employerId: string;
  amount: number;
  currency: 'INR';
  paymentType: 'advance' | 'milestone' | 'final';
  status: 'pending' | 'completed' | 'disputed' | 'cancelled';
  paymentMethod: 'upi' | 'bank_transfer' | 'cash' | 'other';
  transactionId?: string;
  paymentProof?: string; // file path or URL
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkLog {
  id: string;
  contractId: string;
  workerId: string;
  date: Date;
  hoursWorked: number;
  description: string;
  status: 'pending' | 'approved' | 'disputed';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DigitalLedger {
  id: string;
  workerId: string;
  contractId: string;
  totalHoursWorked: number;
  totalDaysWorked: number;
  totalAmountDue: number;
  totalAmountReceived: number;
  totalAmountPending: number;
  workLogs: WorkLog[];
  paymentRecords: PaymentRecord[];
  lastUpdated: Date;
}

// Contract Receipt Types
export interface DigitalContractReceipt {
  id: string;
  contractId: string;
  workerId: string;
  employerId: string;
  terms: {
    jobTitle: string;
    description: string;
    paymentRate: number;
    rateType: string;
    duration: string;
    workingHours: string;
    location: string;
  };
  signatures: {
    workerSignature: string; // digital signature or confirmation
    employerSignature?: string;
    signedAt: Date;
  };
  legalTerms: string;
  status: 'active' | 'completed' | 'terminated';
  generatedAt: Date;
  lastModified: Date;
}

// Chat and Communication Types
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string; // for direct messages, null for AI chat
  message: string;
  messageType: 'text' | 'image' | 'document' | 'contract' | 'system';
  timestamp: Date;
  isRead: boolean;
  contractId?: string; // if message is related to a specific contract
}

export interface ChatConversation {
  id: string;
  participants: string[]; // user IDs
  contractId?: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'contract' | 'payment' | 'system' | 'chat' | 'verification';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionUrl?: string;
  data?: any; // additional data for the notification
  createdAt: Date;
  expiresAt?: Date;
}

// Search and Filter Types
export interface ContractFilters {
  location?: {
    city?: string;
    state?: string;
    maxDistance?: number;
  };
  payment?: {
    minRate?: number;
    maxRate?: number;
    rateType?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'fixed';
  };
  skills?: string[];
  duration?: {
    minDuration?: number; // in days
    maxDuration?: number; // in days
  };
  workingHours?: string[];
  employerRating?: number;
  fairnessScore?: number;
}

export interface SearchQuery {
  keywords: string;
  filters: ContractFilters;
  sortBy: 'relevance' | 'payment' | 'date' | 'distance' | 'rating';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

// Application State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ContractState {
  currentContracts: Contract[];
  suggestedContracts: Contract[];
  searchResults: Contract[];
  selectedContract: Contract | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  isTyping: boolean;
  isLoading: boolean;
}

// Form Types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Component Props Types
export interface ContractCardProps {
  contract: Contract;
  isExpanded?: boolean;
  onExpand?: () => void;
  onApply?: (contractId: string) => void;
  onViewDetails?: (contractId: string) => void;
}

export interface ChatBotProps {
  userId: string;
  contractId?: string;
  className?: string;
}

export interface WorkLogFormProps {
  contractId: string;
  onSubmit: (workLog: Partial<WorkLog>) => void;
  initialData?: Partial<WorkLog>;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml';

// Constants
export const EXPERTISE_AREAS = [
  'Construction',
  'Carpentry',
  'Plumbing',
  'Electrical',
  'Painting',
  'Masonry',
  'Welding',
  'Landscaping',
  'Cleaning',
  'Security',
  'Driver',
  'Delivery',
  'Agriculture',
  'Textile',
  'Manufacturing',
  'Other'
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
] as const;

export const WORKING_HOURS = [
  'Morning (6 AM - 12 PM)',
  'Afternoon (12 PM - 6 PM)',
  'Evening (6 PM - 10 PM)',
  'Night (10 PM - 6 AM)',
  'Flexible'
] as const;

export type ExpertiseArea = typeof EXPERTISE_AREAS[number];
export type IndianState = typeof INDIAN_STATES[number];
export type WorkingHours = typeof WORKING_HOURS[number];

// Enhanced Work Logging Types
export interface WorkReceipt {
  id: string;
  contractId: string;
  workLogId: string;
  fileName: string;
  fileType: string; // image/pdf/document
  fileUrl: string;
  description?: string;
  uploadedAt: Date;
}

export interface DailyWorkEntry {
  id: string;
  contractId: string;
  workerId: string;
  date: Date;
  hoursWorked: number;
  description: string;
  receipts: WorkReceipt[];
  expenses: WorkExpense[];
  progressNotes: string;
  milestoneUpdates: MilestoneUpdate[];
  photos: WorkPhoto[];
  status: 'draft' | 'submitted' | 'approved' | 'disputed';
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkExpense {
  id: string;
  workLogId: string;
  category: 'materials' | 'tools' | 'transport' | 'food' | 'other';
  description: string;
  amount: number;
  currency: 'INR';
  receiptUrl?: string;
  isReimbursable: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface MilestoneUpdate {
  id: string;
  contractId: string;
  title: string;
  description: string;
  completionPercentage: number;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  createdAt: Date;
}

export interface WorkPhoto {
  id: string;
  workLogId: string;
  url: string;
  caption?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

export interface SuggestedJob {
  id: string;
  title: string;
  description: string;
  employer: {
    name: string;
    rating: number;
  };
  payment: {
    rateType: 'hourly' | 'daily' | 'fixed';
    rate: number;
  };
  location: {
    city: string;
    distance: number; // in km from user location
  };
  matchScore: number; // AI-calculated match percentage
  requiredSkills: string[];
  duration: string;
  postedAt: Date;
  urgency: 'low' | 'medium' | 'high';
}