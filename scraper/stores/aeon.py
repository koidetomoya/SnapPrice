from tokubai_scraper import TokubaiScraper

# Aeon Style Kyoto Katsuragawa
# Note: In a real app, store_id might be fetched from DB or config
STORE_ID = "aaf79e86-4bd8-4eae-9130-036f2a0d4907"
STORE_NAME = "イオンスタイル京都桂川"
URL = "https://tokubai.co.jp/イオンスタイル/12266"

class AeonScraper(TokubaiScraper):
    def __init__(self):
        super().__init__(STORE_NAME, STORE_ID, URL)
