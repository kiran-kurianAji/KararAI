from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, Employer, Contract, JobPost, ContractApplication
from app.auth import get_password_hash
from datetime import datetime, timedelta
import json

# Create tables
Base.metadata.create_all(bind=engine)

def seed_database():
    """Seed database with mock data similar to frontend."""
    
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(ContractApplication).delete()
        db.query(Contract).delete()
        db.query(JobPost).delete()
        db.query(User).delete()
        db.query(Employer).delete()
        db.commit()
        
        # Create mock users (workers)
        users = [
            # Demo account for testing
            User(
                name="Demo User",
                phone="9999999999",
                email="demo@example.com",
                password_hash=get_password_hash("password123"),
                digital_id="DEMO-1234-5678",
                area_of_expertise=["Construction", "Electrical", "Plumbing"],
                location={
                    "state": "Karnataka",
                    "city": "Bangalore",
                    "pincode": "560001"
                },
                preferences={
                    "max_travel_distance": 20,
                    "preferred_working_hours": ["Morning (6 AM - 12 PM)", "Afternoon (12 PM - 6 PM)"],
                    "minimum_wage": 500
                },
                experience={
                    "years_of_experience": 10,
                    "previous_jobs": ["Building construction", "Electrical work", "Plumbing repairs"],
                    "skills": ["Multiple skills", "Experienced worker", "Reliable"]
                },
                is_verified=True,
                rating=4.8,
                completed_jobs=50
            ),
            User(
                name="Rajesh Kumar",
                phone="9876543210",
                email="rajesh.kumar@email.com",
                password_hash=get_password_hash("password123"),
                digital_id="1234-5678-9012",
                area_of_expertise=["Construction", "Masonry"],
                location={
                    "state": "Karnataka",
                    "city": "Bangalore",
                    "pincode": "560001"
                },
                preferences={
                    "max_travel_distance": 15,
                    "preferred_working_hours": ["Morning (6 AM - 12 PM)", "Afternoon (12 PM - 6 PM)"],
                    "minimum_wage": 500
                },
                experience={
                    "years_of_experience": 8,
                    "previous_jobs": ["Building construction", "Road work", "House renovation"],
                    "skills": ["Brick laying", "Concrete work", "Foundation work"]
                },
                is_verified=True,
                rating=4.2,
                completed_jobs=15
            ),
            User(
                name="Priya Sharma",
                phone="9876543211",
                email="priya.sharma@email.com",
                password_hash=get_password_hash("password123"),
                digital_id="2234-5678-9012",
                area_of_expertise=["Cleaning", "Domestic Help"],
                location={
                    "state": "Karnataka",
                    "city": "Bangalore",
                    "pincode": "560002"
                },
                preferences={
                    "max_travel_distance": 10,
                    "preferred_working_hours": ["Morning (6 AM - 12 PM)"],
                    "minimum_wage": 300
                },
                experience={
                    "years_of_experience": 5,
                    "previous_jobs": ["House cleaning", "Office cleaning", "Cooking"],
                    "skills": ["Deep cleaning", "Cooking", "Laundry"]
                },
                is_verified=True,
                rating=4.7,
                completed_jobs=32
            ),
            User(
                name="Suresh Reddy",
                phone="9876543212",
                email="suresh.reddy@email.com",
                password_hash=get_password_hash("password123"),
                digital_id="3234-5678-9012",
                area_of_expertise=["Electrical", "Plumbing"],
                location={
                    "state": "Karnataka",
                    "city": "Mysore",
                    "pincode": "570001"
                },
                preferences={
                    "max_travel_distance": 20,
                    "preferred_working_hours": ["Morning (6 AM - 12 PM)", "Afternoon (12 PM - 6 PM)"],
                    "minimum_wage": 600
                },
                experience={
                    "years_of_experience": 12,
                    "previous_jobs": ["House wiring", "Commercial electrical", "Plumbing repairs"],
                    "skills": ["Electrical wiring", "Pipe fitting", "Motor repair"]
                },
                is_verified=True,
                rating=4.5,
                completed_jobs=28
            )
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        
        # Create mock employers
        employers = [
            Employer(
                name="Bangalore Builders",
                company="Bangalore Builders Pvt Ltd",
                phone="9876543220",
                email="contact@bangalorebuilders.com",
                password_hash=get_password_hash("employer123"),
                business_id="29AABCU9603R1ZX",
                business_type="Construction Company",
                location={
                    "state": "Karnataka",
                    "city": "Bangalore",
                    "pincode": "560001",
                    "address": "123 MG Road, Bangalore"
                },
                is_verified=True,
                rating=4.3,
                posted_jobs=12,
                completed_projects=8
            ),
            Employer(
                name="Clean Home Services",
                company="Clean Home Services",
                phone="9876543221",
                email="contact@cleanhome.com",
                password_hash=get_password_hash("employer123"),
                business_id="29AABCU9603R1ZY",
                business_type="Service Provider",
                location={
                    "state": "Karnataka",
                    "city": "Bangalore",
                    "pincode": "560002",
                    "address": "456 Brigade Road, Bangalore"
                },
                is_verified=True,
                rating=4.6,
                posted_jobs=25,
                completed_projects=20
            ),
            Employer(
                name="Tech Park Maintenance",
                company="Tech Park Maintenance Ltd",
                phone="9876543222",
                email="hr@techparkmaintenance.com",
                password_hash=get_password_hash("employer123"),
                business_id="29AABCU9603R1ZZ",
                business_type="Facility Management",
                location={
                    "state": "Karnataka",
                    "city": "Bangalore",
                    "pincode": "560066",
                    "address": "Electronic City, Bangalore"
                },
                is_verified=True,
                rating=4.1,
                posted_jobs=18,
                completed_projects=15
            )
        ]
        
        for employer in employers:
            db.add(employer)
        db.commit()
        
        # Refresh to get IDs
        db.refresh(users[0])
        db.refresh(users[1])
        db.refresh(users[2])
        db.refresh(employers[0])
        db.refresh(employers[1])
        db.refresh(employers[2])
        
        # Create mock job posts
        job_posts = [
            JobPost(
                employer_id=employers[0].id,
                title="Construction Workers Needed - Residential Building",
                description="We are looking for experienced construction workers for a residential building project. Work includes foundation, masonry, and general construction tasks.",
                category="Construction",
                work_details={
                    "location": {
                        "address": "Whitefield, Bangalore",
                        "city": "Bangalore",
                        "state": "Karnataka",
                        "pincode": "560066"
                    },
                    "start_date": (datetime.now() + timedelta(days=7)).isoformat(),
                    "end_date": (datetime.now() + timedelta(days=67)).isoformat(),
                    "duration": "2 months",
                    "working_hours": "8 AM - 5 PM",
                    "urgency": "medium"
                },
                payment={
                    "rate_type": "daily",
                    "rate": 550,
                    "currency": "INR",
                    "payment_terms": "Weekly payment",
                    "negotiable": False
                },
                requirements={
                    "skills": ["Masonry", "Construction", "Brick laying"],
                    "experience": 3,
                    "tools": ["Basic construction tools"],
                    "certifications": []
                },
                status="published"
            ),
            JobPost(
                employer_id=employers[1].id,
                title="Domestic Cleaning Staff - Multiple Locations",
                description="Seeking reliable domestic cleaning staff for multiple residential locations. Flexible working hours and competitive pay.",
                category="Cleaning",
                work_details={
                    "location": {
                        "address": "Various locations in Bangalore",
                        "city": "Bangalore",
                        "state": "Karnataka",
                        "pincode": "560001"
                    },
                    "start_date": (datetime.now() + timedelta(days=3)).isoformat(),
                    "end_date": None,
                    "duration": "Ongoing",
                    "working_hours": "Flexible (6 AM - 12 PM preferred)",
                    "urgency": "high"
                },
                payment={
                    "rate_type": "hourly",
                    "rate": 50,
                    "currency": "INR",
                    "payment_terms": "Bi-weekly payment",
                    "negotiable": True
                },
                requirements={
                    "skills": ["Cleaning", "House keeping"],
                    "experience": 1,
                    "tools": ["Cleaning supplies provided"],
                    "certifications": []
                },
                status="published"
            ),
            JobPost(
                employer_id=employers[2].id,
                title="Electrical Maintenance - Tech Park",
                description="Electrical maintenance work for a tech park. Must have experience in commercial electrical systems.",
                category="Electrical",
                work_details={
                    "location": {
                        "address": "Electronic City Phase 1, Bangalore",
                        "city": "Bangalore",
                        "state": "Karnataka",
                        "pincode": "560100"
                    },
                    "start_date": (datetime.now() + timedelta(days=14)).isoformat(),
                    "end_date": (datetime.now() + timedelta(days=44)).isoformat(),
                    "duration": "1 month",
                    "working_hours": "9 AM - 6 PM",
                    "urgency": "low"
                },
                payment={
                    "rate_type": "daily",
                    "rate": 750,
                    "currency": "INR",
                    "payment_terms": "Monthly payment",
                    "negotiable": False
                },
                requirements={
                    "skills": ["Electrical", "Maintenance", "Commercial systems"],
                    "experience": 5,
                    "tools": ["Electrical tools required"],
                    "certifications": ["Electrical certification preferred"]
                },
                status="published"
            )
        ]
        
        for job_post in job_posts:
            db.add(job_post)
        db.commit()
        
        # Refresh job posts to get IDs
        for job_post in job_posts:
            db.refresh(job_post)
        
        # Create mock contracts
        contracts = [
            Contract(
                title="House Renovation - Masonry Work",
                description="Masonry work for house renovation including wall construction and repair work.",
                employer_id=employers[0].id,
                work_details={
                    "location": {
                        "address": "Koramangala, Bangalore",
                        "city": "Bangalore",
                        "state": "Karnataka",
                        "pincode": "560034"
                    },
                    "start_date": (datetime.now() - timedelta(days=10)).isoformat(),
                    "end_date": (datetime.now() + timedelta(days=20)).isoformat(),
                    "duration": "1 month",
                    "working_hours": "8 AM - 4 PM"
                },
                payment={
                    "rate_type": "daily",
                    "rate": 500,
                    "currency": "INR",
                    "payment_terms": "Weekly payment"
                },
                requirements={
                    "skills": ["Masonry", "Construction"],
                    "experience": 5,
                    "tools": ["Basic masonry tools"]
                },
                status="in-progress",
                accepted_by=users[0].id,
                fairness_score=8.5,
                is_minimum_wage_compliant=True,
                work_tracking={
                    "totalHoursWorked": 80,
                    "daysWorked": 10,
                    "estimatedTotalHours": 200
                },
                payment_tracking={
                    "totalDue": 5000,
                    "totalReceived": 3500,
                    "pendingAmount": 1500,
                    "lastPaymentDate": (datetime.now() - timedelta(days=3)).isoformat()
                }
            ),
            Contract(
                title="Office Cleaning - Daily Service",
                description="Daily office cleaning service for a small office space.",
                employer_id=employers[1].id,
                work_details={
                    "location": {
                        "address": "Brigade Road, Bangalore",
                        "city": "Bangalore",
                        "state": "Karnataka",
                        "pincode": "560025"
                    },
                    "start_date": (datetime.now() - timedelta(days=20)).isoformat(),
                    "end_date": (datetime.now() + timedelta(days=40)).isoformat(),
                    "duration": "2 months",
                    "working_hours": "8 AM - 11 AM"
                },
                payment={
                    "rate_type": "daily",
                    "rate": 200,
                    "currency": "INR",
                    "payment_terms": "Weekly payment"
                },
                requirements={
                    "skills": ["Cleaning", "Office maintenance"],
                    "experience": 2,
                    "tools": ["Cleaning supplies provided"]
                },
                status="in-progress",
                accepted_by=users[1].id,
                fairness_score=7.8,
                is_minimum_wage_compliant=True,
                work_tracking={
                    "totalHoursWorked": 60,
                    "daysWorked": 20,
                    "estimatedTotalHours": 120
                },
                payment_tracking={
                    "totalDue": 4000,
                    "totalReceived": 4000,
                    "pendingAmount": 0,
                    "lastPaymentDate": (datetime.now() - timedelta(days=1)).isoformat()
                }
            )
        ]
        
        for contract in contracts:
            db.add(contract)
        db.commit()
        
        # Create mock applications
        applications = [
            ContractApplication(
                job_id=job_posts[0].id,
                worker_id=users[0].id,
                worker_name=users[0].name,
                status="applied",
                original_wage=550,
                proposed_wage=600,
                message="I have 8 years of experience in construction and masonry work. I can start immediately.",
                proposed_message="I would like to propose ₹600/day based on my experience level.",
                worker_profile={
                    "experience": "8 years",
                    "skills": ["Masonry", "Construction", "Brick laying"],
                    "rating": 4.2,
                    "completedJobs": 15
                }
            ),
            ContractApplication(
                job_id=job_posts[1].id,
                worker_id=users[1].id,
                worker_name=users[1].name,
                status="accepted",
                original_wage=50,
                message="I have 5 years of experience in domestic cleaning and I'm available for flexible hours.",
                worker_profile={
                    "experience": "5 years",
                    "skills": ["Cleaning", "House keeping", "Deep cleaning"],
                    "rating": 4.7,
                    "completedJobs": 32
                }
            ),
            ContractApplication(
                job_id=job_posts[2].id,
                worker_id=users[2].id,
                worker_name=users[2].name,
                status="applied",
                original_wage=750,
                message="I have 12 years of experience in electrical work including commercial systems.",
                worker_profile={
                    "experience": "12 years",
                    "skills": ["Electrical", "Maintenance", "Commercial systems"],
                    "rating": 4.5,
                    "completedJobs": 28
                }
            )
        ]
        
        for application in applications:
            db.add(application)
        db.commit()
        
        print("✅ Database seeded successfully with mock data!")
        print(f"Created {len(users)} users, {len(employers)} employers, {len(job_posts)} job posts, {len(contracts)} contracts, {len(applications)} applications")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()