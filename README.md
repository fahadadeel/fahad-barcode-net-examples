# Aspose.BarCode for .NET Examples

This repository contains comprehensive examples demonstrating the capabilities of Aspose.BarCode for .NET, a powerful library for barcode generation and recognition.

## 🏗️ Project Structure

```
fahad-barcode-net-examples/            # Repository root
├── aspose-barcode-net-examples.sln    # Visual Studio solution file
├── README.md                          # This file
├── .gitignore                         # Git ignore file (excludes license files)
├── licenses/                          # License files directory
│   ├── README.md                      # License setup instructions
│   └── [Your license file here]      # Place your .lic file here
├── data/                              # Data folder for inputs and outputs
│   ├── inputs/                        # Sample barcode images for reading
│   └── outputs/                       # Generated barcode files
├── Examples.Console/                  # Console application to run examples
│   ├── Examples.Console.csproj
│   ├── Program.cs                     # Main entry point with license integration
│   └── appsettings.json              # Configuration (including license path)
├── Examples.Core/                     # Core library with example implementations
│   ├── Examples.Core.csproj           # Aspose.BarCode package reference
│   ├── LicenseHelper.cs              # Flexible license management
│   ├── Generation/                    # Barcode generation examples
│   │   ├── BasicGenerationExample.cs
│   │   └── QRCodeExample.cs
│   ├── Reading/                       # Barcode reading examples
│   │   └── BasicReadingExample.cs
│   ├── Formatting/                    # Styling and formatting examples
│   │   └── FormattingExample.cs
│   └── Advanced/                      # Advanced barcode features
│       └── AdvancedBarcodeExample.cs
└── Examples.Tests/                    # Unit tests
    ├── Examples.Tests.csproj
    ├── GenerationTests.cs
    └── ReadingTests.cs
```

## 🚀 Quick Start Guide

### Prerequisites

- **.NET 9.0 SDK** (or .NET 8.0+) 
- **Visual Studio 2022** (recommended) or **VS Code**
- **Aspose.BarCode for .NET license** (see license setup below)

### 1. Clone Repository

```bash
git clone <repository-url>
cd fahad-barcode-net-examples
```

### 2. License Setup (IMPORTANT)

**The examples require a valid Aspose.BarCode license to work properly.** Without a license, you'll run in evaluation mode with limitations.

#### Option A: Simple Setup (Recommended)
Place your license file in the root directory:
```bash
# Copy your license file to root folder
cp /path/to/your/Aspose.BarCode.NET.lic .
```

#### Option B: Organized Setup
Place your license file in the licenses folder:
```bash
# Copy your license file to licenses folder
cp /path/to/your/license.lic licenses/
```

#### Option C: Configuration File
Update `Examples.Console/appsettings.json`:
```json
{
  "Aspose": {
    "LicensePath": "/full/path/to/your/license.lic"
  }
}
```

#### Option D: Environment Variable
```bash
export ASPOSE_LICENSE_PATH="/path/to/your/license.lic"
```

### 3. Build and Run

```bash
# Build the solution
dotnet build aspose-barcode-net-examples.sln

# Run all examples
cd Examples.Console
dotnet run

# Or run specific examples
dotnet run generation    # Only generation examples
dotnet run reading       # Only reading examples
dotnet run formatting    # Only formatting examples
dotnet run advanced      # Only advanced examples
```

## 🔑 License Configuration Details

### Supported License File Names
The system automatically detects these license file patterns:
- `Aspose.BarCode.NET.lic` (official name)
- `Aspose.BarCode.lic` (alternative)
- `Aspose.Total.Product.Family.lic` (Total suite license)
- `AsposeBarcodeNet.lic` (simplified)
- `aspose-barcode.lic` (lowercase)
- `license.lic` (generic)
- Any `.lic` file

### License Search Locations (Automatic Detection)
The system searches in this order:
1. **Custom path** (from appsettings.json or parameter)
2. **Environment variable** (`ASPOSE_LICENSE_PATH`)
3. **Current directory** (root folder)
4. **Licenses folder** (`licenses/`)
5. **Parent directories** (`../`, `../../`)
6. **User home directory** (`~/`)
7. **Embedded resources**

### License Status Verification
When you run the examples, you'll see one of these messages:

✅ **Licensed Version:**
```
✅ Aspose.BarCode license loaded successfully from: YourLicense.lic
```

⚠️ **Evaluation Version:**
```
⚠️ No Aspose.BarCode license found...
📝 Running in evaluation mode with limitations
```

## 🎯 Example Categories

### 🔧 Generation Examples
- **BasicGenerationExample**: Code128 barcode generation with PNG and SVG output
- **QRCodeExample**: QR codes with different error correction levels (Low, Medium, Quartile, High)

### 📖 Reading Examples  
- **BasicReadingExample**: Multi-format barcode recognition with confidence scoring

### 🎨 Formatting Examples
- **FormattingExample**: Custom colors, fonts, borders, and styling options

### 🔬 Advanced Examples
- **AdvancedBarcodeExample**: DataMatrix, PDF417, and Aztec 2D barcodes

## 📁 Generated Output Files

After running examples successfully, check the `data/outputs/` folder for:

