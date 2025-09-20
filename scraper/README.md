# OLX Jobs Scraper for Kochi, Kerala

A Python web scraper to extract job listings from OLX Jobs website specifically for Kochi, Kerala location.

## Features

- ✅ **Comprehensive Data Extraction**: Extracts job title, location, salary, and link
- ✅ **Robust Error Handling**: Gracefully handles missing fields and network issues  
- ✅ **Respectful Scraping**: Includes delays between requests to be respectful to the server
- ✅ **Retry Logic**: Automatically retries failed requests up to 3 times
- ✅ **Configurable**: Customizable number of pages to scrape
- ✅ **Clean Output**: Returns structured data as list of dictionaries

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Dependencies

- `requests>=2.28.0` - For HTTP requests
- `beautifulsoup4>=4.11.0` - For HTML parsing
- `lxml>=4.9.0` - XML/HTML parser

## Usage

### Basic Usage

```python
from olx_job_scraper import scrape_olx_jobs_kochi

# Scrape first 3 pages of job listings
jobs = scrape_olx_jobs_kochi(max_pages=3)

# Print results
for job in jobs:
    print(f"Title: {job['title']}")
    print(f"Location: {job['location']}")
    print(f"Salary: {job['salary'] if job['salary'] else 'Not specified'}")
    print(f"Link: {job['link']}")
    print("-" * 40)
```

### Advanced Usage

```python
from olx_job_scraper import OLXJobScraper
import json

# Create scraper instance
scraper = OLXJobScraper()

# Scrape jobs
jobs = scraper.scrape_job_listings(max_pages=5)

# Save to JSON file
with open('kochi_jobs.json', 'w', encoding='utf-8') as f:
    json.dump(jobs, f, indent=2, ensure_ascii=False)

# Filter jobs by salary
high_paying_jobs = [job for job in jobs if job['salary'] and '₹20,000' in job['salary']]
```

## Output Format

The scraper returns a list of dictionaries with the following structure:

```json
[
  {
    "title": "Salon Worker",
    "location": "Edapally, Kochi", 
    "salary": "₹12,000 - ₹15,000",
    "link": "https://www.olx.in/item/salon-worker-full-time-in-edapally-kochi-iid-1234567890"
  },
  {
    "title": "Cook Required for Restaurant",
    "location": "Ernakulam HPO, Kochi",
    "salary": null,
    "link": "https://www.olx.in/item/cook-required-restaurant-full-time-in-ernakulam-hpo-kochi-iid-1234567891"
  }
]
```

### Field Descriptions

- **title**: Job title/position name
- **location**: Specific area/locality in Kochi  
- **salary**: Salary range (null if not specified)
- **link**: Direct URL to the job posting on OLX

## Testing

Run the test script to see the scraper in action:

```bash
python test_scraper.py
```

This will:
- Attempt to scrape live data from OLX
- Show sample data format if network issues occur
- Demonstrate API usage
- Save sample data to JSON file

## Error Handling

The scraper includes comprehensive error handling:

- **Network timeouts**: Automatic retry with exponential backoff
- **Missing data**: Gracefully handles missing salary/location information
- **Invalid responses**: Skips malformed job listings
- **Rate limiting**: Respectful delays between requests

## Limitations

- Only scrapes jobs from Kochi, Kerala region
- Requires stable internet connection
- Subject to OLX website structure changes
- Respects website's robots.txt and terms of service

## Example Applications

1. **Job Market Analysis**: Analyze salary trends and popular job categories
2. **Automated Job Alerts**: Set up notifications for specific job types
3. **Data Visualization**: Create charts and graphs of job market data
4. **Resume Optimization**: Identify commonly requested skills

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Legal Notice

This scraper is for educational and research purposes only. Please respect OLX's terms of service and robots.txt file. Be responsible with scraping frequency and consider the website's resources.

## License

This project is open source and available under the MIT License.