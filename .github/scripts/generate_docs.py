#!/usr/bin/env python3
"""
Generates documentation for Aspose.BarCode examples using LiteLLM API.
Analyzes C# example code and creates structured documentation files.
"""

import os
import sys
import json
import argparse
import requests
import re
from pathlib import Path
import frontmatter


class DocumentationGenerator:
    def __init__(self, api_key):
        self.api_key = api_key
        self.api_url = "https://llm.professionalize.com/v1/chat/completions"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

    def analyze_example_code(self, code_content, file_path):
        """Use LiteLLM to analyze the example code and extract information"""
        
        prompt = f"""
Analyze this Aspose.BarCode for .NET example code and provide structured information:

File: {file_path}
Code:
```csharp
{code_content}
```

Please extract and provide:
1. Title: A clear, descriptive title for this example
2. Description: A technical description of what this example demonstrates
3. Category: The main category (Generation, Reading, Formatting, Advanced)
4. Barcode Types: List of barcode types used (e.g., Code128, QR, DataMatrix)
5. Key Features: List of key Aspose.BarCode features demonstrated
6. Keywords: SEO-friendly keywords for the documentation
7. Technical Summary: Brief technical explanation of the implementation
8. Code Explanation: Step-by-step explanation of the main code sections

Respond in JSON format with these keys: title, description, category, barcode_types, key_features, keywords, technical_summary, code_explanation
"""

        payload = {
            "model": "gpt-oss",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert technical writer specializing in Aspose.BarCode for .NET documentation. Analyze code examples and provide comprehensive, accurate technical documentation."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3
        }

        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Extract JSON from the response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")
                
        except Exception as e:
            print(f"Error analyzing code with LiteLLM: {e}")
            # Fallback analysis
            return self.fallback_analysis(code_content, file_path)

    def fallback_analysis(self, code_content, file_path):
        """Fallback analysis if LiteLLM fails"""
        path = Path(file_path)
        category = self.get_category_from_path(path)
        
        # Basic analysis from code
        barcode_types = []
        if "EncodeTypes.Code128" in code_content:
            barcode_types.append("Code128")
        if "EncodeTypes.QR" in code_content:
            barcode_types.append("QR Code")
        if "EncodeTypes.DataMatrix" in code_content:
            barcode_types.append("DataMatrix")
        if "EncodeTypes.PDF417" in code_content:
            barcode_types.append("PDF417")
        if "EncodeTypes.Aztec" in code_content:
            barcode_types.append("Aztec")

        return {
            "title": path.stem.replace("Example", "").replace("_", " "),
            "description": f"Demonstrates {category.lower()} functionality in Aspose.BarCode for .NET",
            "category": category,
            "barcode_types": barcode_types,
            "key_features": ["Barcode Generation", "File Output", "Custom Parameters"],
            "keywords": f"Aspose.BarCode, .NET, {category}, Barcode, C#",
            "technical_summary": f"This example shows how to use Aspose.BarCode for .NET for {category.lower()}",
            "code_explanation": "The example demonstrates basic usage patterns of the Aspose.BarCode library."
        }

    def get_category_from_path(self, path):
        """Extract category from file path"""
        for part in path.parts:
            if part in ['Generation', 'Reading', 'Formatting', 'Advanced']:
                return part
        return 'General'

    def determine_docs_path(self, category, title):
        """Determine where to place the documentation in the docs repo"""
        # Map categories to documentation paths
        category_map = {
            'Generation': 'net/developer-guide/barcode-generation',
            'Reading': 'net/developer-guide/barcode-reading',
            'Formatting': 'net/developer-guide/barcode-appearance',
            'Advanced': 'net/developer-guide/advanced-features'
        }
        
        base_path = category_map.get(category, 'net/developer-guide')
        
        # Create filename from title
        filename = re.sub(r'[^\w\s-]', '', title).strip()
        filename = re.sub(r'[-\s]+', '-', filename).lower()
        
        return f"{base_path}/{filename}"

    def generate_documentation_content(self, analysis, code_content, example_path):
        """Generate the complete documentation content"""
        
        # Prepare front matter
        front_matter = {
            'title': analysis['title'],
            'type': 'docs',
            'description': analysis['description'],
            'keywords': analysis['keywords'],
            'ai_search_scope': 'barcode_dotnet_doc',
            'ai_search_endpoint': 'https://docsearch.api.aspose.cloud/ask',
            'weight': 10,
            'feedback': 'BARCODECOM',
            'notoc': True,
            'url': f"/net/{self.determine_docs_path(analysis['category'], analysis['title']).split('/', 2)[-1]}/"
        }

        # Generate markdown content
        content_parts = []
        
        # Technical summary
        content_parts.append(analysis['technical_summary'])
        content_parts.append("")
        
        # Key features (if available)
        if analysis.get('key_features'):
            content_parts.append("## Key Features")
            for feature in analysis['key_features']:
                content_parts.append(f"- {feature}")
            content_parts.append("")
        
        # Code explanation
        if analysis.get('code_explanation'):
            content_parts.append(analysis['code_explanation'])
            content_parts.append("")
        
        # Code example
        content_parts.append("The following code sample demonstrates the implementation:")
        content_parts.append("")
        content_parts.append("{{< highlight csharp>}}")
        content_parts.append(self.clean_code_for_docs(code_content))
        content_parts.append("{{< /highlight >}}")
        
        # Combine front matter and content
        doc = frontmatter.Post("\n".join(content_parts), **front_matter)
        return frontmatter.dumps(doc)

    def clean_code_for_docs(self, code_content):
        """Clean up code for documentation"""
        lines = code_content.split('\n')
        cleaned_lines = []
        
        in_class = False
        in_method = False
        brace_count = 0
        
        for line in lines:
            stripped = line.strip()
            
            # Skip using statements and namespace declarations
            if stripped.startswith('using ') or stripped.startswith('namespace '):
                continue
            
            # Skip empty lines at the beginning
            if not stripped and not in_method:
                continue
            
            # Track class and method boundaries
            if 'class ' in stripped and 'public static class' in stripped:
                in_class = True
                continue
            
            if in_class and 'public static void Run(' in stripped:
                in_method = True
                continue
            
            # Track braces to know when method ends
            if in_method:
                brace_count += stripped.count('{') - stripped.count('}')
                
                # Skip the method signature line
                if 'public static void Run(' in stripped:
                    continue
                
                # Add the line (with original indentation adjusted)
                if stripped:
                    # Remove excessive indentation (assuming 8 spaces base indentation)
                    adjusted_line = line[8:] if line.startswith('        ') else line
                    cleaned_lines.append(adjusted_line)
                else:
                    cleaned_lines.append('')
                
                # Stop when method ends
                if brace_count <= 0 and stripped.endswith('}'):
                    break
        
        # Remove trailing empty lines
        while cleaned_lines and not cleaned_lines[-1].strip():
            cleaned_lines.pop()
        
        return '\n'.join(cleaned_lines)

    def generate_docs(self, example_file, examples_repo_path, docs_repo_path):
        """Main method to generate documentation"""
        
        example_path = Path(examples_repo_path) / example_file
        
        if not example_path.exists():
            print(f"Example file not found: {example_path}")
            return False
        
        # Read the example code
        with open(example_path, 'r', encoding='utf-8') as f:
            code_content = f.read()
        
        print(f"Analyzing example: {example_file}")
        
        # Analyze the code
        analysis = self.analyze_example_code(code_content, str(example_path))
        
        print(f"Analysis complete: {analysis['title']}")
        
        # Generate documentation content
        doc_content = self.generate_documentation_content(analysis, code_content, example_path)
        
        # Determine output path
        docs_path = self.determine_docs_path(analysis['category'], analysis['title'])
        full_docs_path = Path(docs_repo_path) / docs_path
        
        # Create directory if it doesn't exist
        full_docs_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write documentation file
        doc_file_path = full_docs_path.with_suffix('.md')
        with open(doc_file_path, 'w', encoding='utf-8') as f:
            f.write(doc_content)
        
        print(f"Documentation generated: {doc_file_path}")
        return True


def main():
    parser = argparse.ArgumentParser(description='Generate documentation for Aspose.BarCode examples')
    parser.add_argument('--example-file', required=True, help='Path to the example file')
    parser.add_argument('--examples-repo', required=True, help='Path to examples repository')
    parser.add_argument('--docs-repo', required=True, help='Path to documentation repository')
    
    args = parser.parse_args()
    
    # Get API key from environment
    api_key = os.getenv('LITELLM_API_KEY')
    if not api_key:
        print("Error: LITELLM_API_KEY environment variable not set")
        sys.exit(1)
    
    # Initialize generator
    generator = DocumentationGenerator(api_key)
    
    # Generate documentation
    success = generator.generate_docs(
        args.example_file,
        args.examples_repo,
        args.docs_repo
    )
    
    if success:
        print("Documentation generation completed successfully")
    else:
        print("Documentation generation failed")
        sys.exit(1)


if __name__ == "__main__":
    main()