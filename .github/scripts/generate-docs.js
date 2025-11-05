#!/usr/bin/env node

/**
 * Generates documentation for Aspose.BarCode examples using LiteLLM API.
 * Analyzes C# example code and creates structured documentation files.
 */

import axios from 'axios';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { program } from 'commander';

class DocumentationGenerator {
    constructor(apiKey, githubToken = null) {
        this.apiKey = apiKey;
        this.githubToken = githubToken;
        this.apiUrl = 'https://llm.professionalize.com/v1/chat/completions';
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
        this.githubHeaders = githubToken ? {
            'Content-Type': 'application/json',
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        } : null;
    }

    /**
     * Use LiteLLM to analyze the example code and extract information
     */
    async analyzeExampleCode(codeContent, filePath) {
        const prompt = `
Analyze this Aspose.BarCode for .NET example code and provide structured information:

File: ${filePath}
Code:
\`\`\`csharp
${codeContent}
\`\`\`

Please extract and provide:
1. Title: A clear, descriptive title for this example (MAXIMUM 4 WORDS - be concise but descriptive)
2. Description: A technical description of what this example demonstrates
3. Category: The main category (Generation, Reading, Formatting, Advanced)
4. Barcode Types: List of barcode types used (e.g., Code128, QR, DataMatrix)
5. Key Features: List of key Aspose.BarCode features demonstrated (MUST be an array of simple strings)
6. Keywords: SEO-friendly keywords for the documentation (as an array of strings)
7. Technical Summary: Brief technical explanation of the implementation
8. Code Explanation: Step-by-step explanation of the main code sections

IMPORTANT: 
- title MUST be 4 words or less (e.g., "Basic Barcode Generation", "QR Code Reading", "Barcode Workflow Example")
- key_features must be an array of simple strings, not objects
- barcode_types must be an array of simple strings
- keywords must be an array of simple strings

Respond in JSON format with these keys: title, description, category, barcode_types, key_features, keywords, technical_summary, code_explanation

Example format:
{
  "title": "Barcode Generation Example",
  "description": "Shows how to generate Code128 barcodes",
  "category": "Generation",
  "barcode_types": ["Code128"],
  "key_features": ["License initialization", "Barcode generation", "File saving"],
  "keywords": ["barcode", "Code128", "generation", "Aspose.BarCode"],
  "technical_summary": "...",
  "code_explanation": "..."
}
`;

        const payload = {
            model: 'gpt-oss',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert technical writer specializing in Aspose.BarCode for .NET documentation. Analyze code examples and provide comprehensive, accurate technical documentation.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3
        };

        try {
            const response = await axios.post(this.apiUrl, payload, { 
                headers: this.headers,
                timeout: 30000 
            });
            
            const content = response.data.choices[0].message.content;
            
            // Extract JSON from the response
            const jsonMatch = content.match(/\{.*\}/s);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                
                // Validate and clean the response
                let title = parsed.title || 'Unknown Example';
                
                // Enforce maximum 4 words for title
                const titleWords = title.split(/\s+/);
                if (titleWords.length > 4) {
                    console.log(`⚠️ Title too long (${titleWords.length} words): "${title}"`);
                    title = titleWords.slice(0, 4).join(' ');
                    console.log(`✂️ Truncated to: "${title}"`);
                }
                
                const cleaned = {
                    title: title,
                    description: parsed.description || 'Example description',
                    category: parsed.category || 'General',
                    barcode_types: Array.isArray(parsed.barcode_types) ? parsed.barcode_types : [],
                    key_features: Array.isArray(parsed.key_features) ? 
                        parsed.key_features.filter(f => typeof f === 'string' && f.trim()) : [],
                    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : 
                        (typeof parsed.keywords === 'string' ? parsed.keywords.split(',').map(k => k.trim()) : []),
                    technical_summary: parsed.technical_summary || '',
                    code_explanation: parsed.code_explanation || ''
                };
                
                console.log(`📋 AI Analysis Result:`, JSON.stringify(cleaned, null, 2));
                return cleaned;
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (error) {
            console.log(`⚠️ Error analyzing code with LiteLLM: ${error.message}`);
            console.log('🔄 Using fallback analysis...');
            return this.fallbackAnalysis(codeContent, filePath);
        }
    }

    /**
     * Fallback analysis if LiteLLM fails
     */
    fallbackAnalysis(codeContent, filePath) {
        const pathObj = path.parse(filePath);
        const category = this.getCategoryFromPath(filePath);
        
        // Basic analysis from code
        const barcodeTypes = [];
        if (codeContent.includes('EncodeTypes.Code128')) barcodeTypes.push('Code128');
        if (codeContent.includes('EncodeTypes.QR')) barcodeTypes.push('QR Code');
        if (codeContent.includes('EncodeTypes.DataMatrix')) barcodeTypes.push('DataMatrix');
        if (codeContent.includes('EncodeTypes.PDF417')) barcodeTypes.push('PDF417');
        if (codeContent.includes('EncodeTypes.Aztec')) barcodeTypes.push('Aztec');

        return {
            title: pathObj.name.replace('Example', '').replace(/_/g, ' '),
            description: `Demonstrates ${category.toLowerCase()} functionality in Aspose.BarCode for .NET`,
            category: category,
            barcode_types: barcodeTypes,
            key_features: ['Barcode Generation', 'File Output', 'Custom Parameters'],
            keywords: ['Aspose.BarCode', '.NET', category, 'Barcode', 'C#'],
            technical_summary: `This example shows how to use Aspose.BarCode for .NET for ${category.toLowerCase()}`,
            code_explanation: 'The example demonstrates basic usage patterns of the Aspose.BarCode library.'
        };
    }

    /**
     * Load Gist information from file created by create-gists.js
     */
    loadGistInfo(exampleFile, examplesRepoPath) {
        try {
            const baseName = path.basename(exampleFile, '.cs');
            
            // Try multiple locations for the gist file (dynamic paths for any repository)
            const possiblePaths = [
                // Same directory as this script (most reliable for local development)
                path.join(path.dirname(new URL(import.meta.url).pathname), `gist-${baseName}.json`),
                // In the examples repo .github/scripts directory  
                path.join(examplesRepoPath, '.github', 'scripts', `gist-${baseName}.json`),
                // GitHub Actions: Go up from examples-repo to main repo .github/scripts
                path.resolve(examplesRepoPath, '..', '.github', 'scripts', `gist-${baseName}.json`),
                // GitHub Actions: Use GITHUB_WORKSPACE environment variable if available
                process.env.GITHUB_WORKSPACE ? path.join(process.env.GITHUB_WORKSPACE, '.github', 'scripts', `gist-${baseName}.json`) : null,
                // GitHub Actions: Relative from current working directory
                path.resolve(process.cwd(), '..', '..', '..', '.github', 'scripts', `gist-${baseName}.json`),
                // Local development: Parent directory .github/scripts
                path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '.github', 'scripts', `gist-${baseName}.json`)
            ].filter(Boolean);
            
            for (const gistDataFile of possiblePaths) {
                console.log(`🔍 Looking for gist file: ${gistDataFile}`);
                
                if (existsSync(gistDataFile)) {
                    const gistData = JSON.parse(readFileSync(gistDataFile, 'utf8'));
                    console.log(`📖 Loaded Gist data from: ${gistDataFile}`);
                    console.log(`📖 Gist URL: ${gistData.url}`);
                    return gistData;
                }
            }
            
            console.log(`⚠️ No Gist data file found in any location for: gist-${baseName}.json`);
            return null;
        } catch (error) {
            console.log(`⚠️ Error loading Gist data: ${error.message}`);
            return null;
        }
    }

