# GitHub Actions Workflow Summary

## Overview
This workflow automatically generates documentation for Aspose.BarCode .NET examples by creating GitHub Gists and embedding them in Hugo documentation format.

## Workflow Jobs

### 1. `detect-new-examples`
- **Purpose**: Detects changed example files from git diff
- **Script**: `.github/scripts/detect-examples.js`
- **Outputs**: 
  - `examples`: JSON array of changed example files
  - `has_new_examples`: Boolean indicating if new examples exist

### 2. `validate-examples`
- **Purpose**: Validates examples before processing
- **Script**: `.github/scripts/validate-examples.js`
- **Dependencies**: `detect-new-examples`
- **Matrix Strategy**: Processes each example in parallel
- **Validation Steps**:
  - File structure validation
  - C# compilation check
  - Method execution validation
- **Outputs**: `valid_examples`: JSON array of validated examples

### 3. `create-gists`
- **Purpose**: Creates GitHub Gists for validated examples
- **Script**: `.github/scripts/create-gists.js`
- **Dependencies**: `validate-examples`
- **Matrix Strategy**: Creates gists in parallel
- **Requirements**: `GITHUB_GIST_TOKEN` secret
- **Outputs**: Gist metadata including ID, URL, and filename

### 4. `generate-documentation`
- **Purpose**: Generates Hugo documentation with embedded gists
- **Script**: `.github/scripts/generate-docs.js`
- **Dependencies**: `create-gists`
- **Output Format**: Hugo shortcodes with proper Aspose format

## Hugo Shortcode Format

The generated documentation uses Aspose's standard gist embedding format:

```hugo
{{< gist "aspose-com-gists" "GIST_ID" "FILENAME.cs" >}}
```

## Key Features

1. **Robust Validation**: Each example is validated for structure, compilation, and execution
2. **Parallel Processing**: Matrix strategies for efficient processing
3. **Error Handling**: Continues processing even if some examples fail
4. **Path Resolution**: Uses consistent REPO_ROOT pattern for GitHub Actions compatibility
5. **Proper Documentation**: Generates Hugo-compatible documentation with Aspose formatting

## File Structure

```
.github/
├── workflows/
│   └── auto-documentation.yml    # Main workflow
└── scripts/
    ├── detect-examples.js        # Detect changed files
    ├── validate-examples.js      # Validate examples
    ├── create-gists.js          # Create GitHub Gists
    └── generate-docs.js         # Generate documentation
```

## Usage

The workflow triggers automatically on pushes to main branch that modify example files in:
- `Examples.Core/Generation/`
- `Examples.Core/Reading/`
- `Examples.Core/Formatting/`
- `Examples.Core/Advanced/`

Manual trigger is also available via workflow dispatch.