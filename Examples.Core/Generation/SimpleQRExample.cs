using Aspose.BarCode.Generation;
using System;
using System.IO;

namespace Examples.Core.Generation;

/// <summary>
/// Demonstrates simple QR code generation with custom text.
/// Shows how to create QR codes with different data and save them as PNG files.
/// </summary>
public static class SimpleQRExample
{
    public static void Run(string outputBaseName)
    {
        // Initialize license before any barcode operations
        LicenseHelper.SetLicense();

        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var outPath = Path.Combine(baseDir, "data", "outputs", $"{outputBaseName}_SimpleQR.png");

        // Ensure output directory exists
        Directory.CreateDirectory(Path.GetDirectoryName(outPath)!);

        Console.WriteLine($"🔄 Generating simple QR code: {outputBaseName}");

        // Create a QR code with custom text
        using var generator = new BarcodeGenerator(EncodeTypes.QR, "https://www.aspose.com");
        
        // Set basic properties
        generator.Parameters.Barcode.XDimension.Pixels = 4;
        generator.Parameters.Resolution = 300;
        
        // Hide text below barcode for QR codes
        generator.Parameters.Barcode.CodeTextParameters.Location = CodeLocation.None;
        
        // Save the QR code
        generator.Save(outPath, BarCodeImageFormat.Png);

        Console.WriteLine($"✅ Simple QR code saved to: {outPath}");
        Console.WriteLine();
    }
}