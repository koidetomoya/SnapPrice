from tokubai_scraper import TokubaiScraper

STORE_ID = "00000000-0000-0000-0000-000000000003"
STORE_NAME = "ウエルシアダックス西京洛西中央店"
URL = "https://tokubai.co.jp/ウエルシア/33333" # Dummy URL

class WelciaScraper(TokubaiScraper):
    def __init__(self):
        super().__init__(STORE_NAME, STORE_ID, URL)
