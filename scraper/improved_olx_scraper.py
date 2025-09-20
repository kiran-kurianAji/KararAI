"""
Improved OLX Job Scraper with multiple fallback strategies
This version tries different approaches to get around anti-bot protections
"""

import requests
from bs4 import BeautifulSoup
import re
import time
from typing import List, Dict, Optional
import logging
import random
import json
from urllib.parse import urljoin
import urllib3

# Try to import optional dependencies
try:
    from fake_useragent import UserAgent
    HAS_FAKE_UA = True
except ImportError:
    HAS_FAKE_UA = False

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)


class ImprovedOLXScraper:
    """Improved OLX scraper with multiple strategies"""
    
    def __init__(self):
        self.base_url = "https://www.olx.in/kochi_g4058873/jobs_c4"
        self.session = requests.Session()
        self.ua = UserAgent() if HAS_FAKE_UA else None
        
        # Set up session with anti-detection measures
        self.setup_session()
    
    def setup_session(self):
        """Configure session with anti-detection settings"""
        # Use fake user agent if available, otherwise fallback to static ones
        if self.ua:
            user_agent = self.ua.random
        else:
            user_agents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
            user_agent = random.choice(user_agents)
        
        headers = {
            'User-Agent': user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
        }
        
        self.session.headers.update(headers)
        self.session.verify = False
        
    def scrape_with_strategy_1(self, max_pages: int = 2) -> List[Dict[str, str]]:
        """Strategy 1: Direct requests with session management"""
        logger.info("Trying Strategy 1: Direct requests...")
        jobs = []
        
        try:
            # First establish session by visiting main site
            logger.info("Establishing session...")
            main_response = self.session.get("https://www.olx.in/", timeout=30)
            
            if main_response.status_code != 200:
                logger.warning(f"Main site returned status: {main_response.status_code}")
                return jobs
            
            time.sleep(random.uniform(2, 4))
            
            for page in range(1, max_pages + 1):
                url = f"{self.base_url}?page={page}" if page > 1 else self.base_url
                
                logger.info(f"Fetching page {page}: {url}")
                
                response = self.session.get(url, timeout=30)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    page_jobs = self.extract_jobs_from_soup(soup)
                    jobs.extend(page_jobs)
                    logger.info(f"Found {len(page_jobs)} jobs on page {page}")
                    
                    if page < max_pages:
                        time.sleep(random.uniform(3, 6))
                else:
                    logger.warning(f"Page {page} returned status: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Strategy 1 failed: {e}")
            
        return jobs
    
    def scrape_with_strategy_2(self, max_pages: int = 2) -> List[Dict[str, str]]:
        """Strategy 2: Use mobile version of the site"""
        logger.info("Trying Strategy 2: Mobile site...")
        jobs = []
        
        try:
            # Update headers for mobile
            mobile_headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
            }
            self.session.headers.update(mobile_headers)
            
            # Try mobile URL
            mobile_base = "https://m.olx.in/kochi_g4058873/jobs_c4"
            
            for page in range(1, max_pages + 1):
                url = f"{mobile_base}?page={page}" if page > 1 else mobile_base
                
                logger.info(f"Fetching mobile page {page}: {url}")
                
                response = self.session.get(url, timeout=30)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    page_jobs = self.extract_jobs_from_soup(soup)
                    jobs.extend(page_jobs)
                    logger.info(f"Found {len(page_jobs)} jobs on mobile page {page}")
                    
                    if page < max_pages:
                        time.sleep(random.uniform(2, 4))
                else:
                    logger.warning(f"Mobile page {page} returned status: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Strategy 2 failed: {e}")
            
        return jobs
    
    def scrape_with_strategy_3(self, max_pages: int = 2) -> List[Dict[str, str]]:
        """Strategy 3: Try API endpoints"""
        logger.info("Trying Strategy 3: API endpoints...")
        jobs = []
        
        try:
            # Try to find API endpoints by looking at network requests
            api_urls = [
                "https://www.olx.in/api/relevance/v2/search",
                "https://www.olx.in/api/relevance/v3/search"
            ]
            
            for api_url in api_urls:
                try:
                    params = {
                        'category': '4',  # Jobs category
                        'location': '4058873',  # Kochi location code
                        'page': '0'
                    }
                    
                    response = self.session.get(api_url, params=params, timeout=30)
                    
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            api_jobs = self.extract_jobs_from_api(data)
                            jobs.extend(api_jobs)
                            logger.info(f"Found {len(api_jobs)} jobs from API")
                            break
                        except json.JSONDecodeError:
                            continue
                            
                except Exception as e:
                    logger.warning(f"API endpoint {api_url} failed: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Strategy 3 failed: {e}")
            
        return jobs
    
    def extract_jobs_from_soup(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract jobs from BeautifulSoup object"""
        jobs = []
        
        # Try multiple selectors to find job listings
        selectors = [
            'a[href*="/item/"][href*="-iid-"]',  # Direct job links
            '[data-aut-id="itemBox"] a',  # Item box links
            '.EIR5N a',  # Possible class name
            '._2gr8D a',  # Another possible class
            'a[href*="item"]'  # Any item links
        ]
        
        job_links = []
        for selector in selectors:
            links = soup.select(selector)
            if links:
                job_links = links
                logger.info(f"Found links using selector: {selector}")
                break
        
        if not job_links:
            # Fallback: find all links and filter
            all_links = soup.find_all('a', href=True)
            job_links = [link for link in all_links if 
                        '/item/' in link.get('href', '') and 
                        '-iid-' in link.get('href', '')]
        
        logger.info(f"Processing {len(job_links)} job links...")
        
        for link in job_links:
            try:
                job_data = self.extract_job_from_link(link)
                if job_data:
                    jobs.append(job_data)
            except Exception as e:
                logger.debug(f"Error extracting job: {e}")
                continue
                
        return jobs
    
    def extract_jobs_from_api(self, data: dict) -> List[Dict[str, str]]:
        """Extract jobs from API response"""
        jobs = []
        
        try:
            # API structure may vary, try different possible structures
            items = []
            
            if 'data' in data:
                if isinstance(data['data'], list):
                    items = data['data']
                elif 'items' in data['data']:
                    items = data['data']['items']
            elif 'items' in data:
                items = data['items']
            elif 'results' in data:
                items = data['results']
            
            for item in items:
                try:
                    job = {
                        'title': item.get('title', ''),
                        'location': item.get('location', {}).get('name', 'Kochi'),
                        'salary': None,
                        'link': f"https://www.olx.in/item/{item.get('id', '')}"
                    }
                    
                    # Try to extract price/salary
                    if 'price' in item:
                        price_info = item['price']
                        if price_info.get('value'):
                            job['salary'] = f"₹{price_info['value']['display']}"
                    
                    if job['title']:
                        jobs.append(job)
                        
                except Exception as e:
                    logger.debug(f"Error parsing API item: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error parsing API response: {e}")
            
        return jobs
    
    def extract_job_from_link(self, link) -> Optional[Dict[str, str]]:
        """Extract job information from a link element"""
        try:
            href = link.get('href', '')
            if not href:
                return None
                
            if href.startswith('/'):
                href = f"https://www.olx.in{href}"
            
            text = link.get_text(strip=True)
            if not text:
                return None
            
            # Extract information from text
            title = text
            salary = None
            location = "Kochi"
            
            # Look for salary patterns
            salary_match = re.search(r'₹\s*[\d,]+(?:\s*-\s*₹?\s*[\d,]+)?', text)
            if salary_match:
                salary = salary_match.group().strip()
                # Remove salary from title
                title = re.sub(r'₹\s*[\d,]+(?:\s*-\s*₹?\s*[\d,]+)?', '', title).strip()
            
            # Look for location in text
            location_match = re.search(r'([A-Z][A-Z\s]+),?\s*KOCHI', text, re.IGNORECASE)
            if location_match:
                location = location_match.group(1).strip()
                # Remove location from title
                title = re.sub(r'[A-Z][A-Z\s]+,?\s*KOCHI', '', title, flags=re.IGNORECASE).strip()
            
            # Clean up title
            title = re.sub(r'\s*\|\s*\w+\s*$', '', title)  # Remove trailing timing info
            title = re.sub(r'\s+', ' ', title)  # Normalize spaces
            title = title[:100]  # Limit length
            
            if not title.strip():
                return None
            
            return {
                'title': title.strip(),
                'location': location,
                'salary': salary,
                'link': href
            }
            
        except Exception as e:
            logger.debug(f"Error extracting job from link: {e}")
            return None
    
    def scrape_jobs(self, max_pages: int = 2) -> List[Dict[str, str]]:
        """Main method that tries all strategies"""
        logger.info("Starting OLX job scraping with multiple strategies...")
        
        all_jobs = []
        
        # Try Strategy 1: Direct requests
        jobs = self.scrape_with_strategy_1(max_pages)
        if jobs:
            all_jobs.extend(jobs)
            logger.info(f"Strategy 1 found {len(jobs)} jobs")
        
        # If Strategy 1 didn't work well, try Strategy 2
        if len(all_jobs) < 5:
            jobs = self.scrape_with_strategy_2(max_pages)
            if jobs:
                all_jobs.extend(jobs)
                logger.info(f"Strategy 2 found {len(jobs)} jobs")
        
        # If still not enough, try Strategy 3
        if len(all_jobs) < 5:
            jobs = self.scrape_with_strategy_3(max_pages)
            if jobs:
                all_jobs.extend(jobs)
                logger.info(f"Strategy 3 found {len(jobs)} jobs")
        
        # Remove duplicates based on link
        seen_links = set()
        unique_jobs = []
        for job in all_jobs:
            if job['link'] not in seen_links:
                seen_links.add(job['link'])
                unique_jobs.append(job)
        
        logger.info(f"Total unique jobs found: {len(unique_jobs)}")
        return unique_jobs


def scrape_olx_jobs_improved(max_pages: int = 2) -> List[Dict[str, str]]:
    """
    Improved OLX job scraper with multiple strategies
    
    Args:
        max_pages: Maximum number of pages to scrape
        
    Returns:
        List of job dictionaries
    """
    scraper = ImprovedOLXScraper()
    return scraper.scrape_jobs(max_pages)


if __name__ == "__main__":
    print("Testing improved OLX scraper...")
    
    try:
        jobs = scrape_olx_jobs_improved(max_pages=2)
        
        if jobs:
            print(f"Successfully found {len(jobs)} jobs!")
            print("-" * 60)
            
            for i, job in enumerate(jobs[:10], 1):
                print(f"{i}. Title: {job['title']}")
                print(f"   Location: {job['location']}")
                print(f"   Salary: {job['salary'] or 'Not specified'}")
                print(f"   Link: {job['link']}")
                print("-" * 60)
        else:
            print("No jobs found. The website might be blocking requests.")
            print("Try running with different strategies or using a VPN.")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()