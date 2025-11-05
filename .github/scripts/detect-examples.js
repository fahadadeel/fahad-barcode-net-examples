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
 * Get only newly added files (git status A) - ignore modifications
 */
function getGitChanges() {
    try {
        let command;
        if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
            // For PR, compare against base branch - only show Added files
            const baseSha = process.env.GITHUB_BASE_REF || 'main';
            command = `git diff --name-status origin/${baseSha}...HEAD`;
        } else {
            // For push, compare with previous commit - only show Added files
            command = 'git diff --name-status HEAD~1 HEAD';
        }
        
        const result = execSync(command, { encoding: 'utf8' });
        if (!result.trim()) {
            return [];
        }
        
        // Parse git status output and only include Added files (A)
        const statusLines = result.trim().split('\n');
        const addedFiles = [];
        
        for (const line of statusLines) {
            const parts = line.trim().split('\t');
            if (parts.length >= 2) {
                const status = parts[0];
                const filePath = parts[1];
                
                if (status === 'A') {
                    addedFiles.push(filePath);
                } else {
                    console.log(`ℹ️ Ignoring ${status} file: ${filePath} (only processing newly added files)`);
                }
            }
        }
        
        return addedFiles;
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
 * Main function to detect NEW examples only (git status A)
 */
function main() {
    console.log('🔍 Detecting NEW example files (git status A only)...');
    console.log('ℹ️ This workflow only processes newly added files. Modified files are ignored.');
    console.log('ℹ️ To update existing examples: delete the file, commit, then re-add as new file.');
    
    const addedFiles = getGitChanges();
    console.log(`📁 Newly added files: ${JSON.stringify(addedFiles)}`);
    
    // Filter for example files
    const newExampleFiles = [];
    for (const filePath of addedFiles) {
        if (isExampleFile(filePath)) {
            // In GitHub Actions, working directory is .github/scripts
            // Repository root is 2 levels up: ../..
            const repoRoot = path.resolve('..', '..');
            const fullFilePath = path.resolve(repoRoot, filePath);
            
            // Check if file exists (should exist since it's newly added)
            if (existsSync(fullFilePath)) {
                newExampleFiles.push({
                    path: filePath,
                    category: getExampleCategory(filePath),
                    name: path.basename(filePath, '.cs')
                });
            }
        }
    }
    
    console.log(`📊 NEW example files detected: ${JSON.stringify(newExampleFiles)}`);
    
    // Output for GitHub Actions
    const hasNewExamples = newExampleFiles.length > 0;
    const examplePaths = newExampleFiles.map(ex => ex.path);
    
    // Set outputs using environment files
    const githubOutput = process.env.GITHUB_OUTPUT;
    if (githubOutput) {
        appendFileSync(githubOutput, `has_new_examples=${hasNewExamples}\n`);
        appendFileSync(githubOutput, `examples=${JSON.stringify(examplePaths)}\n`);
    }
    
    console.log(`✅ Has NEW examples: ${hasNewExamples}`);
    console.log(`📋 NEW Examples JSON: ${JSON.stringify(examplePaths)}`);
    
    if (!hasNewExamples) {
        console.log('💡 No new examples found. Only newly added files (git status A) are processed.');
        console.log('💡 If you modified an existing example, delete and re-add it to trigger processing.');
    }
    
    // Always exit with code 0 for successful execution
    // The workflow will check has_new_examples output to determine next steps
    process.exit(0);
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}