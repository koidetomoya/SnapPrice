import os
import requests
import re
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ターゲット店舗の設定
STORE_NAME = "イオンスタイル京都桂川"
# ★ここにSupabaseからコピーしたUUIDを貼り付けてください
STORE_ID = "aaf79e86-4bd8-4eae-9130-036f2a0d4907" 
TOKUBAI_URL = "https://tokubai.co.jp/イオンスタイル/12266"

def get_price_data():
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(TOKUBAI_URL, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    
    # 【追加】ページ内に存在する「価格」や「商品」らしき要素を幅広く探す
    # 2026年現在のトクバイで使われそうなセレクター候補を網羅
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
            print(f"DEBUG: セレクター '{selector}' で {len(items)} 件見つかりました。")
            break

    if not items:
        # クラス名が不明な場合、<div>タグのクラス名をいくつか出力してヒントを得る
        print("DEBUG: クラス名が見つかりません。存在する<div>のクラス例:")
        divs = soup.find_all("div", class_=True, limit=5)
        for d in divs:
            print(f" - {d['class']}")
    
    scraped_data = []
    for item in items:
        name_el = item.select_one(".product_name")
        price_el = item.select_one(".price")
        
        if name_el and price_el:
            name = name_el.get_text(strip=True)
            # 価格から数字だけを抽出（「198円(税込)」→ 198）
            price_raw = price_el.get_text(strip=True)
            price_match = re.search(r'\d+', price_raw.replace(',', ''))
            
            if price_match:
                scraped_data.append({
                    "name": name,
                    "price": int(price_match.group())
                })
    return scraped_data

def sync_to_supabase(data):
    for entry in data:
        # 1. 商品マスターに登録（同名の商品があれば取得、なければ作成）
        # upsertを使用し、nameをユニークキーとして扱う
        product_res = supabase.table("products").upsert(
            {"name": entry["name"]}, on_conflict="name"
        ).execute()
        
        product_id = product_res.data[0]["id"]
        
        # 2. 価格履歴に挿入
        supabase.table("prices").insert({
            "product_id": product_id,
            "store_id": STORE_ID,
            "price": entry["price"]
        }).execute()
        
    print(f"{len(data)} 件のデータを同期しました。")

if __name__ == "__main__":
    print(f"{STORE_NAME} からデータを取得中...")
    data = get_price_data()
    
    # デバッグ情報を追加
    if not data:
        print("--- デバッグ情報 ---")
        print(f"ターゲットURL: {TOKUBAI_URL}")
        print("商品リストが見つかりませんでした。")
        print("原因の可能性:")
        print("1. 年始で特売情報がWebに掲載されていない（ブラウザでURLを確認してください）")
        print("2. サイトのHTML構造（クラス名）が変わった")
    else:
        print(f"{len(data)} 件のデータが見つかりました！同期を開始します。")
        sync_to_supabase(data)