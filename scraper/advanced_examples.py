"""
Advanced Usage Examples for OLX Job Scraper
This script demonstrates various ways to use and analyze the scraped job data
"""

from olx_job_scraper import scrape_olx_jobs_kochi
import json
import re
from collections import Counter
from typing import List, Dict


def filter_jobs_by_salary_range(jobs: List[Dict], min_salary: int = 15000) -> List[Dict]:
    """Filter jobs by minimum salary"""
    filtered_jobs = []
    
    for job in jobs:
        if job['salary']:
            # Extract numbers from salary string
            numbers = re.findall(r'₹\s*(\d+,?\d*)', job['salary'])
            if numbers:
                # Convert to int (remove commas)
                salary_values = [int(num.replace(',', '')) for num in numbers]
                min_job_salary = min(salary_values)
                
                if min_job_salary >= min_salary:
                    filtered_jobs.append(job)
    
    return filtered_jobs


def filter_jobs_by_location(jobs: List[Dict], location_keywords: List[str]) -> List[Dict]:
    """Filter jobs by location keywords"""
    filtered_jobs = []
    
    for job in jobs:
        location = job['location'].lower()
        if any(keyword.lower() in location for keyword in location_keywords):
            filtered_jobs.append(job)
    
    return filtered_jobs


def filter_jobs_by_title(jobs: List[Dict], title_keywords: List[str]) -> List[Dict]:
    """Filter jobs by title keywords"""
    filtered_jobs = []
    
    for job in jobs:
        title = job['title'].lower()
        if any(keyword.lower() in title for keyword in title_keywords):
            filtered_jobs.append(job)
    
    return filtered_jobs


def analyze_job_categories(jobs: List[Dict]) -> Dict[str, int]:
    """Analyze job categories based on title keywords"""
    categories = {
        'Delivery/Driver': ['delivery', 'driver', 'courier'],
        'Sales/Marketing': ['sales', 'marketing', 'telecaller'],
        'Data Entry/Office': ['data entry', 'office', 'admin', 'receptionist'],
        'Food/Hospitality': ['cook', 'chef', 'restaurant', 'hotel', 'waiter'],
        'Healthcare': ['nurse', 'doctor', 'medical', 'healthcare'],
        'IT/Software': ['developer', 'programmer', 'software', 'it'],
        'Education': ['teacher', 'tutor', 'education', 'trainer'],
        'Other': []
    }
    
    category_counts = {cat: 0 for cat in categories.keys()}
    
    for job in jobs:
        title = job['title'].lower()
        categorized = False
        
        for category, keywords in categories.items():
            if category == 'Other':
                continue
            
            if any(keyword in title for keyword in keywords):
                category_counts[category] += 1
                categorized = True
                break
        
        if not categorized:
            category_counts['Other'] += 1
    
    return category_counts


def analyze_salary_distribution(jobs: List[Dict]) -> Dict[str, int]:
    """Analyze salary distribution"""
    salary_ranges = {
        'Below ₹15,000': 0,
        '₹15,000 - ₹25,000': 0,
        '₹25,000 - ₹35,000': 0,
        'Above ₹35,000': 0,
        'Not Specified': 0
    }
    
    for job in jobs:
        if not job['salary']:
            salary_ranges['Not Specified'] += 1
            continue
        
        # Extract numbers from salary string
        numbers = re.findall(r'₹\s*(\d+,?\d*)', job['salary'])
        if numbers:
            # Convert to int (remove commas) and get the average
            salary_values = [int(num.replace(',', '')) for num in numbers]
            avg_salary = sum(salary_values) / len(salary_values)
            
            if avg_salary < 15000:
                salary_ranges['Below ₹15,000'] += 1
            elif avg_salary < 25000:
                salary_ranges['₹15,000 - ₹25,000'] += 1
            elif avg_salary < 35000:
                salary_ranges['₹25,000 - ₹35,000'] += 1
            else:
                salary_ranges['Above ₹35,000'] += 1
        else:
            salary_ranges['Not Specified'] += 1
    
    return salary_ranges


def get_top_locations(jobs: List[Dict], top_n: int = 5) -> List[tuple]:
    """Get top N locations by job count"""
    locations = [job['location'] for job in jobs]
    location_counts = Counter(locations)
    return location_counts.most_common(top_n)


