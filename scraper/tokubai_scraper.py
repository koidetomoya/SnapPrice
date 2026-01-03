import requests
import re
from bs4 import BeautifulSoup
from base import BaseScraper

class TokubaiScraper(BaseScraper):
    def __init__(self, store_name, store_id, url):
        super().__init__()
        self.store_name = store_name
        self.store_id = store_id
        self.url = url

    def scrape(self):
        print(f"Scraping {self.store_name} from {self.url}...")
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(self.url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        # Selectors commonly used on Tokubai
        candidates = [
            ".product_item", 
            ".product-card", 
            ".item_card", 
            "[class*='item_card']", 
            ".leaflet_item"
        ]

        items = []
        for selector in candidates:
            items = soup.select(selector)
            if items:
                print(f"DEBUG: Found {len(items)} items with selector '{selector}'")
                break
        
        if not items:
            print("DEBUG: No items found with known selectors.")
            return []

        scraped_data = []
        for item in items:
            name_el = item.select_one(".product_name")
            price_el = item.select_one(".price")
            
            if name_el and price_el:
                name = name_el.get_text(strip=True)
                price_raw = price_el.get_text(strip=True)
                price_match = re.search(r'\d+', price_raw.replace(',', ''))
                
                if price_match:
                    scraped_data.append({
                        "name": name,
                        "price": int(price_match.group())
                    })
        
        return scraped_data

    def run(self):
        data = self.scrape()
        if data:
            self.save_to_db(self.store_id, data)
        else:
            print(f"No data found for {self.store_name}")
