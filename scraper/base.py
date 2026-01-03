import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

class BaseScraper:
    def __init__(self):
        self.supabase_url = os.environ.get("SUPABASE_URL")
        self.supabase_key = os.environ.get("SUPABASE_KEY")
        self.supabase = create_client(self.supabase_url, self.supabase_key)

    def scrape(self):
        """
        Implementation of scraping logic.
        Should return a list of dictionaries with 'name' and 'price'.
        """
        raise NotImplementedError

    def save_to_db(self, store_id, data):
        """
        Saves scraped data to Supabase.
        """
        if not data:
            print("No data to save.")
            return

        for entry in data:
            # 1. Upsert product
            product_res = self.supabase.table("products").upsert(
                {"name": entry["name"]}, on_conflict="name"
            ).execute()

            product_id = product_res.data[0]["id"]

            # 2. Insert price
            self.supabase.table("prices").insert({
                "product_id": product_id,
                "store_id": store_id,
                "price": entry["price"]
            }).execute()
        
        print(f"Saved {len(data)} items to database for store {store_id}.")
