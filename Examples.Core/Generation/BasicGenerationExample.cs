using Aspose.BarCode.Generation;
using System;
using System.IO;

namespace Examples.Core.Generation;

/// <summary>
/// Demonstrates basic barcode generation with Code128 encoding.
/// Creates different types of barcodes and saves them as PNG and SVG files.
/// </summary>
public static class BasicGenerationExample
{
    public static void Run(string outputBaseName)
    {
        // Initialize license before any barcode operations
        LicenseHelper.SetLicense();

        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var outPng = Path.Combine(baseDir, "data", "outputs", $"{outputBaseName}.png");
        var outSvg = Path.Combine(baseDir, "data", "outputs", $"{outputBaseName}.svg");

        // Ensure output directory exists
        Directory.CreateDirectory(Path.GetDirectoryName(outPng)!);

        Console.WriteLine($"🔄 Generating basic barcode: {outputBaseName}");

        // 1️⃣ Create a Code128 barcode
        using var generator = new BarcodeGenerator(EncodeTypes.Code128, "Aspose.BarCode Example");
        
        // 2️⃣ Set barcode properties
        generator.Parameters.Barcode.XDimension.Pixels = 2;
        generator.Parameters.Resolution = 300;
        
        // 3️⃣ Set display text
        generator.Parameters.Barcode.CodeTextParameters.Location = CodeLocation.Below;
        generator.Parameters.Barcode.CodeTextParameters.Font.Size.Pixels = 20;
        
        // 4️⃣ Save as PNG
        generator.Save(outPng, BarCodeImageFormat.Png);
        
        // 5️⃣ Save as SVG
        generator.Save(outSvg, BarCodeImageFormat.Svg);

        Console.WriteLine($"✅ Barcode saved to:");
        Console.WriteLine($"   📄 PNG: {outPng}");
        Console.WriteLine($"   📄 SVG: {outSvg}");
        Console.WriteLine();
    }
}