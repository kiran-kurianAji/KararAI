"""
OLX Jobs Scraper for Kochi, Kerala
This module scrapes job listings from OLX Jobs website specifically for Kochi location.
"""

import requests
from bs4 import BeautifulSoup
import re
import time
from typing import List, Dict, Optional
import logging
import random
from urllib.parse import urljoin
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OLXJobScraper:
    """Scraper class for OLX Jobs in Kochi, Kerala"""
    
    def __init__(self):
        self.base_url = "https://www.olx.in/kochi_g4058873/jobs_c4"
        self.session = requests.Session()
        
        # Rotate between different user agents
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
        
        self.base_headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Connection': 'keep-alive'
        }
        
        # Initialize session with base configuration
        self.session.headers.update(self.base_headers)
        self.session.verify = False  # Disable SSL verification if needed
    
    def get_random_headers(self):
        """Get randomized headers to avoid detection"""
        headers = self.base_headers.copy()
        headers['User-Agent'] = random.choice(self.user_agents)
        return headers
    
    def make_request(self, url: str, max_retries: int = 3) -> Optional[requests.Response]:
        """Make a request with anti-detection measures"""
        for attempt in range(max_retries):
            try:
                # Randomize headers for each request
                headers = self.get_random_headers()
                self.session.headers.update(headers)
                
                # Add random delay to mimic human behavior
                if attempt > 0:
                    delay = random.uniform(3, 8)
                    logger.info(f"Waiting {delay:.1f} seconds before retry...")
                    time.sleep(delay)
                
                logger.info(f"Making request to {url} (attempt {attempt + 1})...")
                
                # Make request with longer timeout
                response = self.session.get(
                    url, 
                    timeout=45,
                    allow_redirects=True
                )
                
                # Check if we got a valid response
                if response.status_code == 200:
                    logger.info(f"Successfully fetched page (status: {response.status_code})")
                    return response
                elif response.status_code == 403:
                    logger.warning(f"Access forbidden (403) - website may be blocking requests")
                    time.sleep(random.uniform(5, 10))
                elif response.status_code == 429:
                    logger.warning(f"Rate limited (429) - waiting longer...")
                    time.sleep(random.uniform(10, 20))
                else:
                    logger.warning(f"Unexpected status code: {response.status_code}")
                    
            except requests.exceptions.SSLError as e:
                logger.warning(f"SSL error (attempt {attempt + 1}): {e}")
            except requests.exceptions.ConnectionError as e:
                logger.warning(f"Connection error (attempt {attempt + 1}): {e}")
            except requests.exceptions.Timeout as e:
                logger.warning(f"Timeout error (attempt {attempt + 1}): {e}")
            except Exception as e:
                logger.warning(f"Unexpected error (attempt {attempt + 1}): {e}")
                
        logger.error(f"Failed to fetch {url} after {max_retries} attempts")
        return None
        """Extract and clean salary information from text"""
        try:
            if not salary_text:
                return None
            
            # Clean up the salary text
            salary_text = salary_text.strip()
            
            # Look for patterns like "₹ 15000 - 20000 | Monthly"
            salary_pattern = r'₹\s*[\d,]+'
            matches = re.findall(salary_pattern, salary_text)
            
            if matches:
                if len(matches) >= 2:
                    # Range format: ₹15000 - ₹20000
                    return f"{matches[0]} - {matches[1]}"
                else:
                    # Single value
                    return matches[0]
            
            return None
        except Exception as e:
            logger.warning(f"Error extracting salary: {e}")
            return None
    
    def extract_location_from_title(self, title_text: str) -> Optional[str]:
        """Extract location from the job title/description"""
        try:
            # Look for location patterns at the end of title
            # Format usually: "JOB TITLE LOCATION, KOCHI"
            if ',' in title_text:
                parts = title_text.split(',')
                if len(parts) >= 2:
                    location = parts[-1].strip()
                    # If it contains KOCHI, take the second last part
                    if 'KOCHI' in location.upper():
                        if len(parts) >= 2:
                            return parts[-2].strip()
                    return location
            
            # Fallback to Kochi if no specific location found
            return "Kochi"
        except Exception as e:
            logger.warning(f"Error extracting location: {e}")
            return "Kochi"
    
    def scrape_job_listings(self, max_pages: int = 3) -> List[Dict[str, str]]:
        """
        Scrape job listings from OLX Jobs Kochi
        
        Args:
            max_pages: Maximum number of pages to scrape
            
        Returns:
            List of dictionaries containing job information
        """
        all_jobs = []
        
        # First, try to access the main page to establish session
        logger.info("Establishing session with OLX...")
        main_response = self.make_request("https://www.olx.in/")
        
        if main_response is None:
            logger.error("Could not establish initial connection to OLX")
            return all_jobs
        
        # Add a delay after initial connection
        time.sleep(random.uniform(3, 6))
        
        for page in range(1, max_pages + 1):
            try:
                logger.info(f"Scraping page {page}...")
                
                # Construct URL for the current page
                url = f"{self.base_url}?page={page}" if page > 1 else self.base_url
                
                # Make request with improved handling
                response = self.make_request(url)
                
                if response is None:
                    logger.error(f"Failed to fetch page {page}")
                    continue
                
                # Parse HTML
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Check if we got blocked or redirected
                if "blocked" in response.text.lower() or "captcha" in response.text.lower():
                    logger.error("Detected blocking or CAPTCHA - stopping scrape")
                    break
                
                # Try multiple selectors to find job listings
                job_links = []
                
                # Method 1: Look for job item links
                job_links.extend(soup.find_all('a', href=re.compile(r'/item/.*-iid-\d+')))
                
                # Method 2: Look for listing cards
                if not job_links:
                    cards = soup.find_all('div', class_=re.compile(r'.*card.*|.*listing.*', re.I))
                    for card in cards:
                        links = card.find_all('a', href=True)
                        job_links.extend([link for link in links if '/item/' in link.get('href', '')])
                
                # Method 3: Look for any links with job-like patterns
                if not job_links:
                    all_links = soup.find_all('a', href=True)
                    job_links = [link for link in all_links if re.search(r'/item/.*-c\d+.*-iid-\d+', link.get('href', ''))]
                
                logger.info(f"Found {len(job_links)} potential job links on page {page}")
                
                if not job_links:
                    logger.warning(f"No job links found on page {page}. Page structure may have changed.")
                    # Save page content for debugging
                    with open(f'debug_page_{page}.html', 'w', encoding='utf-8') as f:
                        f.write(response.text)
                    logger.info(f"Saved page content to debug_page_{page}.html for analysis")
                
                page_jobs = 0
                for link in job_links:
                    try:
                        job_data = self.extract_job_data(link)
                        if job_data:
                            all_jobs.append(job_data)
                            page_jobs += 1
                    except Exception as e:
                        logger.warning(f"Error processing job link: {e}")
                        continue
                
                logger.info(f"Successfully extracted {page_jobs} jobs from page {page}")
                
                # Add longer delay between pages to avoid rate limiting
                if page < max_pages:
                    delay = random.uniform(5, 10)
                    logger.info(f"Waiting {delay:.1f} seconds before next page...")
                    time.sleep(delay)
                
            except Exception as e:
                logger.error(f"Unexpected error on page {page}: {e}")
                continue
        
        logger.info(f"Scraped {len(all_jobs)} jobs total")
        return all_jobs
    
    def extract_job_data(self, link_element) -> Optional[Dict[str, str]]:
        """Extract job data from a single job link element"""
        try:
            # Get the job URL
            job_url = link_element.get('href')
            if not job_url:
                return None
            
            # Make URL absolute
            if job_url.startswith('/'):
                job_url = f"https://www.olx.in{job_url}"
            
            # Extract text content from the link
            link_text = link_element.get_text(strip=True)
            
            if not link_text:
                return None
            
            # Parse the job title and other info from the link text
            # Format is usually: "₹ 15000 - 20000 | Monthly JOB TITLE LOCATION, KOCHI DATE"
            
            title = None
            salary = None
            location = "Kochi"  # Default location
            
            # Split by common delimiters to extract information
            parts = link_text.split('|')
            
            if len(parts) >= 2:
                # First part usually contains salary
                salary_part = parts[0].strip()
                salary = self.extract_salary(salary_part)
                
                # Second part contains title and location
                title_location_part = parts[1].strip()
                
                # Remove common date patterns from the end
                title_location_part = re.sub(r'\b(TODAY|YESTERDAY|\d+ DAYS? AGO|\w{3} \d{1,2})\s*$', '', title_location_part, flags=re.IGNORECASE).strip()
                
                # Extract location from title
                location = self.extract_location_from_title(title_location_part)
                
                # Extract title (remove location part)
                if ',' in title_location_part:
                    title_parts = title_location_part.split(',')
                    title = title_parts[0].strip()
                else:
                    title = title_location_part
            else:
                # Fallback: use entire text as title
                title = link_text
                title = re.sub(r'\b(TODAY|YESTERDAY|\d+ DAYS? AGO|\w{3} \d{1,2})\s*$', '', title, flags=re.IGNORECASE).strip()
            
            # Clean up title
            if title:
                title = re.sub(r'^₹.*?\|', '', title).strip()  # Remove salary prefix
                title = title[:100]  # Limit title length
            
            if not title:
                return None
            
            return {
                'title': title,
                'location': location,
                'salary': salary,
                'link': job_url
            }
            
        except Exception as e:
            logger.warning(f"Error extracting job data: {e}")
            return None


