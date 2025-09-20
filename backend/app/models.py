from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=False)
    digital_id = Column(String, nullable=False)  # Aadhaar
    area_of_expertise = Column(JSON, nullable=False)  # List of strings
    
    # Location as JSON
    location = Column(JSON, nullable=False)  # {state, city, pincode}
    
    # Preferences as JSON
    preferences = Column(JSON, nullable=False)  # {maxTravelDistance, preferredWorkingHours, minimumWage}
    
    # Experience as JSON
    experience = Column(JSON, nullable=False)  # {yearsOfExperience, previousJobs, skills}
    
    is_verified = Column(Boolean, default=False)
    profile_picture = Column(String, nullable=True)
    rating = Column(Float, default=0.0)
    completed_jobs = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    contracts_as_worker = relationship("Contract", foreign_keys="Contract.accepted_by", back_populates="worker")
    work_logs = relationship("WorkLog", back_populates="worker")
    payment_records_as_worker = relationship("PaymentRecord", foreign_keys="PaymentRecord.worker_id", back_populates="worker")
    applications = relationship("ContractApplication", back_populates="worker")
    chat_messages = relationship("ChatMessage", foreign_keys="ChatMessage.sender_id", back_populates="sender")

class Employer(Base):
    __tablename__ = "employers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    company = Column(String, nullable=True)
    phone = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=False)
    business_id = Column(String, nullable=False)  # GST or business registration
    business_type = Column(String, nullable=False)
    
    # Location as JSON
    location = Column(JSON, nullable=False)  # {state, city, pincode, address}
    
    is_verified = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    posted_jobs = Column(Integer, default=0)
    completed_projects = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job_posts = relationship("JobPost", back_populates="employer")
    contracts_as_employer = relationship("Contract", foreign_keys="Contract.employer_id", back_populates="employer")
    payment_records_as_employer = relationship("PaymentRecord", foreign_keys="PaymentRecord.employer_id", back_populates="employer")

class Contract(Base):
    __tablename__ = "contracts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    employer_id = Column(String, ForeignKey("employers.id"), nullable=False)
    
    # Work details as JSON
    work_details = Column(JSON, nullable=False)  # {location, startDate, endDate, duration, workingHours}
    
    # Payment details as JSON
    payment = Column(JSON, nullable=False)  # {rateType, rate, currency, paymentTerms}
    
    # Requirements as JSON
    requirements = Column(JSON, nullable=False)  # {skills, experience, tools}
    
    status = Column(String, default="available")  # available, accepted, in-progress, completed, cancelled
    accepted_by = Column(String, ForeignKey("users.id"), nullable=True)
    contract_receipt_id = Column(String, nullable=True)
    fairness_score = Column(Float, default=0.0)
    is_minimum_wage_compliant = Column(Boolean, default=True)
    applicants_count = Column(Integer, default=0)
    
    # Work tracking as JSON
    work_tracking = Column(JSON, nullable=True)  # {totalHoursWorked, daysWorked, estimatedTotalHours}
    
    # Payment tracking as JSON
    payment_tracking = Column(JSON, nullable=True)  # {totalDue, totalReceived, pendingAmount, lastPaymentDate}
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employer = relationship("Employer", foreign_keys=[employer_id], back_populates="contracts_as_employer")
    worker = relationship("User", foreign_keys=[accepted_by], back_populates="contracts_as_worker")
    work_logs = relationship("WorkLog", back_populates="contract")
    payment_records = relationship("PaymentRecord", back_populates="contract")
    applications = relationship("ContractApplication", foreign_keys="ContractApplication.contract_id_generated", back_populates="generated_contract")

class JobPost(Base):
    __tablename__ = "job_posts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    employer_id = Column(String, ForeignKey("employers.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    
    # Work details as JSON
    work_details = Column(JSON, nullable=False)  # {location, startDate, endDate, duration, workingHours, urgency}
    
    # Payment details as JSON
    payment = Column(JSON, nullable=False)  # {rateType, rate, currency, paymentTerms, negotiable}
    
    # Requirements as JSON
    requirements = Column(JSON, nullable=False)  # {skills, experience, tools, certifications}
    
    status = Column(String, default="draft")  # draft, published, closed, filled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employer = relationship("Employer", back_populates="job_posts")
    applications = relationship("ContractApplication", back_populates="job_post")

class ContractApplication(Base):
    __tablename__ = "contract_applications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    job_id = Column(String, ForeignKey("job_posts.id"), nullable=False)
    worker_id = Column(String, ForeignKey("users.id"), nullable=False)
    worker_name = Column(String, nullable=False)
    status = Column(String, default="applied")  # applied, accepted, rejected, contract_generated
    applied_at = Column(DateTime, default=datetime.utcnow)
    message = Column(Text, nullable=True)
    proposed_wage = Column(Float, nullable=True)
    original_wage = Column(Float, nullable=False)
    proposed_message = Column(Text, nullable=True)
    employer_response = Column(Text, nullable=True)
    contract_id_generated = Column(String, ForeignKey("contracts.id"), nullable=True)
    
    # Worker profile as JSON
    worker_profile = Column(JSON, nullable=False)  # {experience, skills, rating, completedJobs}
    
    # Relationships
    job_post = relationship("JobPost", back_populates="applications")
    worker = relationship("User", back_populates="applications")
    generated_contract = relationship("Contract", foreign_keys=[contract_id_generated], back_populates="applications")

class WorkLog(Base):
    __tablename__ = "work_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    contract_id = Column(String, ForeignKey("contracts.id"), nullable=False)
    worker_id = Column(String, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    hours_worked = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending, approved, disputed
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    contract = relationship("Contract", back_populates="work_logs")
    worker = relationship("User", back_populates="work_logs")

class PaymentRecord(Base):
    __tablename__ = "payment_records"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    contract_id = Column(String, ForeignKey("contracts.id"), nullable=False)
    worker_id = Column(String, ForeignKey("users.id"), nullable=False)
    employer_id = Column(String, ForeignKey("employers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    payment_type = Column(String, nullable=False)  # advance, milestone, final
    status = Column(String, default="pending")  # pending, completed, disputed, cancelled
    payment_method = Column(String, nullable=False)  # upi, bank_transfer, cash, other
    transaction_id = Column(String, nullable=True)
    payment_proof = Column(String, nullable=True)  # file path or URL
    due_date = Column(DateTime, nullable=False)
    paid_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    contract = relationship("Contract", back_populates="payment_records")
    worker = relationship("User", foreign_keys=[worker_id], back_populates="payment_records_as_worker")
    employer = relationship("Employer", foreign_keys=[employer_id], back_populates="payment_records_as_employer")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(String, nullable=True)  # null for AI chat
    message = Column(Text, nullable=False)
    message_type = Column(String, default="text")  # text, image, document, contract, system
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    contract_id = Column(String, nullable=True)  # if message is related to a specific contract
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="chat_messages")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # contract, payment, system, chat, verification
    priority = Column(String, default="medium")  # low, medium, high, urgent
    is_read = Column(Boolean, default=False)
    action_url = Column(String, nullable=True)
    data = Column(JSON, nullable=True)  # additional data
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)