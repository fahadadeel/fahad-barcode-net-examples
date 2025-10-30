#!/usr/bin/env node

/**
 * Detects new or modified examples in the Examples.Core directory
 * and outputs them as JSON for the GitHub Actions workflow.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { writeFileSync, appendFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the repository root directory (two levels up from .github/scripts)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

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
  const normalizedPath = filePath.replace(/\\/g, "/");
  const pathParts = normalizedPath.split("/");

  // Must be in Examples.Core directory
  if (!pathParts.includes("Examples.Core")) {
    return false;
  }

  // Must be a C# file
  if (!normalizedPath.endsWith(".cs")) {
    return false;
  }

  // Skip LicenseHelper.cs and test files
  const fileName = path.basename(normalizedPath);
  if (fileName === "LicenseHelper.cs" || fileName.includes("Test")) {
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
            // In GitHub Actions, working directory is .github/scripts
            // Repository root is 2 levels up: ../..
            const repoRoot = path.resolve('..', '..');
            const fullFilePath = path.resolve(repoRoot, filePath);
            
            // Check if file exists (not deleted)
            if (existsSync(fullFilePath)) {
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
    
    // Always exit with code 0 for successful execution
    // The workflow will check has_new_examples output to determine next steps
    process.exit(0);
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}