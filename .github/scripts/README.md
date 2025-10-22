# Auto-Documentation System

This directory contains the automated documentation generation system for Aspose.BarCode .NET Examples.

## Overview

The system automatically detects new or modified examples in the `Examples.Core` directory and generates comprehensive documentation using AI analysis. The generated documentation is then automatically submitted as pull requests to the [Aspose.BarCode Documentation repository](https://github.com/aspose-barcode/Aspose.BarCode-Documentation).

## Files

### Workflow
- `auto-documentation.yml` - Main GitHub Actions workflow that orchestrates the entire process

### Scripts
- `detect_examples.py` - Detects new/modified example files in git changes
- `generate_docs.py` - Uses LiteLLM API to analyze code and generate documentation
- `requirements.txt` - Python dependencies for the scripts

## How It Works

### 1. Trigger Detection
The workflow triggers on:
- Push to `main` or `develop` branches with changes in `Examples.Core/**/*.cs`
- Pull requests with changes to example files

### 2. Example Detection
- Analyzes git diff to find changed C# files
- Filters for actual example files (excludes `LicenseHelper.cs`, test files)
- Must be in valid category directories: `Generation`, `Reading`, `Formatting`, `Advanced`

### 3. AI Analysis
Uses LiteLLM API to analyze each example and extract:
- Descriptive title and technical description
- Category classification
- Barcode types demonstrated
- Key features and functionality
- SEO keywords
- Step-by-step code explanation

### 4. Documentation Generation
- Creates properly formatted Markdown with front matter
- Follows existing documentation structure and patterns
- Includes syntax-highlighted code examples
- Determines correct placement in documentation repository structure

### 5. Auto-PR Creation
- Checks out the documentation repository
- Places generated files in appropriate directories
- Creates pull request with detailed description
- Includes source information and change context

## Documentation Structure Mapping

Examples are mapped to documentation paths as follows:

| Example Category | Documentation Path |
|-----------------|-------------------|
| Generation | `net/developer-guide/barcode-generation/` |
| Reading | `net/developer-guide/barcode-reading/` |
| Formatting | `net/developer-guide/barcode-appearance/` |
| Advanced | `net/developer-guide/advanced-features/` |

## Setup Requirements

### Repository Secrets
The workflow requires these GitHub secrets:

1. **`LITELLM_API_KEY`** - API key for LiteLLM service
   - Get from: https://llm.professionalize.com/
   - Used for AI-powered code analysis

2. **`DOCUMENTATION_REPO_TOKEN`** - GitHub token with access to documentation repo
   - Must have `Contents: Write` and `Pull Requests: Write` permissions
   - For repository: `aspose-barcode/Aspose.BarCode-Documentation`

### LiteLLM API
The system uses LiteLLM API for code analysis:
- **Endpoint**: `https://llm.professionalize.com/v1/chat/completions`
- **Model**: `gpt-oss`
- **Authentication**: Bearer token

Example API call:
```bash
curl -XPOST https://llm.professionalize.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"gpt-oss","messages":[...]}'
```

## Generated Documentation Format

The system generates documentation following this structure:

```markdown
---
title: Example Title
type: docs
description: "Technical description of the example"
keywords: "Relevant, SEO, Keywords, Aspose.BarCode, .NET"
ai_search_scope: "barcode_dotnet_doc"
ai_search_endpoint: "https://docsearch.api.aspose.cloud/ask"
weight: 10
feedback: BARCODECOM
notoc: true
url: /net/path/to/documentation/
---

Technical summary and explanation of the example.

## Key Features
- Feature 1
- Feature 2

Detailed explanation of the implementation and usage.

{{< highlight csharp>}}
// Clean, properly formatted code example
{{< /highlight >}}
```

## Manual Testing

To test the scripts locally:

```bash
# Install dependencies
pip install -r .github/scripts/requirements.txt

# Test example detection
cd .github/scripts
python3 detect_examples.py

# Test documentation generation
python3 generate_docs.py \
  --example-file "Examples.Core/Generation/BasicGenerationExample.cs" \
  --examples-repo "../../" \
  --docs-repo "/path/to/docs/repo"
```

## Troubleshooting

### Common Issues

1. **No examples detected**
   - Check that files are in `Examples.Core` directory
   - Verify files follow naming conventions (not test files)
   - Ensure changes are in valid category directories

2. **LiteLLM API errors**
   - Verify `LITELLM_API_KEY` is set correctly
   - Check API endpoint availability
   - Monitor rate limits and usage

3. **Documentation repo access**
   - Verify `DOCUMENTATION_REPO_TOKEN` has correct permissions
   - Check repository name and access rights
   - Ensure token hasn't expired

4. **PR creation failures**
   - Check if branch already exists
   - Verify documentation repo write access
   - Review PR template and validation

### Debugging

Enable debug output by adding this to workflow:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

## Customization

### Adding New Categories
1. Update `detect_examples.py` - add category to `valid_categories`
2. Update `generate_docs.py` - add mapping in `category_map`
3. Test with example files in new category

### Modifying Documentation Template
Edit the `generate_documentation_content` method in `generate_docs.py` to adjust:
- Front matter structure
- Content organization
- Code formatting
- Styling and layout

### Changing AI Analysis
Modify the prompt in `analyze_example_code` method to:
- Extract different information
- Change analysis focus
- Adjust output format