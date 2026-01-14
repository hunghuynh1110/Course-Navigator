import requests
from bs4 import BeautifulSoup
import json
import re
import concurrent.futures
from tqdm import tqdm
import os

# Department: Science
# Faculty Code: sci

def scrape_sci_programs():
    """
    Scrapes all Science program names and links from the faculty page.
    
    Returns:
        List of dicts with keys: name, link, program_id
    """
    print("📥 Fetching Science programs from faculty page...")
    
    url = "https://programs-courses.uq.edu.au/faculty.html?faculty=sci"
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"❌ Failed to fetch faculty page: Status {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all program links
        program_links = soup.select("a[href*='program.html?acad_prog=']")
        
        programs = []
        for link in program_links:
            program_name = link.get_text(strip=True)
            program_url = link['href']
            
            # Make absolute URL if needed
            if program_url.startswith('/'):
                program_url = "https://programs-courses.uq.edu.au" + program_url
            
            # Extract program ID from URL
            match = re.search(r'acad_prog=(\d+)', program_url)
            program_id = match.group(1) if match else None
            
            if program_id and program_name:
                programs.append({
                    "name": program_name,
                    "link": program_url,
                    "program_id": program_id
                })
        
        print(f"✅ Found {len(programs)} Science programs")
        return programs
        
    except Exception as e:
        print(f"❌ Error scraping faculty page: {e}")
        return []


def scrape_program_courses_json(program_info, years=[2026, 2025, 2024]):
    """
    Scrapes compulsory courses and total units by extracting window.AppData JSON from the HTML.
    
    Args:
        program_info: Dict with keys: name, program_id
        years: List of years to try (default: [2026, 2025, 2024])
    
    Returns:
        Tuple of (program_name, dict with 'courses' and 'total_units')
    """
    program_name = program_info['name']
    program_id = program_info['program_id']
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
    
    for year in years:
        url = f"https://programs-courses.uq.edu.au/requirements/program/{program_id}/{year}"
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code != 200:
                continue  # Try next year
            
            # Find the script tag containing window.AppData
            soup = BeautifulSoup(response.text, 'html.parser')
            script_tags = soup.find_all('script', string=re.compile('window\\.AppData'))
            
            if not script_tags:
                continue  # Try next year
            
            # Extract the JSON from the script tag
            script_content = script_tags[0].string
            json_match = re.search(r'window\.AppData\s*=\s*({.*?});', script_content, re.DOTALL)
            
            if not json_match:
                continue  # Try next year
            
            # Parse the JSON
            app_data = json.loads(json_match.group(1))
            
            # Check if program is no longer offered
            if app_data.get('status', {}).get('noLongerOffered'):
                continue  # Try next year
            
            # Extract total units required
            program_reqs = app_data.get('programRequirements', {})
            total_units = program_reqs.get('unitsMinimum', 0)
            
            # Extract course codes from the program requirements
            course_codes = set()
            
            # Navigate through the JSON structure to find courses
            payload = program_reqs.get('payload', {})
            components = payload.get('components', [])
            
            # Recursive function to extract courses from parts
            def extract_courses_from_part(part):
                """Recursively extract courses from a part and its nested parts"""
                # Check if this part has a selection rule indicating compulsory courses
                header = part.get('header', {})
                selection_rule = header.get('selectionRule', {})
                rule_code = selection_rule.get('code', '')
                
                # SR1 = "Complete ALL units for ALL of the following" (compulsory)
                is_compulsory = (rule_code == 'SR1')
                
                # Get the body of this part
                body = part.get('body', [])
                
                for item in body:
                    row_type = item.get('rowType', '')
                    
                    # If this is a curriculum reference (course), extract it
                    if row_type == 'CurriculumReference':
                        curr_ref = item.get('curriculumReference', {})
                        if curr_ref.get('type') == 'Course':
                            course_code = curr_ref.get('code')
                            if course_code and re.match(r'^[A-Z]{4}\d{4}$', course_code) and is_compulsory:
                                course_codes.add(course_code)
                    
                    # If this is an equivalence group, extract all courses in it
                    elif row_type == 'EquivalenceGroup':
                        equiv_group = item.get('equivalenceGroup', [])
                        for equiv_item in equiv_group:
                            curr_ref = equiv_item.get('curriculumReference', {})
                            if curr_ref.get('type') == 'Course':
                                course_code = curr_ref.get('code')
                                if course_code and re.match(r'^[A-Z]{4}\d{4}$', course_code) and is_compulsory:
                                    course_codes.add(course_code)
                    
                    # If this item has nested parts (SubRule), recurse
                    if 'header' in item and 'body' in item:
                        extract_courses_from_part(item)
            
            # Extract courses from all components
            for component in components:
                if component.get('type') == 'PROGRAM_RULE':
                    # This component contains the program rules with parts
                    rules_payload = component.get('payload', {})
                    body_parts = rules_payload.get('body', [])
                    
                    for part in body_parts:
                        extract_courses_from_part(part)
            
            if course_codes or total_units:
                return (program_name, {
                    'courses': sorted(list(course_codes)),
                    'total_units': total_units
                })
                
        except Exception as e:
            # Try next year
            continue
    
    # If all years failed, return empty result
    return (program_name, {'courses': [], 'total_units': 0})


def main():
    """
    Main function to scrape Science programs.
    """
    print("=" * 60)
    print("UQ SCIENCE PROGRAM SCRAPER")
    print("=" * 60)
    
    # Step 1: Get all SCI program names and links
    print("\n📋 STEP 1: Scraping SCI program list...")
    programs = scrape_sci_programs()
    
    if not programs:
        print("❌ No programs found. Exiting.")
        return
    
    print(f"\n✅ Found {len(programs)} programs")
    
    # Step 2: Scrape compulsory courses for each program using concurrent requests
    print("\n📚 STEP 2: Scraping compulsory courses for each program...")
    print("⚡ Using concurrent requests with 8 workers")
    
    MAX_WORKERS = 8
    results = {}
    failed_programs = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks
        future_to_program = {
            executor.submit(scrape_program_courses_json, program): program 
            for program in programs
        }
        
        # Process results as they complete
        for future in tqdm(
            concurrent.futures.as_completed(future_to_program), 
            total=len(programs), 
            desc="Scraping courses"
        ):
            program = future_to_program[future]
            try:
                program_name, program_data = future.result()
                if program_data['courses']:  # Check if courses list is not empty
                    results[program_name] = program_data
                else:
                    failed_programs.append(program_name)
            except Exception as exc:
                print(f"\n⚠️ {program['name']} generated an exception: {exc}")
                failed_programs.append(program['name'])
    
    # Save results to JSON
    # Use absolute path relative to script location to ensure it works from any CWD
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, '..', 'data', 'programs_sci.json')
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Successfully scraped {len(results)} programs with courses")
        print(f"✅ Saved to: {output_path}")
        
        # Show some statistics
        if results:
            total_courses = sum(len(data['courses']) for data in results.values())
            avg_courses = total_courses / len(results) if results else 0
            print(f"📊 Total compulsory courses found: {total_courses}")
            print(f"📊 Average courses per program: {avg_courses:.1f}")
        
        if failed_programs:
            print(f"\n⚠️ Failed to get courses for {len(failed_programs)} programs:")
            for prog in failed_programs[:10]:  # Show first 10
                print(f"   - {prog}")
            if len(failed_programs) > 10:
                print(f"   ... and {len(failed_programs) - 10} more")
    
    except Exception as e:
        print(f"\n❌ Error saving results: {e}")
    
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
