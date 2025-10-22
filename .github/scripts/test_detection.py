#!/usr/bin/env python3
"""
Test script for the example detection functionality.
Simulates GitHub Actions environment variables and tests detection.
"""

import os
import sys
import tempfile
from pathlib import Path

# Add scripts directory to path
scripts_dir = Path(__file__).parent
sys.path.insert(0, str(scripts_dir))

def test_detection():
    """Test the detection script with simulated environment"""
    
    # Create temporary file for GitHub output
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
        output_file = f.name
    
    # Set environment variables that GitHub Actions would set
    os.environ['GITHUB_OUTPUT'] = output_file
    os.environ['GITHUB_EVENT_NAME'] = 'push'
    
    print("🧪 Testing Example Detection Script")
    print("=" * 50)
    
    # Import and run the detection script
    try:
        from detect_examples import main
        main()
        
        # Read the output
        with open(output_file, 'r') as f:
            output = f.read()
        
        print("\n📄 GitHub Actions Output:")
        print(output)
        
        # Clean up
        os.unlink(output_file)
        
        print("✅ Detection script test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error running detection script: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Clean up environment
        if 'GITHUB_OUTPUT' in os.environ:
            del os.environ['GITHUB_OUTPUT']
        if 'GITHUB_EVENT_NAME' in os.environ:
            del os.environ['GITHUB_EVENT_NAME']

if __name__ == "__main__":
    test_detection()