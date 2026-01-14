import requests
from bs4 import BeautifulSoup
import json
import re
import time
import concurrent.futures
import os
from tqdm import tqdm

# --- 1. CORE SCRAPER FUNCTIONS ---

def extract_course_codes(text):
    return re.findall(r'[A-Z]{4}\d{4}', text)

def scrape_uq_course(course_code):
    url = f"https://my.uq.edu.au/programs-courses/course.html?course_code={course_code}"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        def get_text(selector_id):
            element = soup.find(id=selector_id)
            return element.get_text(strip=True) if element else "N/A"

        full_title = get_text('course-title')
        course_name = re.sub(r'\s\([A-Z]{4}\d{4}\)', '', full_title)

        level = get_text('course-level')
        faculty = get_text('course-faculty')
        school = get_text('course-school')
        units_text = get_text('course-units')
        try:
             units = int(units_text) if units_text != "N/A" else 0
        except:
             units = 0

        duration = get_text('course-duration')
        mode = get_text('course-mode')
        contact_hours = soup.find(id='course-contact').get_text(separator=' ', strip=True) if soup.find(id='course-contact') else "N/A"        
        
        prereq_raw = get_text('course-prerequisite')
        incomp_raw = get_text('course-incompatible')
        
        description = get_text('course-summary')
        assessment_summary = get_text('course-assessment-methods')
        coordinator = get_text('course-coordinator')

        ecp_link = ""
        ecp_tag = soup.find('a', class_='profile-available')
        if ecp_tag:
            ecp_link = ecp_tag['href']
            if ecp_link.startswith('/'):
                ecp_link = "https://programs-courses.uq.edu.au" + ecp_link

        return {
            "code": course_code,
            "title": course_name,
            "units": units,
            "level": level,
            "faculty": faculty,
            "school": school,
            "description": description,
            "contact_hours": contact_hours,
            "assessment_summary": assessment_summary,
            "prerequisites_text": prereq_raw,
            "prerequisites_list": extract_course_codes(prereq_raw),
            "incompatible_list": extract_course_codes(incomp_raw),
            "coordinator": coordinator,
            "ecp_link": ecp_link,
            "url": url
        }
    except Exception as e:
        print(f"Error scraping {course_code}: {e}")
        return None

def clean_assessment_task(raw_name):
    flags = {
        "is_hurdle": False,
        "is_identity_verified": False,
        "is_in_person": False,
        "is_team_based": False
    }
    
    if re.search(r'hurdle', raw_name, re.IGNORECASE):
        flags["is_hurdle"] = True
    if re.search(r'identity verified', raw_name, re.IGNORECASE):
        flags["is_identity_verified"] = True
    if re.search(r'in-person', raw_name, re.IGNORECASE):
        flags["is_in_person"] = True
    if re.search(r'team', raw_name, re.IGNORECASE):
        flags["is_team_based"] = True
        
    clean_name = re.sub(r'\(?Hurdle\)?', '', raw_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'\(?Identity Verified\)?', '', clean_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'\(?In-person\)?', '', clean_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'\(?Team or group-based\)?', '', clean_name, flags=re.IGNORECASE)
    
    clean_name = clean_name.replace(', ,', ',').strip(' ,()')
    clean_name = re.sub(r'\s+', ' ', clean_name)
    
    return clean_name, flags

def scrape_assessment_table(ecp_url):
    if not ecp_url or ecp_url == "N/A":
        return []
    
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        response = requests.get(ecp_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        assessments = []
        
        table = soup.find('section', class_='section section--course-profile section--in-view') 
        
        if not table:
            tables = soup.find_all('table')
            for t in tables:
                if "Weight" in t.text:
                    table = t
                    break
        
        if table:
            rows = table.find_all('tr')[1:]
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    category = cols[0].get_text(strip=True)
                    weight_raw = cols[2].get_text(strip=True)
                    due_date = cols[3].get_text(separator=' ', strip=True) if len(cols) > 3 else "N/A"                    
                    
                    weight_percent = re.findall(r'\d+', weight_raw)
                    weight_value = int(weight_percent[0]) / 100 if weight_percent else 0
                    
                    task_name_raw = cols[1].get_text(strip=True)
                    clean_name, flags = clean_assessment_task(task_name_raw)

                    assessments.append({
                        "category": category,
                        "assesment_task": clean_name,
                        "weight": weight_value,
                        "due_date": due_date,
                        "flags": flags
                    })
        
        return assessments
    except Exception as e:
        print(f"Error scraping assessment table at {ecp_url}: {e}")
        return []

def get_full_course_data(course_code):
    course_code = course_code.upper()
    course_data = scrape_uq_course(course_code)
    
    if course_data and course_data['ecp_link']:
        # print(f"--- Drilling down into ECP for {course_code} ---")
        course_data['assessments'] = scrape_assessment_table(course_data['ecp_link'])
        
    return course_data

# --- 2. EXECUTION ---

def main():
    # Paths (Assuming running from 'scraper' dir or project root)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, '..', 'data', 'course_codes_only.json')
    output_path = os.path.join(script_dir, '..', 'data', 'master_courses.json')

    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            course_list = json.load(f)
        print(f"✅ Found input file at: {input_path}")
        print(f"✅ Loaded {len(course_list)} unique course codes.")
        
    except FileNotFoundError:
        print(f"❌ Error: Input file not found at '{input_path}'")
        print(f"💡 Please run 'extract_course_codes.py' first to generate course_codes_only.json")
        return
    except Exception as e:
        print(f"❌ Error reading input file: {e}")
        return

    MAX_WORKERS = 5
    results = []
    failed_courses = []

    print(f"🚀 Starting scrape with {MAX_WORKERS} threads...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_code = {executor.submit(get_full_course_data, code): code for code in course_list}
        
        for future in tqdm(concurrent.futures.as_completed(future_to_code), total=len(course_list), desc="Downloading"):
            code = future_to_code[future]
            try:
                data = future.result()
                if data:
                    results.append(data)
                else:
                    failed_courses.append(code)
            except Exception as exc:
                print(f"⚠️ {code} generated an exception: {exc}")
                failed_courses.append(code)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=4)
        
    print(f"✅ Completed! Scraped {len(results)} courses. (Failed: {len(failed_courses)})")
    print(f"✅ Saved to: {output_path}")

if __name__ == "__main__":
    main()
