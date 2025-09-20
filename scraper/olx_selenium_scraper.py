"""
Alternative OLX Job Scraper using Selenium WebDriver
This version uses browser automation to handle anti-bot protections
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import time
import random
import re
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class OLXJobScraperSelenium:
    """Selenium-based scraper for OLX Jobs in Kochi, Kerala"""
    
    def __init__(self, headless: bool = True):
        self.base_url = "https://www.olx.in/kochi_g4058873/jobs_c4"
        self.headless = headless
        self.driver = None
        
    def setup_driver(self):
        """Setup Chrome WebDriver with anti-detection options"""
        try:
            chrome_options = Options()
            
            if self.headless:
                chrome_options.add_argument("--headless")
            
            # Anti-detection options
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            chrome_options.add_argument("--disable-extensions")
            chrome_options.add_argument("--disable-plugins-discovery")
            chrome_options.add_argument("--disable-web-security")
            chrome_options.add_argument("--allow-running-insecure-content")
            
            # Random user agent
            user_agents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ]
            chrome_options.add_argument(f"--user-agent={random.choice(user_agents)}")
            
            self.driver = webdriver.Chrome(options=chrome_options)
            
            # Execute script to remove webdriver property
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to setup driver: {e}")
            return False
    
    def scrape_with_selenium(self, max_pages: int = 2) -> List[Dict[str, str]]:
        """Scrape using Selenium WebDriver"""
        all_jobs = []
        
        if not self.setup_driver():
            logger.error("Could not setup WebDriver")
            return all_jobs
        
        try:
            for page in range(1, max_pages + 1):
                logger.info(f"Scraping page {page} with Selenium...")
                
                url = f"{self.base_url}?page={page}" if page > 1 else self.base_url
                
                try:
                    self.driver.get(url)
                    
                    # Random delay to mimic human behavior
                    time.sleep(random.uniform(3, 6))
                    
                    # Wait for page to load
                    WebDriverWait(self.driver, 20).until(
                        EC.presence_of_element_located((By.TAG_NAME, "body"))
                    )
                    
                    # Scroll down to load more content
                    self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
                    time.sleep(2)
                    self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    time.sleep(2)
                    
                    # Get page source and parse with BeautifulSoup
                    page_source = self.driver.page_source
                    soup = BeautifulSoup(page_source, 'html.parser')
                    
                    # Find job links
                    job_links = soup.find_all('a', href=re.compile(r'/item/.*-iid-\d+'))
                    
                    logger.info(f"Found {len(job_links)} job links on page {page}")
                    
                    for link in job_links:
                        try:
                            job_data = self.extract_job_data_from_element(link)
                            if job_data:
                                all_jobs.append(job_data)
                        except Exception as e:
                            logger.warning(f"Error extracting job data: {e}")
                            continue
                    
                    # Random delay between pages
                    if page < max_pages:
                        time.sleep(random.uniform(4, 8))
                        
                except TimeoutException:
                    logger.error(f"Timeout loading page {page}")
                    continue
                except Exception as e:
                    logger.error(f"Error on page {page}: {e}")
                    continue
                    
        finally:
            if self.driver:
                self.driver.quit()
        
        logger.info(f"Selenium scraper found {len(all_jobs)} jobs")
        return all_jobs
    
    def extract_job_data_from_element(self, link_element) -> Optional[Dict[str, str]]:
        """Extract job data from a link element"""
        try:
            job_url = link_element.get('href')
            if not job_url:
                return None
            
            if job_url.startswith('/'):
                job_url = f"https://www.olx.in{job_url}"
            
            link_text = link_element.get_text(strip=True)
            if not link_text:
                return None
            
            # Parse job information
            title = None
            salary = None
            location = "Kochi"
            
            # Split by common delimiters
            parts = link_text.split('|')
            
            if len(parts) >= 2:
                salary_part = parts[0].strip()
                if '₹' in salary_part:
                    salary_match = re.findall(r'₹\s*[\d,]+', salary_part)
                    if len(salary_match) >= 2:
                        salary = f"{salary_match[0]} - {salary_match[1]}"
                    elif len(salary_match) == 1:
                        salary = salary_match[0]
                
                title_location_part = parts[1].strip()
                title_location_part = re.sub(r'\b(TODAY|YESTERDAY|\d+ DAYS? AGO|\w{3} \d{1,2})\s*$', '', title_location_part, flags=re.IGNORECASE).strip()
                
                if ',' in title_location_part:
                    title_parts = title_location_part.split(',')
                    title = title_parts[0].strip()
                    if len(title_parts) > 1:
                        location = title_parts[1].strip()
                else:
                    title = title_location_part
            else:
                title = link_text
                title = re.sub(r'\b(TODAY|YESTERDAY|\d+ DAYS? AGO|\w{3} \d{1,2})\s*$', '', title, flags=re.IGNORECASE).strip()
            
            # Clean up title
            if title:
                title = re.sub(r'^₹.*?\|', '', title).strip()
                title = title[:100]
            
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


def scrape_olx_jobs_with_selenium(max_pages: int = 2, headless: bool = True) -> List[Dict[str, str]]:
    """
    Scrape OLX jobs using Selenium WebDriver
    
    Args:
        max_pages: Maximum number of pages to scrape
        headless: Whether to run browser in headless mode
        
    Returns:
        List of job dictionaries
    """
    scraper = OLXJobScraperSelenium(headless=headless)
    return scraper.scrape_with_selenium(max_pages)


if __name__ == "__main__":
    print("Testing Selenium-based OLX scraper...")
    try:
        jobs = scrape_olx_jobs_with_selenium(max_pages=1, headless=True)
        print(f"Found {len(jobs)} jobs using Selenium")
        
        for i, job in enumerate(jobs[:5], 1):
            print(f"{i}. {job['title']} - {job['salary'] or 'N/A'} - {job['location']}")
            
    except Exception as e:
        print(f"Error: {e}")
        print("Note: This requires ChromeDriver to be installed")