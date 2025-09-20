#!/usr/bin/env python3
"""Quick test to verify live data scraping"""

from olx_job_scraper import scrape_olx_jobs_kochi

def test_live_scraping():
    print("🔍 Testing live data scraping from OLX...")
    print("=" * 50)
    
    try:
        # Scrape just 1 page to test quickly
        jobs = scrape_olx_jobs_kochi(max_pages=1)
        
        print(f"✅ Successfully scraped {len(jobs)} live jobs!")
        print("\n📋 Sample of live job data:")
        print("-" * 50)
        
        for i, job in enumerate(jobs[:5], 1):
            title = job['title'][:50] + "..." if len(job['title']) > 50 else job['title']
            print(f"{i}. 🏢 {title}")
            print(f"   📍 {job['location']}")
            print(f"   💰 {job['salary']}")
            print(f"   🔗 {job['link'][:60]}...")
            print()
            
        if len(jobs) > 5:
            print(f"... and {len(jobs) - 5} more jobs")
            
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_live_scraping()