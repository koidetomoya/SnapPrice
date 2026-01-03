import sys
import os

# Ensure the current directory is in the path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from stores.aeon import AeonScraper
from stores.donki import DonkiScraper
from stores.coop import CoopScraper
from stores.welcia import WelciaScraper

def main():
    print("Starting batch scraping...")
    
    # List of scrapers to run
    # In the future, we can dynamically load these or use a config file
    scrapers = [
        AeonScraper(),
        # DonkiScraper(), # Uncomment when URLs are real
        # CoopScraper(),
        # WelciaScraper()
    ]

    for scraper in scrapers:
        try:
            print(f"--- Running {scraper.store_name} ---")
            scraper.run()
        except Exception as e:
            print(f"Error scraping {scraper.store_name}: {e}")

    print("Batch scraping completed.")

if __name__ == "__main__":
    main()