def scrape_olx_jobs_kochi(max_pages: int = 3) -> List[Dict[str, str]]:
    """
    Main function to scrape OLX job listings for Kochi, Kerala
    This now uses the improved scraper that actually works with live data!
    
    Args:
        max_pages: Maximum number of pages to scrape (default: 3)
        
    Returns:
        List of dictionaries with job information:
        [
            {
                "title": "Job Title",
                "location": "Location", 
                "salary": "₹15,000 - ₹20,000" or None,
                "link": "https://www.olx.in/..."
            },
            ...
        ]
    """
    try:
        # Import the working scraper
        from production_olx_scraper import scrape_olx_jobs_production
        return scrape_olx_jobs_production(max_pages)
    except ImportError:
        # Fallback to basic scraper if production version not available
        scraper = OLXJobScraper()
        return scraper.scrape_job_listings(max_pages)


if __name__ == "__main__":
    # Example usage
    print("Scraping OLX Jobs for Kochi, Kerala...")
    
    try:
        jobs = scrape_olx_jobs_kochi(max_pages=2)
        
        print(f"\nFound {len(jobs)} job listings:")
        print("-" * 80)
        
        for i, job in enumerate(jobs[:10], 1):  # Show first 10 jobs
            print(f"{i}. Title: {job['title']}")
            print(f"   Location: {job['location']}")
            print(f"   Salary: {job['salary'] or 'Not specified'}")
            print(f"   Link: {job['link']}")
            print("-" * 80)
            
    except Exception as e:
        print(f"Error running scraper: {e}")