# GitHub Copilot Instructions for Aspose.BarCode .NET Examples

## 🏗️ Architecture Overview

This is a **multi-project .NET solution** demonstrating Aspose.BarCode for .NET capabilities:

- **Examples.Core**: Core library containing all barcode examples organized by category (Generation/, Reading/, Formatting/, Advanced/)
- **Examples.Console**: CLI runner with Microsoft.Extensions.Hosting, supports category-specific execution
- **Examples.Tests**: xUnit test suite for validation

## 🔑 Critical License Management Pattern

**ALWAYS call `LicenseHelper.SetLicense()` first** in any barcode operation. The system uses a sophisticated multi-location license detection:

```csharp
// Required pattern at start of any example
LicenseHelper.SetLicense();
```

License search order: custom path → environment var `ASPOSE_LICENSE_PATH` → root folder → `licenses/` → parent dirs → embedded resource. Without license, runs in evaluation mode with Code39-only limitations.

## 📁 File Output Convention

All examples follow this **mandatory path pattern**:

```csharp
var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
var outPath = Path.Combine(baseDir, "data", "outputs", $"{outputBaseName}.png");
Directory.CreateDirectory(Path.GetDirectoryName(outPath)!);
```

Output files go to `data/outputs/` with emoji-prefixed console logging (`🔄`, `✅`, `📄`).

## 🎯 Example Class Pattern

Static classes with `Run(string outputBaseName)` method:

```csharp
public static class YourExample
{
    public static void Run(string outputBaseName)
    {
        LicenseHelper.SetLicense();
        // Barcode logic with file naming: {outputBaseName}_{variant}.png
    }
}
```

Register in `Program.cs` DemoRunner methods by category (Generation, Reading, Formatting, Advanced).

## 🚀 Build & Run Commands

```bash
# Build entire solution
dotnet build aspose-barcode-net-examples.sln

# Run specific categories
cd Examples.Console
dotnet run generation    # Only generation examples
dotnet run all          # All categories (default)

# Run tests
dotnet test
```

## 🧪 Testing Requirements

Test files use `Guid.NewGuid():N` for unique names and **always cleanup** in finally blocks:

```csharp
var testOutputName = $"Test_Example_{Guid.NewGuid():N}";
try {
    Example.Run(testOutputName);
    Assert.True(File.Exists(expectedFile));
} finally {
    if (File.Exists(expectedFile)) File.Delete(expectedFile);
}
```

## ⚙️ Key Configuration

- **Target Framework**: .NET 9.0 (Examples.Core uses Aspose.BarCode v24.9.0)
- **Console App**: Uses Microsoft.Extensions.Hosting pattern with DemoRunner IHostedService
- **License Config**: `appsettings.json` → `Aspose:LicensePath` setting
- **Directory Structure**: Strict separation - Core (logic), Console (runner), Tests (validation)

## 🎨 Barcode Generation Patterns

Standard properties for consistent output:
- `XDimension.Pixels = 2`
- `Resolution = 300` 
- `CodeTextParameters.Location = CodeLocation.Below`
- Support both PNG and SVG formats
- Use `EncodeTypes.Code128` for text, `EncodeTypes.QR` for QR codes

## 🔍 Common Pitfalls

- Never skip `LicenseHelper.SetLicense()` - causes evaluation mode
- Always use `AppContext.BaseDirectory` path resolution, not relative paths
- Include `Directory.CreateDirectory()` before file saves
- Follow emoji console output convention for user experience
- Test files must cleanup to avoid accumulation