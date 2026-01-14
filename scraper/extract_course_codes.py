import json
import os

def main():
    """
    Extracts all unique course codes from programs2.json and saves them to course_codes_only.json.
    """
    print("=" * 60)
    print("EXTRACTING COURSE CODES")
    print("=" * 60)
    
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, '..', 'data', 'programs2.json')
    output_path = os.path.join(script_dir, '..', 'data', 'course_codes_only.json')
    
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            programs_data = json.load(f)
        
        print(f"✅ Loaded {len(programs_data)} programs from {input_path}")
        
        # Extract unique courses
        unique_courses = set()
        for program_info in programs_data.values():
            courses = program_info.get('courses', [])
            unique_courses.update(courses)
        
        course_list = sorted(list(unique_courses))
        
        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(course_list, f, ensure_ascii=False, indent=4)
            
        print(f"✅ Extracted {len(course_list)} unique course codes")
        print(f"✅ Saved to: {output_path}")
        
    except FileNotFoundError:
        print(f"❌ Error: Input file not found at '{input_path}'")
        print("💡 Run 'run_all_scrapers.py' first to generate programs2.json")
    except Exception as e:
        print(f"❌ Error: {e}")

    print("=" * 60)

if __name__ == "__main__":
    main()