    /**
     * Create a GitHub Gist with the example code (DEPRECATED - moved to create-gists.js)
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
                        content: `# ${analysis.title}\n\n${analysis.description}\n\n## Key Features\n\n${analysis.key_features ? analysis.key_features.map(f => `- ${f}`).join('\n') : 'N/A'}\n\n## Barcode Types\n\n${analysis.barcode_types ? analysis.barcode_types.join(', ') : 'N/A'}\n\n---\n\n*This example is part of the [Aspose.BarCode for .NET Examples](https://github.com/aspose-barcode/Aspose.BarCode-for-.NET) repository.*`
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
                embedUrl: `<script src="${gistData.html_url}.js"></script>`
            };
        } catch (error) {
            console.log(`⚠️ Failed to create Gist: ${error.message}`);
            return null;
        }
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
     * Determine where to place the documentation in the docs repo
     */
    determineDocsPath(category, title) {
        // Map categories to documentation paths
        const categoryMap = {
            'Generation': 'net/developer-guide/barcode-generation',
            'Reading': 'net/developer-guide/barcode-reading',
            'Formatting': 'net/developer-guide/barcode-appearance',
            'Advanced': 'net/developer-guide/advanced-features'
        };
        
        const basePath = categoryMap[category] || 'net/developer-guide';
        
        // Create filename from title
        const filename = title
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/[-\s]+/g, '-')
            .toLowerCase();
        