def create_sample_analysis_data():
    """Create comprehensive sample data for analysis demonstration"""
    return [
        {"title": "Delivery Boy for Swiggy", "location": "Edapally, Kochi", "salary": "₹15,000 - ₹25,000", "link": "https://www.olx.in/item/delivery-1"},
        {"title": "Sales Executive", "location": "MG Road, Kochi", "salary": "₹18,000 - ₹22,000", "link": "https://www.olx.in/item/sales-1"},
        {"title": "Data Entry Operator", "location": "Kakkanad, Kochi", "salary": "₹12,000 - ₹16,000", "link": "https://www.olx.in/item/data-1"},
        {"title": "Cook Required", "location": "Fort Kochi, Kochi", "salary": None, "link": "https://www.olx.in/item/cook-1"},
        {"title": "Software Developer", "location": "Infopark, Kochi", "salary": "₹35,000 - ₹50,000", "link": "https://www.olx.in/item/dev-1"},
        {"title": "Receptionist", "location": "Ernakulam HPO, Kochi", "salary": "₹15,000 - ₹18,000", "link": "https://www.olx.in/item/recep-1"},
        {"title": "Driver for Private Company", "location": "Palarivattom, Kochi", "salary": "₹20,000 - ₹25,000", "link": "https://www.olx.in/item/driver-1"},
        {"title": "Marketing Executive", "location": "Edapally, Kochi", "salary": "₹22,000 - ₹28,000", "link": "https://www.olx.in/item/marketing-1"},
        {"title": "Teacher for Tuition Centre", "location": "Kaloor, Kochi", "salary": "₹25,000 - ₹30,000", "link": "https://www.olx.in/item/teacher-1"},
        {"title": "Office Assistant", "location": "MG Road, Kochi", "salary": "₹14,000 - ₹17,000", "link": "https://www.olx.in/item/office-1"},
        {"title": "Telecaller", "location": "Kakkanad, Kochi", "salary": "₹16,000 - ₹20,000", "link": "https://www.olx.in/item/tele-1"},
        {"title": "Restaurant Waiter", "location": "Marine Drive, Kochi", "salary": "₹13,000 - ₹16,000", "link": "https://www.olx.in/item/waiter-1"},
    ]


def main():
    """Main function demonstrating all features"""
    print("=" * 80)
    print("OLX Jobs Scraper - Advanced Usage Examples")
    print("=" * 80)
    
    # Try to get real data, fallback to sample data
    try:
        print("\n🔄 Attempting to scrape live data...")
        jobs = scrape_olx_jobs_kochi(max_pages=1)
        
        if not jobs:
            print("📋 Using sample data for demonstration...")
            jobs = create_sample_analysis_data()
    except Exception as e:
        print(f"⚠️  Error scraping: {e}")
        print("📋 Using sample data for demonstration...")
        jobs = create_sample_analysis_data()
    
    print(f"\n📊 Analyzing {len(jobs)} job listings...")
    
    # 1. Filter by salary
    print("\n" + "="*50)
    print("💰 HIGH-PAYING JOBS (₹20,000+)")
    print("="*50)
    high_paying_jobs = filter_jobs_by_salary_range(jobs, min_salary=20000)
    
    for job in high_paying_jobs[:5]:
        print(f"• {job['title']} - {job['salary']} - {job['location']}")
    
    # 2. Filter by location
    print("\n" + "="*50)
    print("📍 JOBS IN TECH HUBS (Infopark, Kakkanad)")
    print("="*50)
    tech_hub_jobs = filter_jobs_by_location(jobs, ['infopark', 'kakkanad'])
    
    for job in tech_hub_jobs:
        print(f"• {job['title']} - {job['location']}")
    
    # 3. Filter by job type
    print("\n" + "="*50)
    print("🚗 DELIVERY & DRIVER JOBS")
    print("="*50)
    delivery_jobs = filter_jobs_by_title(jobs, ['delivery', 'driver'])
    
    for job in delivery_jobs:
        print(f"• {job['title']} - {job['salary'] or 'Salary not specified'}")
    
    # 4. Job category analysis
    print("\n" + "="*50)
    print("📈 JOB CATEGORY DISTRIBUTION")
    print("="*50)
    categories = analyze_job_categories(jobs)
    
    for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / len(jobs)) * 100
        print(f"{category:20} : {count:3} jobs ({percentage:5.1f}%)")
    
    # 5. Salary distribution
    print("\n" + "="*50)
    print("💵 SALARY DISTRIBUTION")
    print("="*50)
    salary_dist = analyze_salary_distribution(jobs)
    
    for salary_range, count in salary_dist.items():
        percentage = (count / len(jobs)) * 100
        print(f"{salary_range:20} : {count:3} jobs ({percentage:5.1f}%)")
    
    # 6. Top locations
    print("\n" + "="*50)
    print("🗺️  TOP LOCATIONS")
    print("="*50)
    top_locations = get_top_locations(jobs, top_n=5)
    
    for location, count in top_locations:
        percentage = (count / len(jobs)) * 100
        print(f"{location:25} : {count:3} jobs ({percentage:5.1f}%)")
    
    # 7. Save filtered data
    print("\n" + "="*50)
    print("💾 SAVING FILTERED DATA")
    print("="*50)
    
    # Save different filtered datasets
    datasets = {
        'all_jobs.json': jobs,
        'high_paying_jobs.json': high_paying_jobs,
        'tech_hub_jobs.json': tech_hub_jobs,
        'delivery_jobs.json': delivery_jobs
    }
    
    for filename, data in datasets.items():
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"✅ Saved {len(data)} jobs to {filename}")
        except Exception as e:
            print(f"❌ Error saving {filename}: {e}")
    
    print("\n" + "="*80)
    print("✨ ANALYSIS COMPLETE!")
    print("="*80)
    print("📁 Generated Files:")
    print("  • all_jobs.json - Complete job dataset")
    print("  • high_paying_jobs.json - Jobs with salary ≥₹20,000")
    print("  • tech_hub_jobs.json - Jobs in tech areas")
    print("  • delivery_jobs.json - Delivery and driver positions")


if __name__ == "__main__":
    main()