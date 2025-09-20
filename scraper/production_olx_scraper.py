"""
Final production-ready OLX Job Scraper
This version provides clean, well-formatted job data
"""

from improved_olx_scraper import ImprovedOLXScraper
import re
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class ProductionOLXScraper(ImprovedOLXScraper):
    """Production-ready scraper with improved data cleaning"""
    
    def clean_job_data(self, job: Dict[str, str]) -> Optional[Dict[str, str]]:
        """Clean and standardize job data"""
        try:
            # Clean title
            title = job.get('title', '').strip()
            if not title:
                return None
            
            # Remove common prefixes and clean up
            title = re.sub(r'^(Featured\s*\|\s*)?₹.*?\|\s*', '', title, flags=re.IGNORECASE)
            title = re.sub(r'^\s*\|\s*', '', title)
            title = re.sub(r'^(Monthly|Weekly|Daily|Hourly)\s*', '', title, flags=re.IGNORECASE)
            title = re.sub(r'(Today|Yesterday|\d+\s*days?\s*ago)$', '', title, flags=re.IGNORECASE)
            title = re.sub(r'\s+', ' ', title).strip()
            
            # Extract location more accurately
            location = job.get('location', 'Kochi').strip()
            
            # If location contains multiple parts, extract the main area
            if ',' in location:
                location_parts = [part.strip() for part in location.split(',')]
                # Take the first meaningful location (not just "Kochi")
                for part in location_parts:
                    if part and part.lower() != 'kochi' and len(part) > 2:
                        location = f"{part}, Kochi"
                        break
                else:
                    location = "Kochi"
            elif location.lower() == 'kochi':
                location = "Kochi"
            else:
                if 'kochi' not in location.lower():
                    location = f"{location}, Kochi"
            
            # Clean salary
            salary = job.get('salary')
            if salary:
                # Standardize salary format
                salary = re.sub(r'₹\s*', '₹', salary)
                salary = re.sub(r'\s+-\s+', ' - ', salary)
            
            # Validate link
            link = job.get('link', '')
            if not link or not link.startswith('http'):
                return None
            
            return {
                'title': title[:100],  # Limit title length
                'location': location,
                'salary': salary,
                'link': link
            }
            
        except Exception as e:
            logger.debug(f"Error cleaning job data: {e}")
            return None
    
    def scrape_jobs(self, max_pages: int = 2) -> List[Dict[str, str]]:
        """Scrape and clean job data"""
        raw_jobs = super().scrape_jobs(max_pages)
        
        cleaned_jobs = []
        for job in raw_jobs:
            cleaned_job = self.clean_job_data(job)
            if cleaned_job and cleaned_job['title'].strip():
                cleaned_jobs.append(cleaned_job)
        
        logger.info(f"Cleaned data: {len(cleaned_jobs)} valid jobs from {len(raw_jobs)} raw entries")
        return cleaned_jobs


def scrape_olx_jobs_production(max_pages: int = 3) -> List[Dict[str, str]]:
    """
    Production-ready OLX job scraper for Kochi, Kerala
    
    Args:
        max_pages: Maximum number of pages to scrape (default: 3)
        
    Returns:
        List of cleaned job dictionaries with format:
        [
            {
                "title": "Job Title",
                "location": "Area, Kochi", 
                "salary": "₹15,000 - ₹20,000" or None,
                "link": "https://www.olx.in/..."
            }
        ]
    """
    scraper = ProductionOLXScraper()
    return scraper.scrape_jobs(max_pages)


if __name__ == "__main__":
    print("🔍 OLX Jobs Scraper for Kochi, Kerala")
    print("=" * 50)
    
    try:
        # Scrape jobs
        jobs = scrape_olx_jobs_production(max_pages=2)
        
        if jobs:
            print(f"✅ Successfully found {len(jobs)} job listings!")
            print("-" * 50)
            
            # Display results
            for i, job in enumerate(jobs[:15], 1):
                print(f"{i:2d}. 🏢 {job['title']}")
                print(f"     📍 {job['location']}")
                print(f"     💰 {job['salary'] or 'Salary not specified'}")
                print(f"     🔗 {job['link']}")
                print()
            
            if len(jobs) > 15:
                print(f"... and {len(jobs) - 15} more jobs")
            
            print(f"\n📊 Summary:")
            print(f"   Total jobs found: {len(jobs)}")
            
            # Count jobs with salary info
            with_salary = sum(1 for job in jobs if job['salary'])
            print(f"   Jobs with salary info: {with_salary}")
            
            # Count unique locations
            locations = set(job['location'] for job in jobs)
            print(f"   Unique locations: {len(locations)}")
            
            print(f"\n🎯 Top locations:")
            from collections import Counter
            location_counts = Counter(job['location'] for job in jobs)
            for location, count in location_counts.most_common(5):
                print(f"   {location}: {count} jobs")
                
        else:
            print("❌ No jobs found.")
            print("This could be due to:")
            print("   • Website blocking automated requests")
            print("   • Network connectivity issues")
            print("   • Website structure changes")
            print("   • Rate limiting")
            
    except Exception as e:
        print(f"❌ Error occurred: {e}")
        import traceback
        traceback.print_exc()