"""
Test and demonstration script for OLX Job Scraper
This script shows how the scraper works and provides a demo with sample data
"""

from olx_job_scraper import scrape_olx_jobs_kochi
import json


def create_sample_data():
    """Create sample job data to demonstrate the expected output format"""
    return [
        {
            "title": "Salon Worker",
            "location": "Edapally, Kochi",
            "salary": "₹12,000 - ₹15,000",
            "link": "https://www.olx.in/item/salon-worker-full-time-in-edapally-kochi-iid-1234567890"
        },
        {
            "title": "Cook Required for Restaurant",
            "location": "Ernakulam HPO, Kochi",
            "salary": None,
            "link": "https://www.olx.in/item/cook-required-restaurant-full-time-in-ernakulam-hpo-kochi-iid-1234567891"
        },
        {
            "title": "Data Entry Operator",
            "location": "MG Road, Kochi",
            "salary": "₹18,000 - ₹22,000",
            "link": "https://www.olx.in/item/data-entry-operator-full-time-in-mg-road-kochi-iid-1234567892"
        },
        {
            "title": "Delivery Boy for Food Service",
            "location": "Fort Kochi, Kochi",
            "salary": "₹15,000 - ₹25,000",
            "link": "https://www.olx.in/item/delivery-boy-food-service-part-time-in-fort-kochi-kochi-iid-1234567893"
        },
        {
            "title": "Receptionist Required",
            "location": "Kakkanad, Kochi",
            "salary": "₹16,000 - ₹20,000",
            "link": "https://www.olx.in/item/receptionist-required-full-time-in-kakkanad-kochi-iid-1234567894"
        }
    ]


def test_scraper():
    """Test the scraper functionality"""
    print("=" * 80)
    print("OLX Jobs Scraper Test for Kochi, Kerala")
    print("=" * 80)
    
    try:
        print("\nAttempting to scrape live data from OLX...")
        jobs = scrape_olx_jobs_kochi(max_pages=1)
        
        if jobs:
            print(f"✅ Successfully scraped {len(jobs)} job listings!")
            display_jobs(jobs)
        else:
            print("⚠️  No jobs found or network issue. Showing sample data format:")
            sample_jobs = create_sample_data()
            display_jobs(sample_jobs)
            
    except Exception as e:
        print(f"❌ Error during scraping: {e}")
        print("\n🔧 Showing sample data format that would be returned:")
        sample_jobs = create_sample_data()
        display_jobs(sample_jobs)


def display_jobs(jobs):
    """Display job listings in a formatted way"""
    print(f"\n📋 Job Listings ({len(jobs)} total):")
    print("-" * 80)
    
    for i, job in enumerate(jobs, 1):
        print(f"{i}. 🏢 Title: {job['title']}")
        print(f"   📍 Location: {job['location']}")
        print(f"   💰 Salary: {job['salary'] if job['salary'] else 'Not specified'}")
        print(f"   🔗 Link: {job['link']}")
        print("-" * 80)


def save_to_json(jobs, filename="kochi_jobs.json"):
    """Save job data to JSON file"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(jobs, f, indent=2, ensure_ascii=False)
        print(f"✅ Jobs saved to {filename}")
    except Exception as e:
        print(f"❌ Error saving to file: {e}")


def demonstrate_api_usage():
    """Demonstrate how to use the scraper as an API"""
    print("\n" + "=" * 80)
    print("API Usage Demonstration")
    print("=" * 80)
    
    print("\n🔧 Code example:")
    print("""
from olx_job_scraper import scrape_olx_jobs_kochi

# Scrape jobs (returns list of dictionaries)
jobs = scrape_olx_jobs_kochi(max_pages=3)

# Process the results
for job in jobs:
    print(f"Title: {job['title']}")
    print(f"Location: {job['location']}")
    print(f"Salary: {job['salary']}")
    print(f"Link: {job['link']}")
    print("-" * 40)
""")

    print("\n📊 Expected output format:")
    sample = create_sample_data()
    print(json.dumps(sample[0], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    test_scraper()
    
    # Save sample data for demonstration
    sample_jobs = create_sample_data()
    save_to_json(sample_jobs, "sample_kochi_jobs.json")
    
    demonstrate_api_usage()
    
    print("\n✨ Scraper features:")
    print("  ✅ Extracts job title, location, salary, and link")
    print("  ✅ Handles missing salary information gracefully")
    print("  ✅ Robust error handling for network issues")
    print("  ✅ Respectful delays between requests")
    print("  ✅ Configurable number of pages to scrape")
    print("  ✅ Clean, structured data output")