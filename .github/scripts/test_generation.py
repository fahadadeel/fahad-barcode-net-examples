#!/usr/bin/env python3
"""
Test script for the documentation generation functionality.
Tests with an existing example file without requiring API key.
"""

import os
import sys
import tempfile
from pathlib import Path

# Add scripts directory to path
scripts_dir = Path(__file__).parent
sys.path.insert(0, str(scripts_dir))

def test_documentation_generation():
    """Test the documentation generation with fallback analysis"""
    
    print("🧪 Testing Documentation Generation Script")
    print("=" * 50)
    
    # Test with an existing example
    example_file = "Examples.Core/Generation/BasicGenerationExample.cs"
    examples_repo = str(Path(__file__).parent.parent.parent)
    
    # Create temporary directory for docs output
    with tempfile.TemporaryDirectory() as temp_docs_dir:
        print(f"📁 Temporary docs directory: {temp_docs_dir}")
        print(f"📄 Testing with example: {example_file}")
        
        # Import the documentation generator
        try:
            from generate_docs import DocumentationGenerator
            
            # Create generator without API key (will use fallback)
            generator = DocumentationGenerator(api_key="test-key")
            
            # Test the generation
            success = generator.generate_docs(
                example_file=example_file,
                examples_repo_path=examples_repo,
                docs_repo_path=temp_docs_dir
            )
            
            if success:
                print("✅ Documentation generation test completed successfully!")
                
                # Show generated files
                docs_path = Path(temp_docs_dir)
                generated_files = list(docs_path.rglob("*.md"))
                
                print(f"\n📋 Generated {len(generated_files)} documentation file(s):")
                for file_path in generated_files:
                    rel_path = file_path.relative_to(docs_path)
                    print(f"   📄 {rel_path}")
                    
                    # Show first few lines of content
                    with open(file_path, 'r') as f:
                        lines = f.readlines()[:10]
                        print(f"      Preview (first 10 lines):")
                        for i, line in enumerate(lines, 1):
                            print(f"      {i:2}: {line.rstrip()}")
                        if len(f.readlines()) > 10:
                            print(f"      ... ({len(f.readlines()) + 10} total lines)")
                        print()
            else:
                print("❌ Documentation generation failed!")
                
        except Exception as e:
            print(f"❌ Error running documentation generation: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_documentation_generation()