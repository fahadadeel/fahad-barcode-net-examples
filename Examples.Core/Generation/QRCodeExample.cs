using Aspose.BarCode.Generation;
using System;
using System.IO;

namespace Examples.Core.Generation;

/// <summary>
/// Demonstrates QR code generation with different error correction levels and sizes.
/// Shows how to create QR codes with custom properties and multiple formats.
/// </summary>
public static class QRCodeExample
{
    public static void Run(string outputBaseName)
    {
        // Initialize license before any barcode operations
        LicenseHelper.SetLicense();

        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var outDir = Path.Combine(baseDir, "data", "outputs");
        
        // Ensure output directory exists
        Directory.CreateDirectory(outDir);

        Console.WriteLine($"🔄 Generating QR codes: {outputBaseName}");

        // Create QR codes with different error correction levels
        var errorLevels = new[] { QRErrorLevel.LevelL, QRErrorLevel.LevelM, QRErrorLevel.LevelQ, QRErrorLevel.LevelH };
        var levelNames = new[] { "Low", "Medium", "Quartile", "High" };

        for (int i = 0; i < errorLevels.Length; i++)
        {
            var fileName = Path.Combine(outDir, $"{outputBaseName}_QR_{levelNames[i]}.png");
            
            using var generator = new BarcodeGenerator(EncodeTypes.QR, "https://www.aspose.com");
            
            // Set QR code properties
            generator.Parameters.Barcode.QR.QrErrorLevel = errorLevels[i];
            generator.Parameters.Barcode.XDimension.Pixels = 4;
            generator.Parameters.Resolution = 300;
            
            // Customize appearance
            generator.Parameters.Border.Width.Pixels = 5;
            generator.Parameters.Border.DashStyle = BorderDashStyle.Solid;
            
            generator.Save(fileName, BarCodeImageFormat.Png);
            
            Console.WriteLine($"   ✅ QR ({levelNames[i]} Error Correction): {fileName}");
        }

        Console.WriteLine();
    }
}