#!/usr/bin/env python3
"""Check the exact format of scraped job listings"""

from olx_job_scraper import scrape_olx_jobs_kochi
import json

def check_format():
    print("🔍 Checking OLX job listing format...")
    print("=" * 60)
    
    # Get a sample of jobs
    jobs = scrape_olx_jobs_kochi(max_pages=1)
    
    if jobs:
        print(f"✅ Found {len(jobs)} jobs")
        print("\n📋 Sample Job Structure:")
        print("-" * 40)
        
        # Show first job in detail
        sample_job = jobs[0]
        print("Raw job data structure:")
        for key, value in sample_job.items():
            print(f"  {key}: {value}")
        
        print("\n" + "=" * 60)
        print("📄 Formatted Display (as shown to users):")
        print("-" * 40)
        
        for i, job in enumerate(jobs[:3], 1):
            print(f"{i}. 🏢 {job['title']}")
            print(f"   📍 {job['location']}")
            print(f"   💰 {job['salary']}")
            print(f"   🔗 {job['link']}")
            print()
        
        print("✅ Format confirmed: Title → Location → Salary → Link")
        
        # Save sample to JSON for inspection
        with open('sample_format.json', 'w', encoding='utf-8') as f:
            json.dump(jobs[:3], f, indent=2, ensure_ascii=False)
        print("📁 Sample saved to 'sample_format.json'")
        
    else:
        print("❌ No jobs found")

if __name__ == "__main__":
    check_format()