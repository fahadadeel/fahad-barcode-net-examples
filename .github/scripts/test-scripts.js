#!/usr/bin/env node

/**
 * Test script for the Node.js auto-documentation system.
 * Tests both detection and generation functionality.
 */

import { execSync } from 'child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import chalk from 'chalk';

async function testDetection() {
    console.log(chalk.blue('🧪 Testing Example Detection (Node.js)'));
    console.log('='.repeat(50));
    
    try {
        // Create temporary file for GitHub output
        const tempOutput = path.join(tmpdir(), 'github-output.txt');
        
        // Set environment variables
        process.env.GITHUB_OUTPUT = tempOutput;
        process.env.GITHUB_EVENT_NAME = 'push';
        
        // Import and run detection
        const { default: detectModule } = await import('./detect-examples.js');
        
        console.log(chalk.green('✅ Detection script test completed!'));
        
        // Clean up
        if (existsSync(tempOutput)) {
            rmSync(tempOutput);
        }
        delete process.env.GITHUB_OUTPUT;
        delete process.env.GITHUB_EVENT_NAME;
        
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ Detection test failed: ${error.message}`));
        return false;
    }
}

async function testGeneration() {
    console.log(chalk.blue('\\n🧪 Testing Documentation Generation (Node.js)'));
    console.log('='.repeat(50));
    
    try {
        // Create temporary directory for docs output
        const tempDocsDir = mkdtempSync(path.join(tmpdir(), 'test-docs-'));
        
        console.log(chalk.gray(`📁 Temporary docs directory: ${tempDocsDir}`));
        
        // Test with SimpleQR example
        const exampleFile = 'Examples.Core/Generation/SimpleQRExample.cs';
        console.log(chalk.gray(`📄 Testing with example: ${exampleFile}`));
        
        // Set test API key to trigger fallback
        process.env.LITELLM_API_KEY = 'test-key';
        
        // Import and test generation
        const { DocumentationGenerator } = await import('./generate-docs.js');
        const generator = new DocumentationGenerator('test-key');
        
        const success = await generator.generateDocs(
            exampleFile,
            path.join(process.cwd(), '../..'),
            tempDocsDir
        );
        
        if (success) {
            console.log(chalk.green('✅ Documentation generation test completed!'));
            
            // Check generated files
            const generatedFiles = execSync(`find ${tempDocsDir} -name "*.md"`, { encoding: 'utf8' })
                .trim()
                .split('\\n')
                .filter(f => f);
            
            console.log(chalk.cyan(`📋 Generated ${generatedFiles.length} documentation file(s):`));
            generatedFiles.forEach(file => {
                const relativePath = path.relative(tempDocsDir, file);
                console.log(chalk.gray(`   📄 ${relativePath}`));
            });
        }
        
        // Clean up
        rmSync(tempDocsDir, { recursive: true, force: true });
        delete process.env.LITELLM_API_KEY;
        
        return success;
    } catch (error) {
        console.error(chalk.red(`❌ Generation test failed: ${error.message}`));
        return false;
    }
}

async function testDependencies() {
    console.log(chalk.blue('🔍 Testing Node.js Dependencies'));
    console.log('='.repeat(30));
    
    try {
        await import('axios');
        console.log(chalk.green('✅ axios'));
        
        await import('simple-git');
        console.log(chalk.green('✅ simple-git'));
        
        await import('gray-matter');
        console.log(chalk.green('✅ gray-matter'));
        
        await import('commander');
        console.log(chalk.green('✅ commander'));
        
        await import('chalk');
        console.log(chalk.green('✅ chalk'));
        
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ Missing dependency: ${error.message}`));
        return false;
    }
}

function checkFileStructure() {
    console.log(chalk.blue('\\n📁 Checking File Structure'));
    console.log('='.repeat(30));
    
    const files = [
        'package.json',
        'detect-examples.js',
        'generate-docs.js',
        '../workflows/auto-documentation.yml',
        '../../Examples.Core/Generation/SimpleQRExample.cs'
    ];
    
    let allExist = true;
    files.forEach(file => {
        if (existsSync(file)) {
            console.log(chalk.green(`✅ ${file}`));
        } else {
            console.log(chalk.red(`❌ ${file} (NOT FOUND)`));
            allExist = false;
        }
    });
    
    return allExist;
}

async function main() {
    console.log(chalk.bold.blue('🚀 NODE.JS AUTO-DOCUMENTATION SYSTEM TEST'));
    console.log('='.repeat(60));
    
    const tests = [
        { name: 'Dependencies', fn: testDependencies },
        { name: 'File Structure', fn: checkFileStructure },
        { name: 'Detection', fn: testDetection },
        { name: 'Generation', fn: testGeneration }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            results.push(result);
        } catch (error) {
            console.error(chalk.red(`❌ ${test.name} test error: ${error.message}`));
            results.push(false);
        }
    }
    
    // Summary
    console.log(chalk.bold.blue('\\n📊 TEST SUMMARY'));
    console.log('='.repeat(20));
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(chalk.cyan(`✅ Passed: ${passed}/${total}`));
    
    if (passed === total) {
        console.log(chalk.bold.green('🎉 All tests passed! Node.js system is ready!'));
        console.log(chalk.yellow('\\n🚀 Next steps:'));
        console.log(chalk.gray('1. Add GitHub secrets (LITELLM_API_KEY, DOCUMENTATION_REPO_TOKEN)'));
        console.log(chalk.gray('2. Replace the Python workflow with Node.js workflow'));
        console.log(chalk.gray('3. Create a test pull request'));
        process.exit(0);
    } else {
        console.log(chalk.bold.red('⚠️ Some tests failed. Please fix the issues above.'));
        process.exit(1);
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error(chalk.red(`Fatal error: ${error.message}`));
        process.exit(1);
    });
}