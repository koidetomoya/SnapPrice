from tokubai_scraper import TokubaiScraper

STORE_ID = "00000000-0000-0000-0000-000000000002"
STORE_NAME = "コープらくさい"
URL = "https://tokubai.co.jp/コープ/22222" # Dummy URL

class CoopScraper(TokubaiScraper):
    def __init__(self):
        super().__init__(STORE_NAME, STORE_ID, URL)
