import json
import os
import requests
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

# Supabase Credentials
SUPABASE_URL = "https://smwypwqkbcncgepvrbey.supabase.co"
SUPABASE_KEY = "sb_publishable_dmDsfGjs4tsmq1safpNaKw_UMRGUbLB"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def update_single_program(item):
    program_name, info = item
    
    # URL encode the program name
    encoded_name = urllib.parse.quote(program_name)
    url = f"{SUPABASE_URL}/rest/v1/programs?name=eq.{encoded_name}"
    
    payload = {
        "courses": info.get("courses", []),
        "total_units": info.get("total_units", 0),
        "faculty": info.get("department") # Mapping department (json) -> faculty (db)
    }
    
    try:
        response = requests.patch(url, json=payload, headers=headers)
        if response.status_code in [200, 204]:
            print(f"✅ Updated: {program_name}")
            return True
        else:
            print(f"❌ Failed ({response.status_code}): {program_name}")
            return False
    except Exception as e:
        print(f"⚠️ Error {program_name}: {e}")
        return False

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, '..', 'data', 'programs2.json')
    
    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}")
        return

    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print(f"🚀 Starting update for {len(data)} programs...")
    
    items = list(data.items())
            
    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(update_single_program, items))
        
    success_count = sum(results)
    print(f"\n🎉 Finished! Updated {success_count}/{len(items)} programs.")

if __name__ == "__main__":
    main()
