#!/usr/bin/env node

/**
 * Validates example files to ensure they are properly structured and executable
 * before proceeding to gist creation and documentation generation.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import path from 'path';
import { program } from 'commander';
import { fileURLToPath } from 'url';

// Get the repository root directory (two levels up from .github/scripts)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

class ExampleValidator {
    constructor() {
        this.validationResults = [];
    }

    /**
     * Extract category from file path
     */
    getCategoryFromPath(filePath) {
        const normalizedPath = filePath.replace(/\\/g, "/");
        const categories = ['Generation', 'Reading', 'Formatting', 'Advanced'];
        for (const category of categories) {
            if (normalizedPath.includes(category)) {
                return category;
            }
        }
        return null;
    }

    /**
     * Extract actual class name from C# file content
     */
    extractClassName(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            
            // Look for public static class declaration
            const classMatch = content.match(/public\s+static\s+class\s+([A-Za-z0-9_]+)/);
            if (classMatch) {
                return classMatch[1];
            }
            
            // Fallback: look for any class declaration
            const fallbackMatch = content.match(/class\s+([A-Za-z0-9_]+)/);
            if (fallbackMatch) {
                return fallbackMatch[1];
            }
            
            return null;
        } catch (error) {
            console.error(`❌ Error reading file ${filePath}: ${error.message}`);
            return null;
        }
    }

    /**
     * Validate example structure
     */
    validateStructure(filePath) {
        console.log(`🔍 Validating structure: ${filePath}`);
        
        const fullPath = path.resolve(REPO_ROOT, filePath);
        
        // Check if file exists
        if (!existsSync(fullPath)) {
            throw new Error(`Example file not found: ${fullPath}`);
        }
        
        // Check if it's a C# file
        if (!filePath.endsWith('.cs')) {
            throw new Error(`Not a C# file: ${filePath}`);
        }
        
        // Extract category and class name
        const category = this.getCategoryFromPath(filePath);
        if (!category) {
            throw new Error(`Cannot determine category from path: ${filePath}`);
        }
        
        const className = this.extractClassName(fullPath);
        if (!className) {
            throw new Error(`Cannot find public static class in file: ${filePath}`);
        }
        
        // Read file content for validation
        const content = readFileSync(fullPath, 'utf8');
        
        // Check for required elements
        if (!content.includes('LicenseHelper.SetLicense')) {
            throw new Error(`Example must call LicenseHelper.SetLicense(): ${filePath}`);
        }
        
        if (!content.match(/public\s+static.*Run/)) {
            throw new Error(`Example must have a public static Run method: ${filePath}`);
        }
        
        const expectedNamespace = `Examples.Core.${category}`;
        if (!content.includes(`namespace ${expectedNamespace}`)) {
            throw new Error(`Example must be in namespace ${expectedNamespace}: ${filePath}`);
        }
        
        console.log(`✅ Structure validation passed: ${className} in ${category}`);
        
        return {
            className,
            category,
            filePath,
            fullPath
        };
    }

    /**
     * Validate compilation
     */
    validateCompilation() {
        console.log(`🔨 Validating compilation...`);
        
        try {
            // First restore dependencies
            console.log(`📦 Restoring NuGet packages...`);
            execSync('dotnet restore aspose-barcode-net-examples.sln --verbosity minimal', { 
                cwd: REPO_ROOT,
                stdio: 'pipe',
                env: { 
                    ...process.env,
                    DOTNET_CLI_TELEMETRY_OPTOUT: '1',
                    NUGET_XMLDOC_MODE: 'skip'
                }
            });
            
            // Build the solution
            console.log(`🔨 Building solution...`);
            execSync('dotnet build aspose-barcode-net-examples.sln --configuration Release --verbosity minimal --no-restore', { 
                cwd: REPO_ROOT,
                stdio: 'pipe',
                env: { 
                    ...process.env,
                    DOTNET_CLI_TELEMETRY_OPTOUT: '1'
                }
            });
            
            console.log(`✅ Compilation successful`);
            return true;
        } catch (error) {
            console.error(`❌ Compilation failed`);
            if (error.stderr) {
                console.error(`Build errors: ${error.stderr}`);
            }
            if (error.stdout) {
                console.error(`Build output: ${error.stdout}`);
            }
            throw new Error(`Solution compilation failed: ${error.message}`);
        }
    }

    /**
     * Create and run a test program for the example
     */
    validateExecution(exampleInfo) {
        console.log(`🚀 Validating execution: ${exampleInfo.className}`);
        
        // Use /tmp for GitHub Actions compatibility
        const tempDirName = `temp_validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tempDir = path.join('/tmp', tempDirName);
        const testRunnerPath = path.join(tempDir, 'TestRunner.cs');
        const projectPath = path.join(tempDir, 'TestRunner.csproj');
        
        try {
            // Create temp directory and required data directories
            execSync(`mkdir -p "${tempDir}"`, { stdio: 'pipe' });
            execSync(`mkdir -p "${path.join(tempDir, 'data', 'inputs')}"`, { stdio: 'pipe' });
            execSync(`mkdir -p "${path.join(tempDir, 'data', 'outputs')}"`, { stdio: 'pipe' });
            
            // Create test runner C# file
            const testRunnerContent = this.generateTestRunner(exampleInfo);
            writeFileSync(testRunnerPath, testRunnerContent);
            
            // Create project file
            const projectContent = this.generateProjectFile();
            writeFileSync(projectPath, projectContent);
            
            // Build test runner
            console.log(`🔨 Building test runner in: ${tempDir}`);
            execSync('dotnet build --configuration Release --verbosity minimal', { 
                cwd: tempDir,
                stdio: 'pipe'
            });
            
            // Run test with timeout
            const runCommand = 'dotnet run --configuration Release';
            console.log(`📋 Executing: ${runCommand}`);
            const output = execSync(runCommand, { 
                cwd: tempDir,
                stdio: 'pipe',
                encoding: 'utf8',
                timeout: 90000,  // 90 second timeout for GitHub Actions
                env: { 
                    ...process.env,
                    DOTNET_CLI_TELEMETRY_OPTOUT: '1'  // Disable telemetry for faster execution
                }
            });
            
            console.log(`📋 Execution output:`);
            console.log(output);
            console.log(`✅ Execution validation passed`);
            
            return true;
            
        } catch (error) {
            console.error(`❌ Execution failed: ${error.message}`);
            if (error.stderr) {
                console.error(`📋 stderr: ${error.stderr}`);
            }
            if (error.stdout) {
                console.error(`📋 stdout: ${error.stdout}`);
            }
            throw new Error(`Example execution failed: ${error.message}`);
        } finally {
            // Cleanup
            try {
                execSync(`rm -rf "${tempDir}"`, { stdio: 'pipe' });
            } catch (cleanupError) {
                console.warn(`⚠️ Cleanup warning: ${cleanupError.message}`);
            }
        }
    }

    /**
     * Generate test runner C# code
     */
    generateTestRunner(exampleInfo) {
        return `using System;
using System.Reflection;
using System.Linq;
using Examples.Core;
using Examples.Core.${exampleInfo.category};

class TestRunner 
{
    static void Main() 
    {
        try 
        {
            Console.WriteLine("🔄 Running validation for: ${exampleInfo.className}");
            
            // Get the type dynamically
            var type = typeof(${exampleInfo.className});
            if (type == null) 
            {
                Console.WriteLine("❌ Class ${exampleInfo.className} not found");
                Environment.Exit(1);
            }
            
            // Find Run method with any signature
            var runMethods = type.GetMethods(BindingFlags.Public | BindingFlags.Static)
                                .Where(m => m.Name == "Run")
                                .ToArray();
            
            if (runMethods.Length == 0) 
            {
                Console.WriteLine("❌ No Run method found");
                Environment.Exit(1);
            }
            
            // Try to execute the most suitable Run method
            MethodInfo method = null;
            object[] parameters = null;
            
            // Prefer method with no parameters
            method = runMethods.FirstOrDefault(m => m.GetParameters().Length == 0);
            if (method != null) 
            {
                parameters = new object[0];
            }
            else 
            {
                // Try method with string parameter
                method = runMethods.FirstOrDefault(m => 
                    m.GetParameters().Length == 1 && 
                    m.GetParameters()[0].ParameterType == typeof(string));
                
                if (method != null) 
                {
                    parameters = new object[] { "validation_test_" + DateTime.Now.Ticks };
                }
                else 
                {
                    // Take first available method and provide default parameters
                    method = runMethods[0];
                    var paramTypes = method.GetParameters();
                    parameters = new object[paramTypes.Length];
                    
                    for (int i = 0; i < paramTypes.Length; i++) 
                    {
                        var paramType = paramTypes[i].ParameterType;
                        if (paramType == typeof(string)) 
                        {
                            parameters[i] = "validation_test_" + DateTime.Now.Ticks;
                        }
                        else if (paramType == typeof(int)) 
                        {
                            parameters[i] = 42;
                        }
                        else if (paramType == typeof(bool)) 
                        {
                            parameters[i] = true;
                        }
                        else 
                        {
                            parameters[i] = Activator.CreateInstance(paramType);
                        }
                    }
                }
            }
            
            Console.WriteLine($"📋 Executing: {method.Name}({string.Join(", ", method.GetParameters().Select(p => p.ParameterType.Name))})");
            
            // Execute the method
            method.Invoke(null, parameters);
            Console.WriteLine("✅ Example executed successfully");
        } 
        catch (Exception ex) 
        {
            Console.WriteLine($"❌ Execution failed: {ex.InnerException?.Message ?? ex.Message}");
            Environment.Exit(1);
        }
    }
}`;
    }

    /**
     * Generate project file for test runner
     */
    generateProjectFile() {
        // Use absolute path to Examples.Core project
        const examplesCoreProject = path.resolve(REPO_ROOT, 'Examples.Core', 'Examples.Core.csproj');
        
        return `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net9.0</TargetFramework>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="${examplesCoreProject}" />
  </ItemGroup>
</Project>`;
    }

    /**
     * Validate a single example file
     */
    async validateExample(filePath) {
        try {
            console.log(`\n🎯 Validating example: ${filePath}`);
            
            // 1. Validate structure
            const exampleInfo = this.validateStructure(filePath);
            
            // 2. Validate compilation (once for all examples)
            if (this.validationResults.length === 0) {
                this.validateCompilation();
            }
            
            // 3. Validate execution
            this.validateExecution(exampleInfo);
            
            const result = {
                filePath,
                status: 'valid',
                className: exampleInfo.className,
                category: exampleInfo.category
            };
            
            this.validationResults.push(result);
            console.log(`✅ Example validation passed: ${filePath}`);
            
            return result;
            
        } catch (error) {
            const result = {
                filePath,
                status: 'invalid',
                error: error.message
            };
            
            this.validationResults.push(result);
            console.error(`❌ Example validation failed: ${filePath} - ${error.message}`);
            
            throw error;
        }
    }
}

/**
 * Main function for CLI usage
 */
async function main() {
    program
        .requiredOption('--example-files <files>', 'Comma-separated list of example files to validate')
        .parse();

    const options = program.opts();
    const exampleFiles = options.exampleFiles.split(',').map(f => f.trim());
    
    console.log(`🔍 Validating ${exampleFiles.length} example files...`);
    console.log(`📂 Repository root: ${REPO_ROOT}`);
    console.log(`💼 Working directory: ${process.cwd()}`);
    console.log(`🖥️ Platform: ${process.platform}`);
    console.log(`🔧 Node version: ${process.version}`);
    
    const validator = new ExampleValidator();
    let allValid = true;
    
    for (const filePath of exampleFiles) {
        try {
            await validator.validateExample(filePath);
        } catch (error) {
            allValid = false;
            console.error(`💥 Validation failed for ${filePath}: ${error.message}`);
        }
    }
    
    // Summary
    const validResults = validator.validationResults.filter(r => r.status === 'valid');
    const invalidResults = validator.validationResults.filter(r => r.status === 'invalid');
    const validCount = validResults.length;
    const invalidCount = invalidResults.length;
    
    console.log(`\n📊 Validation Summary:`);
    console.log(`   ✅ Valid examples: ${validCount}`);
    console.log(`   ❌ Invalid examples: ${invalidCount}`);
    console.log(`   📋 Total: ${validator.validationResults.length}`);
    
    if (invalidCount > 0) {
        console.log(`\n❌ Invalid examples:`);
        invalidResults.forEach(result => {
            console.log(`   • ${result.filePath}: ${result.error}`);
        });
    }
    
    if (validCount > 0) {
        console.log(`\n✅ Valid examples:`);
        validResults.forEach(result => {
            console.log(`   • ${result.filePath} (${result.className} in ${result.category})`);
        });
    }
    
    // Output for GitHub Actions
    const validExamplePaths = validResults.map(r => r.filePath);
    const hasValidExamples = validCount > 0;
    
    const githubOutput = process.env.GITHUB_OUTPUT;
    if (githubOutput) {
        appendFileSync(githubOutput, `validation_passed=${hasValidExamples}\n`);
        appendFileSync(githubOutput, `valid_examples=${JSON.stringify(validExamplePaths)}\n`);
        appendFileSync(githubOutput, `validation_summary=Valid: ${validCount}, Invalid: ${invalidCount}, Total: ${validator.validationResults.length}\n`);
    }
    
    // Success if we have at least one valid example, even if some failed
    if (hasValidExamples) {
        console.log(`🎉 Validation completed: ${validCount} valid examples found!`);
        if (invalidCount > 0) {
            console.log(`⚠️ Note: ${invalidCount} examples failed validation and will be skipped.`);
        }
        process.exit(0);
    } else {
        console.error(`💥 All examples failed validation - no examples to process`);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

// Export for testing
export { ExampleValidator };