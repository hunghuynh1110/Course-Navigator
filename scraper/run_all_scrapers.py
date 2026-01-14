import os
import glob
import subprocess
import sys
import time

def main():
    """
    Finds all department scraper scripts and runs them.
    Then runs the combiner script.
    """
    print("=" * 60)
    print("🚀 RUNNING ALL UQ DEPARTMENT SCRAPERS")
    print("=" * 60)
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Find all scrape_*.py files in this directory
    scraper_pattern = os.path.join(script_dir, 'scrape_*.py')
    scraper_files = glob.glob(scraper_pattern)
    
    # Sort them to run in a deterministic order
    scraper_files.sort()
    
    # Filter out files that should not be run directly if any (though glob pattern scrape_*.py is pretty specific)
    # Just a safety check
    scraper_files = [f for f in scraper_files if os.path.basename(f) != 'run_scraper.py']
    
    if not scraper_files:
        print("❌ No scraper files found matching 'scrape_*.py'")
        return

    print(f"📋 Found {len(scraper_files)} scraper files:")
    for f in scraper_files:
        print(f"   - {os.path.basename(f)}")
    
    print("\n" + "-" * 60)
    
    successful_scrapers = 0
    failed_scrapers = []
    
    # Run each scraper
    for i, file_path in enumerate(scraper_files):
        filename = os.path.basename(file_path)
        print(f"\n▶️ [{i+1}/{len(scraper_files)}] Running {filename}...")
        
        start_time = time.time()
        
        # Run the script using the same python interpreter
        result = subprocess.run([sys.executable, file_path], text=True)
        
        duration = time.time() - start_time
        
        if result.returncode == 0:
            print(f"✅ {filename} finished successfully in {duration:.1f}s")
            successful_scrapers += 1
        else:
            print(f"❌ {filename} failed with return code {result.returncode}")
            failed_scrapers.append(filename)
            
    print("\n" + "-" * 60)
    print(f"🏁 Scrapers finished: {successful_scrapers}/{len(scraper_files)} successful")
    
    if failed_scrapers:
        print(f"⚠️ Failed scrapers: {', '.join(failed_scrapers)}")
    
    # Run the combiner script
    print("\n" + "=" * 60)
    print("🔗 RUNNING COMBINER SCRIPT")
    print("=" * 60)
    
    combiner_script = os.path.join(script_dir, 'combine_departments.py')
    
    if os.path.exists(combiner_script):
        subprocess.run([sys.executable, combiner_script], text=True)
    else:
        print(f"❌ Combiner script not found at {combiner_script}")

    print("\n" + "=" * 60)
    print("🎉 ALL TASKS COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    main()