        return `${basePath}/${filename}`;
    }

    /**
     * Generate the complete documentation content
     */
    generateDocumentationContent(analysis, codeContent, examplePath, gistInfo = null) {
        // Prepare front matter
        const frontMatter = {
            title: analysis.title,
            type: 'docs',
            description: analysis.description,
            keywords: analysis.keywords,
            ai_search_scope: 'barcode_dotnet_doc',
            ai_search_endpoint: 'https://docsearch.api.aspose.cloud/ask',
            weight: 10,
            feedback: 'BARCODECOM',
            notoc: true,
            url: `/net/${this.determineDocsPath(analysis.category, analysis.title).split('/').slice(2).join('/')}/`
        };

        // Add Gist information to front matter if available
        if (gistInfo) {
            frontMatter.gist_url = gistInfo.url;
            frontMatter.gist_id = gistInfo.id;
        }

        // Generate markdown content
        const contentParts = [];
        
        // Technical summary
        contentParts.push(analysis.technical_summary);
        contentParts.push('');
        
        // Key features (if available)
        if (analysis.key_features && analysis.key_features.length > 0) {
            contentParts.push('## Key Features');
            contentParts.push('');
            analysis.key_features.forEach(feature => {
                // Properly convert feature to string - handle objects, arrays, etc.
                let featureText;
                if (typeof feature === 'string') {
                    featureText = feature;
                } else if (typeof feature === 'object' && feature !== null) {
                    // Handle objects by extracting meaningful text
                    if (feature.name || feature.title || feature.description) {
                        featureText = feature.name || feature.title || feature.description;
                    } else if (Array.isArray(feature)) {
                        featureText = feature.join(', ');
                    } else {
                        // Try to extract the first string property
                        const stringProps = Object.values(feature).filter(val => typeof val === 'string');
                        featureText = stringProps.length > 0 ? stringProps[0] : JSON.stringify(feature);
                    }
                } else {
                    featureText = String(feature);
                }
                
                // Only add non-empty, meaningful features
                if (featureText && featureText.trim() && 
                    featureText !== '[object Object]' && 
                    featureText !== 'null' && 
                    featureText !== 'undefined' &&
                    featureText.length > 1) {
                    contentParts.push(`- ${featureText}`);
                }
            });
            contentParts.push('');
        }
        
        // Code explanation
        if (analysis.code_explanation) {
            contentParts.push(analysis.code_explanation);
            contentParts.push('');
        }
        
        // Source Code section with Gist integration
        contentParts.push('## Source Code');
        contentParts.push('');
        contentParts.push('The following code sample demonstrates the implementation:');
        contentParts.push('');
        
        if (gistInfo) {
            // Extract gist information for embedding
            const gistId = gistInfo.id;
            const fileName = gistInfo.fileName || path.basename(examplePath);
            
            // Extract owner from gist URL (e.g., https://gist.github.com/username/gistid)
            let owner = 'aspose-com-gists'; // Default for Aspose documentation
            try {
                if (gistInfo.url && typeof gistInfo.url === 'string' && gistInfo.url.includes('gist.github.com/')) {
                    const urlParts = gistInfo.url.split('/').filter(part => part.length > 0);
                    // URL format: https://gist.github.com/username/gistid
                    const gistGithubIndex = urlParts.findIndex(part => part === 'gist.github.com');
                    if (gistGithubIndex >= 0 && urlParts[gistGithubIndex + 1]) {
                        const extractedOwner = urlParts[gistGithubIndex + 1];
                        if (extractedOwner && extractedOwner !== gistId && extractedOwner.length > 0) {
                            owner = extractedOwner;
                        }
                    }
                }
            } catch (error) {
                console.log(`⚠️ Could not extract owner from gist URL, using default: ${owner}`);
            }
            
            console.log(`🔗 Embedding gist: owner="${owner}", gistId="${gistId}", fileName="${fileName}"`);
            contentParts.push(`{{< gist "${owner}" "${gistId}" "${fileName}" >}}`);
        } else {
            // Fallback to highlighted code if no gist available
            contentParts.push('{{< highlight csharp>}}');
            contentParts.push(this.cleanCodeForDocs(codeContent));
            contentParts.push('{{< /highlight >}}');
        }
        
        // Add usage instructions if Gist is available
        if (gistInfo) {
            contentParts.push('');
            contentParts.push('## How to Use This Example');
            contentParts.push('');
            contentParts.push('1. **Copy the Code**: Use the copy button in the code block above to copy the complete example');
            contentParts.push('2. **View Full Gist**: Visit the [complete example on GitHub Gist](' + gistInfo.url + ') for additional files and documentation');
            contentParts.push('3. **Download**: Clone the gist directly to your machine:');
            contentParts.push('   ```bash');
            contentParts.push(`   git clone https://gist.github.com/${gistInfo.id}.git`);
            contentParts.push('   ```');
            contentParts.push('4. **Integration**: Add the code to your Aspose.BarCode for .NET project and ensure proper license setup');
        }
        
        // Combine front matter and content
        const doc = matter.stringify(contentParts.join('\n'), frontMatter);
        return doc;
    }

    /**
     * Clean up code for documentation
     */
    cleanCodeForDocs(codeContent) {
        const lines = codeContent.split('\n');
        const cleanedLines = [];
        
        let inClass = false;
        let inMethod = false;
        let braceCount = 0;
        
        for (const line of lines) {
            const stripped = line.trim();
            
            // Skip using statements and namespace declarations
            if (stripped.startsWith('using ') || stripped.startsWith('namespace ')) {
                continue;
            }
            
            // Skip empty lines at the beginning
            if (!stripped && !inMethod) {
                continue;
            }
            
            // Track class and method boundaries
            if (stripped.includes('class ') && stripped.includes('public static class')) {
                inClass = true;
                continue;
            }
            
            if (inClass && stripped.includes('public static void Run(')) {
                inMethod = true;
                // Count braces in the method signature line
                braceCount += (stripped.match(/\{/g) || []).length - (stripped.match(/\}/g) || []).length;
                continue;
            }
            
            // Track braces to know when method ends
            if (inMethod) {
                braceCount += (stripped.match(/\{/g) || []).length - (stripped.match(/\}/g) || []).length;
                
                // Add the line (with original indentation adjusted)
                if (stripped) {
                    // Remove excessive indentation (assuming 8 spaces base indentation)
                    const adjustedLine = line.startsWith('        ') ? line.substring(8) : line;
                    cleanedLines.push(adjustedLine);
                } else {
                    cleanedLines.push('');
                }
                
                // Stop when method ends
                if (braceCount <= 0 && stripped.endsWith('}')) {
                    break;
                }
            }
        }
        
        // Remove trailing empty lines
        while (cleanedLines.length > 0 && !cleanedLines[cleanedLines.length - 1].trim()) {
            cleanedLines.pop();
        }
        
        return cleanedLines.join('\n');
    }

    /**
     * Main method to generate documentation
     */
    async generateDocs(exampleFile, examplesRepoPath, docsRepoPath) {
        const examplePath = path.join(examplesRepoPath, exampleFile);
        
        if (!existsSync(examplePath)) {
            console.error(`❌ Example file not found: ${examplePath}`);
            return false;
        }
        
        // Read the example code
        const codeContent = readFileSync(examplePath, 'utf8');
        
        console.log(`🔍 Analyzing example: ${exampleFile}`);
        
        // Analyze the code
        const analysis = await this.analyzeExampleCode(codeContent, examplePath);
        
        console.log(`📊 Analysis complete: ${analysis.title}`);
        
        // Load Gist information (created by create-gists.js)
        const gistInfo = this.loadGistInfo(exampleFile, examplesRepoPath);
        
        // Generate documentation content
        const docContent = this.generateDocumentationContent(analysis, codeContent, examplePath, gistInfo);
        
        // Determine output path
        const docsPath = this.determineDocsPath(analysis.category, analysis.title);
        const fullDocsPath = path.join(docsRepoPath, docsPath);
        
        // Create directory if it doesn't exist
        mkdirSync(path.dirname(fullDocsPath), { recursive: true });
        
        // Write documentation file
        const docFilePath = fullDocsPath + '.md';
        writeFileSync(docFilePath, docContent, 'utf8');
        
        console.log(`✅ Documentation generated: ${docFilePath}`);
        
        if (gistInfo) {
            console.log(`🔗 Gist integrated: ${gistInfo.url}`);
        }
        
        return true;
    }
}

/**
 * Main function for CLI usage
 */
async function main() {
    program
        .requiredOption('--example-file <file>', 'Path to the example file')
        .requiredOption('--examples-repo <path>', 'Path to examples repository')
        .requiredOption('--docs-repo <path>', 'Path to documentation repository')
        .parse();

    const options = program.opts();
    
    // Get API key from environment
    const apiKey = process.env.LITELLM_API_KEY;
    if (!apiKey) {
        console.error('❌ Error: LITELLM_API_KEY environment variable not set');
        process.exit(1);
    }
    
    // Get GitHub token from environment (optional - now only used for fallback)
    const githubToken = process.env.GITHUB_GIST_TOKEN || process.env.GITHUB_TOKEN;
    
    // Initialize generator
    const generator = new DocumentationGenerator(apiKey, githubToken);
    
    // Generate documentation
    try {
        const success = await generator.generateDocs(
            options.exampleFile,
            options.examplesRepo,
            options.docsRepo
        );
        
        if (success) {
            console.log('🎉 Documentation generation completed successfully');
            process.exit(0);
        } else {
            console.error('❌ Documentation generation failed');
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error during documentation generation: ${error.message}`);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

// Export for testing
export { DocumentationGenerator };