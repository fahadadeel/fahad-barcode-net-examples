#!/usr/bin/env node

/**
 * Detects new or modified examples in the Examples.Core directory
 * and outputs them as JSON for the GitHub Actions workflow.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { writeFileSync, appendFileSync } from 'fs';
import path from 'path';

/**
 * Get changed files from git diff
 */
function getGitChanges() {
    try {
        let command;
        if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
            // For PR, compare against base branch
            const baseSha = process.env.GITHUB_BASE_REF || 'main';
            command = `git diff --name-only origin/${baseSha}...HEAD`;
        } else {
            // For push, compare with previous commit
            command = 'git diff --name-only HEAD~1 HEAD';
        }
        
        const result = execSync(command, { encoding: 'utf8' });
        return result.trim() ? result.trim().split('\n') : [];
    } catch (error) {
        console.error(`Error getting git changes: ${error.message}`);
        return [];
    }
}

/**
 * Check if a file is an example file in Examples.Core
 */
function isExampleFile(filePath) {
  // Normalize slashes for consistency (important for GitHub runner)
console.log(`Checking filePath: ${filePath}`);  

  const normalizedPath = filePath.replace(/\\/g, "/");
  const pathParts = normalizedPath.split("/");

  console.log(`Checking normalizedPath: ${normalizedPath}`);
  console.log(`Checking pathParts: ${pathParts}`);
  // Must be in Examples.Core directory
  if (!pathParts.includes("Examples.Core")) {
    console.log(`Rejected: Not in Examples.Core`);
    return false;
  }

  // Must be a C# file
  if (!normalizedPath.endsWith(".cs")) {
    console.log(`Rejected: Not a C# file`);
    return false;
  }

  // Skip LicenseHelper.cs and test files
  const fileName = path.basename(normalizedPath);
  if (fileName === "LicenseHelper.cs" || fileName.includes("Test")) {
    console.log(`Rejected: Not a valid example file`);
    return false;
  }

  // Must be in a valid category directory
  const validCategories = ["Generation", "Reading", "Formatting", "Advanced"];
  return validCategories.some((category) => normalizedPath.includes(category));
}

/**
 * Extract the category from the file path
 */
function getExampleCategory(filePath) {
    const categories = ['Generation', 'Reading', 'Formatting', 'Advanced'];
    for (const category of categories) {
        if (filePath.includes(category)) {
            return category;
        }
    }
    return 'Unknown';
}

/**
 * Main function to detect new examples
 */
function main() {
    console.log('🔍 Detecting changed example files...');
    
    const changedFiles = getGitChanges();
    console.log(`📁 Changed files: ${JSON.stringify(changedFiles)}`);
    
    // Filter for example files
    const exampleFiles = [];
    for (const filePath of changedFiles) {
        if (isExampleFile(filePath)) {
            // Check if file exists (not deleted)
            if (existsSync(filePath)) {
                exampleFiles.push({
                    path: filePath,
                    category: getExampleCategory(filePath),
                    name: path.basename(filePath, '.cs')
                });
            }
        }
    }
    
    console.log(`📊 Example files detected: ${JSON.stringify(exampleFiles)}`);
    
    // Output for GitHub Actions
    const hasNewExamples = exampleFiles.length > 0;
    const examplePaths = exampleFiles.map(ex => ex.path);
    
    // Set outputs using environment files
    const githubOutput = process.env.GITHUB_OUTPUT;
    if (githubOutput) {
        appendFileSync(githubOutput, `has_new_examples=${hasNewExamples}\n`);
        appendFileSync(githubOutput, `examples=${JSON.stringify(examplePaths)}\n`);
    }
    
    console.log(`✅ Has new examples: ${hasNewExamples}`);
    console.log(`📋 Examples JSON: ${JSON.stringify(examplePaths)}`);
    
    // Exit with appropriate code
    process.exit(hasNewExamples ? 0 : 1);
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}