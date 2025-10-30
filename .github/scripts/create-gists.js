#!/usr/bin/env node

/**
 * Creates GitHub Gists for new example files.
 * This runs after example detection but before documentation generation.
 */

import axios from 'axios';
import { readFileSync, writeFileSync, appendFileSync } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import { program } from 'commander';

class GistManager {
    constructor(githubToken) {
        this.githubToken = githubToken;
        this.githubHeaders = githubToken ? {
            'Content-Type': 'application/json',
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        } : null;
    }

    /**
     * Extract basic analysis from code content for Gist description
     */
    analyzeCodeBasic(codeContent, filePath) {
        const pathObj = path.parse(filePath);
        const category = this.getCategoryFromPath(filePath);
        
        // Basic analysis from code
        const barcodeTypes = [];
        if (codeContent.includes('EncodeTypes.Code128')) barcodeTypes.push('Code128');
        if (codeContent.includes('EncodeTypes.QR')) barcodeTypes.push('QR Code');
        if (codeContent.includes('EncodeTypes.DataMatrix')) barcodeTypes.push('DataMatrix');
        if (codeContent.includes('EncodeTypes.PDF417')) barcodeTypes.push('PDF417');
        if (codeContent.includes('EncodeTypes.Aztec')) barcodeTypes.push('Aztec');

        const title = pathObj.name.replace('Example', '').replace(/_/g, ' ');
        
        return {
            title: title,
            category: category,
            barcode_types: barcodeTypes,
            description: `Demonstrates ${category.toLowerCase()} functionality in Aspose.BarCode for .NET`
        };
    }

    /**
     * Extract category from file path
     */
    getCategoryFromPath(filePath) {
        const categories = ['Generation', 'Reading', 'Formatting', 'Advanced'];
        for (const category of categories) {
            if (filePath.includes(category)) {
                return category;
            }
        }
        return 'General';
    }

    /**
     * Create a GitHub Gist with the example code
     */
    async createGist(codeContent, analysis, examplePath) {
        if (!this.githubToken) {
            console.log('⚠️ No GitHub token provided, skipping Gist creation');
            return null;
        }

        try {
            const fileName = path.basename(examplePath);
            const description = `${analysis.title} - Aspose.BarCode for .NET Example`;
            
            const gistPayload = {
                description: description,
                public: true,
                files: {
                    [fileName]: {
                        content: codeContent
                    },
                    'README.md': {
                        content: `# ${analysis.title}\n\n${analysis.description}\n\n## Category\n\n${analysis.category}\n\n## Barcode Types\n\n${analysis.barcode_types.length > 0 ? analysis.barcode_types.join(', ') : 'Various types supported'}\n\n## Usage\n\n1. Copy the C# code from this Gist\n2. Add it to your Aspose.BarCode project\n3. Ensure you have the proper license setup (see LicenseHelper.cs)\n4. Run the example\n\n---\n\n*This example is part of the [Aspose.BarCode for .NET Examples](https://github.com/aspose-barcode/Aspose.BarCode-for-.NET) repository.*`
                    }
                }
            };

            console.log(`🔄 Creating GitHub Gist for: ${analysis.title}`);
            
            const response = await axios.post('https://api.github.com/gists', gistPayload, {
                headers: this.githubHeaders,
                timeout: 15000
            });

            const gistData = response.data;
            console.log(`✅ Gist created: ${gistData.html_url}`);
            
            return {
                id: gistData.id,
                url: gistData.html_url,
                rawUrl: gistData.files[fileName].raw_url,
                embedUrl: `<script src="${gistData.html_url}.js"></script>`,
                fileName: fileName,
                examplePath: examplePath
            };
        } catch (error) {
            console.log(`⚠️ Failed to create Gist: ${error.message}`);
            if (error.response) {
                console.log(`Response status: ${error.response.status}`);
                console.log(`Response data: ${JSON.stringify(error.response.data)}`);
            }
            return null;
        }
    }

    /**
     * Main method to create Gist for an example file
     */
    async createGistForExample(exampleFile, examplesRepoPath) {
        const examplePath = path.join(examplesRepoPath, exampleFile);
        
        if (!existsSync(examplePath)) {
            console.error(`❌ Example file not found: ${examplePath}`);
            return null;
        }
        
        // Read the example code
        const codeContent = readFileSync(examplePath, 'utf8');
        
        console.log(`🔍 Processing example: ${exampleFile}`);
        
        // Basic analysis for Gist metadata
        const analysis = this.analyzeCodeBasic(codeContent, examplePath);
        
        console.log(`📊 Basic analysis complete: ${analysis.title}`);
        
        // Create GitHub Gist
        const gistInfo = await this.createGist(codeContent, analysis, examplePath);
        
        if (gistInfo) {
            console.log(`🔗 Gist created successfully: ${gistInfo.url}`);
            
            // Save Gist info for the documentation generation step
            const gistDataFile = path.join(process.cwd(), `gist-${path.basename(exampleFile, '.cs')}.json`);
            writeFileSync(gistDataFile, JSON.stringify(gistInfo, null, 2));
            console.log(`💾 Gist data saved: ${gistDataFile}`);
            
            return gistInfo;
        }
        
        return null;
    }
}

/**
 * Main function for CLI usage
 */
async function main() {
    program
        .requiredOption('--example-file <file>', 'Path to the example file')
        .requiredOption('--examples-repo <path>', 'Path to examples repository')
        .parse();

    const options = program.opts();
    
    // Get GitHub token from environment
    const githubToken = process.env.GITHUB_GIST_TOKEN || process.env.GITHUB_TOKEN;
    if (!githubToken) {
        console.log('⚠️ No GITHUB_GIST_TOKEN or GITHUB_TOKEN provided - Gist creation will be skipped');
        process.exit(0);
    }
    
    // Initialize Gist manager
    const gistManager = new GistManager(githubToken);
    
    // Create Gist
    try {
        const gistInfo = await gistManager.createGistForExample(
            options.exampleFile,
            options.examplesRepo
        );
        
        if (gistInfo) {
            // Output for GitHub Actions
            const githubOutput = process.env.GITHUB_OUTPUT;
            if (githubOutput) {
                appendFileSync(githubOutput, `gist_created=true\n`);
                appendFileSync(githubOutput, `gist_url=${gistInfo.url}\n`);
                appendFileSync(githubOutput, `gist_id=${gistInfo.id}\n`);
            }
            
            console.log('🎉 Gist creation completed successfully');
            process.exit(0);
        } else {
            console.log('⚠️ Gist creation was skipped or failed');
            process.exit(0);
        }
    } catch (error) {
        console.error(`❌ Error during Gist creation: ${error.message}`);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

// Export for testing
export { GistManager };