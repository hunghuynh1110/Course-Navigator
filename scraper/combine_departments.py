"""
This script combines all individual department JSON files into a single programs2.json file.
"""

import json
import os
from pathlib import Path

def combine_department_files():
    """
    Combines all programs_{dept}.json files into a single programs2.json file.
    """
    print("=" * 60)
    print("COMBINING DEPARTMENT DATA")
    print("=" * 60)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, '..', 'data')
    
    # Find all programs_{dept}.json files
    department_files = list(Path(data_dir).glob('programs_*.json'))
    
    if not department_files:
        print("❌ No department files found in data/ directory")
        print("💡 Make sure to run individual department scrapers first")
        return
    
    print(f"\n📁 Found {len(department_files)} department files:")
    for file in department_files:
        print(f"   - {file.name}")
    
    # Combine all data
    combined_data = {}
    total_programs = 0
    
    print("\n🔄 Combining data...")
    
    for file_path in department_files:
        dept_name = file_path.stem.replace('programs_', '')
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                dept_data = json.load(f)
            
            # Add department info to each program
            for program_name, program_info in dept_data.items():
                program_info['department'] = dept_name
                combined_data[program_name] = program_info
            
            total_programs += len(dept_data)
            print(f"   ✅ {dept_name}: {len(dept_data)} programs")
            
        except Exception as e:
            print(f"   ⚠️ Error reading {file_path.name}: {e}")
    
    # Save combined data
    output_path = os.path.join(data_dir, 'programs2.json')
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(combined_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Successfully combined {total_programs} programs")
        print(f"✅ Saved to: {output_path}")
        
        # Show statistics
        unique_courses = set()
        for program_info in combined_data.values():
            unique_courses.update(program_info.get('courses', []))
        
        print(f"\n📊 Statistics:")
        print(f"   - Total programs: {len(combined_data)}")
        print(f"   - Unique course codes: {len(unique_courses)}")
        print(f"   - Departments: {len(department_files)}")
        
    except Exception as e:
        print(f"\n❌ Error saving combined file: {e}")
    
    print("\n" + "=" * 60)
    print("COMBINING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    combine_department_files()
