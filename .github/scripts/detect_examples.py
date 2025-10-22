#!/usr/bin/env python3
"""
Detects new or modified examples in the Examples.Core directory
and outputs them as JSON for the GitHub Actions workflow.
"""

import os
import sys
import json
import subprocess
from pathlib import Path


def get_git_changes():
    """Get changed files from git diff"""
    try:
        if os.getenv('GITHUB_EVENT_NAME') == 'pull_request':
            # For PR, compare against base branch
            base_sha = os.getenv('GITHUB_BASE_REF', 'main')
            result = subprocess.run(
                ['git', 'diff', '--name-only', f'origin/{base_sha}...HEAD'],
                capture_output=True, text=True, check=True
            )
        else:
            # For push, compare with previous commit
            result = subprocess.run(
                ['git', 'diff', '--name-only', 'HEAD~1', 'HEAD'],
                capture_output=True, text=True, check=True
            )
        
        return result.stdout.strip().split('\n') if result.stdout.strip() else []
    except subprocess.CalledProcessError as e:
        print(f"Error getting git changes: {e}")
        return []


def is_example_file(file_path):
    """Check if a file is an example file in Examples.Core"""
    path = Path(file_path)
    
    # Must be in Examples.Core directory
    if not any(part == 'Examples.Core' for part in path.parts):
        return False
    
    # Must be a C# file
    if path.suffix != '.cs':
        return False
    
    # Skip LicenseHelper.cs and test files
    if path.name in ['LicenseHelper.cs'] or 'Test' in path.name:
        return False
    
    # Must be in a category directory (Generation, Reading, Formatting, Advanced)
    valid_categories = ['Generation', 'Reading', 'Formatting', 'Advanced']
    if not any(cat in str(path) for cat in valid_categories):
        return False
    
    return True


def get_example_category(file_path):
    """Extract the category from the file path"""
    path = Path(file_path)
    for part in path.parts:
        if part in ['Generation', 'Reading', 'Formatting', 'Advanced']:
            return part
    return 'Unknown'


def main():
    """Main function to detect new examples"""
    
    changed_files = get_git_changes()
    print(f"Changed files: {changed_files}")
    
    # Filter for example files
    example_files = []
    for file_path in changed_files:
        if is_example_file(file_path):
            # Check if file exists (not deleted)
            if os.path.exists(file_path):
                example_files.append({
                    'path': file_path,
                    'category': get_example_category(file_path),
                    'name': Path(file_path).stem
                })
    
    print(f"Example files detected: {example_files}")
    
    # Output for GitHub Actions
    has_new_examples = len(example_files) > 0
    
    # Set outputs using environment files
    with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
        f.write(f"has_new_examples={str(has_new_examples).lower()}\n")
        f.write(f"examples={json.dumps([ex['path'] for ex in example_files])}\n")
    
    print(f"Has new examples: {has_new_examples}")
    print(f"Examples JSON: {json.dumps([ex['path'] for ex in example_files])}")


if __name__ == "__main__":
    main()