```
data/outputs/
├── BasicGeneration.png                    # Code128 barcode (PNG)
├── BasicGeneration.svg                    # Code128 barcode (SVG)
├── QRCodeGeneration_QR_Low.png           # QR with low error correction
├── QRCodeGeneration_QR_Medium.png        # QR with medium error correction
├── QRCodeGeneration_QR_Quartile.png      # QR with quartile error correction
├── QRCodeGeneration_QR_High.png          # QR with high error correction
├── FormattedBarcode_Colored.png          # Custom colored barcode
├── FormattedBarcode_CustomFont.png       # Custom font styling
├── FormattedBarcode_Styled.png           # Border and background styling
├── AdvancedBarcode_DataMatrix.png        # DataMatrix 2D barcode
├── AdvancedBarcode_PDF417.png            # PDF417 stacked barcode
└── AdvancedBarcode_Aztec.png             # Aztec 2D barcode
```

## 🧪 Running Tests

```bash
# Run all tests
dotnet test

# Run tests with detailed output
cd Examples.Tests
dotnet test --verbosity normal

# Run specific test class
dotnet test --filter "GenerationTests"
```

## ⚡ Features Demonstrated

### Barcode Generation
- **Multiple barcode types**: Code128, QR, DataMatrix, PDF417, Aztec
- **Custom dimensions and resolution**: Pixel-perfect control
- **Color customization**: Foreground, background, and text colors
- **Font styling**: Custom fonts, sizes, and positioning
- **Border and margin configuration**: Professional styling
- **Multiple output formats**: PNG, SVG, and more
- **Error correction levels**: Configurable for QR codes

### Barcode Reading
- **Multi-format recognition**: Automatic barcode type detection
- **Confidence scoring**: Reliability assessment
- **Region detection**: Precise location mapping
- **Batch processing**: Multiple barcodes in single operation

### Advanced Features
- **2D barcode optimization**: High-density data encoding
- **Specialized formats**: Transport, inventory, and ID applications
- **Thread-safe operations**: Production-ready implementation
- **Flexible licensing**: Multiple configuration options

## 🛠️ Development Guide

### Adding New Examples

1. **Create example class** in appropriate category folder (`Examples.Core/Generation/`, etc.)
2. **Follow the pattern**:
   ```csharp
   public static class YourExample
   {
       public static void Run(string outputBaseName)
       {
           // Initialize license
           LicenseHelper.SetLicense();
           
           // Your barcode logic here
       }
   }
   ```
3. **Add to Program.cs** in the appropriate runner method
4. **Create corresponding tests** in `Examples.Tests`

### Project Dependencies
- **Examples.Core**: Aspose.BarCode for .NET (v24.9.0)
- **Examples.Console**: Microsoft.Extensions.Hosting + Configuration
- **Examples.Tests**: xUnit + Moq testing frameworks

### Environment Requirements
- **.NET 9.0** (compatible with .NET 8.0+)
- **Aspose.BarCode for .NET** license
- **Visual Studio 2022** or **VS Code** (recommended)

## � Troubleshooting

### Common Issues

#### ❌ "No license found" message
- **Problem**: License file not detected
- **Solutions**:
  - Place license file in root folder: `Aspose.BarCode.NET.lic`
  - Check file name (see supported names above)
  - Set `ASPOSE_LICENSE_PATH` environment variable
  - Configure path in `appsettings.json`

#### ❌ "Evaluation version limitations"
- **Problem**: Running without proper license
- **Solutions**:
  - Obtain valid Aspose.BarCode license
  - Place license file in correct location
  - Verify license file is not corrupted

#### ❌ Build errors
- **Problem**: Missing dependencies or wrong .NET version
- **Solutions**:
  ```bash
  # Restore packages
  dotnet restore
  
  # Clean and rebuild
  dotnet clean
  dotnet build
  
  # Check .NET version
  dotnet --version  # Should be 9.0+ or 8.0+
  ```

#### ❌ "Project file does not exist"
- **Problem**: Running from wrong directory
- **Solution**: Ensure you're in the correct directory
  ```bash
  cd Examples.Console
  dotnet run
  ```

### Getting Help
- **License Issues**: Check `licenses/README.md`
- **API Questions**: [Aspose.BarCode Documentation](https://docs.aspose.com/barcode/net/)
- **Technical Support**: [Aspose.BarCode Forum](https://forum.aspose.com/c/barcode)

## 📄 License & Distribution

This project demonstrates **Aspose.BarCode for .NET** functionality. 

### License Requirements
- **Development**: Valid Aspose.BarCode license required
- **Evaluation**: Limited functionality without license
- **Distribution**: Follow Aspose licensing terms

### Get License
- **Trial**: [Free trial available](https://www.aspose.com/barcode/net/)
- **Purchase**: [Aspose.BarCode Pricing](https://purchase.aspose.com/barcode/net)
- **Total Suite**: Works with Aspose.Total licenses

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/new-example`
3. **Follow existing patterns** for consistency
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Submit pull request**

### Code Style
- Follow existing naming conventions
- Include XML documentation comments
- Add meaningful console output with emojis
- Handle errors gracefully

## 📚 Additional Resources

### Documentation
- [Aspose.BarCode for .NET Documentation](https://docs.aspose.com/barcode/net/)
- [API Reference](https://reference.aspose.com/barcode/net/)
- [Developer Guide](https://docs.aspose.com/barcode/net/developer-guide/)

### Support
- [Aspose.BarCode Forum](https://forum.aspose.com/c/barcode)
- [Technical Support](https://helpdesk.aspose.com/)
- [Knowledge Base](https://kb.aspose.com/)

### Related Projects
- [Aspose.BarCode for Java Examples](https://github.com/aspose-barcode/Aspose.BarCode-for-Java)
- [Aspose.BarCode for Python Examples](https://github.com/aspose-barcode/Aspose.BarCode-for-Python-via-.NET)

---

**Built with ❤️ using Aspose.BarCode for .NET**

*Last updated: October 2025*