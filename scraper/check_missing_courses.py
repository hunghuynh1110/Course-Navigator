import json
import os

def get_missing_courses():
    """
    Compares course_codes_only.json with master_courses.json to find missing courses.
    Returns a list of missing course codes.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Paths
    all_codes_path = os.path.join(script_dir, '..', 'data', 'all_course_codes.json')
    master_path = os.path.join(script_dir, '..', 'data', 'master_courses.json')
    
    # Load all expected course codes
    try:
        with open(all_codes_path, 'r', encoding='utf-8') as f:
            all_codes = set(json.load(f))
        print(f"📋 Total expected courses: {len(all_codes)}")
    except FileNotFoundError:
        print(f"❌ Error: {all_codes_path} not found.")
        return []

    # Load already scraped courses
    try:
        if os.path.exists(master_path):
            with open(master_path, 'r', encoding='utf-8') as f:
                master_data = json.load(f)
                scraped_codes = set(item['code'] for item in master_data)
            print(f"✅ Already scraped courses: {len(scraped_codes)}")
        else:
            print("⚠️ master_courses.json not found. Assuming 0 courses scraped.")
            scraped_codes = set()
    except Exception as e:
        print(f"❌ Error reading master_courses.json: {e}")
        return []
    
    # Calculate missing courses
    missing_codes = sorted(list(all_codes - scraped_codes))
    
    print(f"📉 Missing courses: {len(missing_codes)}")
    
    return missing_codes

if __name__ == "__main__":
    missing = get_missing_courses()
    if missing:
        print("\nMissing Course Codes:")
        print(json.dumps(missing, indent=4))
        
        # Optional: Save to a file for the scraper to use
        output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'missing_courses.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(missing, f, indent=4)
        print(f"\n💾 Saved missing codes to: {output_path}")
    else:
        print("\n🎉 All courses have been scraped!")
