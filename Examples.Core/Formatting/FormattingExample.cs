using Aspose.BarCode.Generation;
using System;
using Aspose.Drawing;
using System.IO;

namespace Examples.Core.Formatting;

/// <summary>
/// Demonstrates various formatting options for barcodes including colors, fonts, and styling.
/// Shows how to customize the appearance of generated barcodes.
/// </summary>
public static class FormattingExample
{
    public static void Run(string outputBaseName)
    {
        // Initialize license before any barcode operations
        LicenseHelper.SetLicense();

        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var outDir = Path.Combine(baseDir, "data", "outputs");
        
        // Ensure output directory exists
        Directory.CreateDirectory(outDir);

        Console.WriteLine($"🔄 Generating formatted barcodes: {outputBaseName}");

        // Example 1: Custom colors
        CreateColoredBarcode(outDir, $"{outputBaseName}_Colored");
        
        // Example 2: Custom fonts
        CreateCustomFontBarcode(outDir, $"{outputBaseName}_CustomFont");
        
        // Example 3: With border and background
        CreateStyledBarcode(outDir, $"{outputBaseName}_Styled");

        Console.WriteLine();
    }

    private static void CreateColoredBarcode(string outDir, string fileName)
    {
        var filePath = Path.Combine(outDir, $"{fileName}.png");
        
        using var generator = new BarcodeGenerator(EncodeTypes.Code128, "COLORED-BARCODE-123");
        
        // Set custom colors
        generator.Parameters.Barcode.BarColor = Color.DarkBlue;
        generator.Parameters.BackColor = Color.LightYellow;
        generator.Parameters.Barcode.CodeTextParameters.Color = Color.DarkRed;
        
        // Set dimensions
        generator.Parameters.Barcode.XDimension.Pixels = 2;
        generator.Parameters.Resolution = 300;
        
        generator.Save(filePath, BarCodeImageFormat.Png);
        Console.WriteLine($"   ✅ Colored barcode: {filePath}");
    }

    private static void CreateCustomFontBarcode(string outDir, string fileName)
    {
        var filePath = Path.Combine(outDir, $"{fileName}.png");
        
        using var generator = new BarcodeGenerator(EncodeTypes.Code128, "CUSTOM-FONT-456");
        
        // Set custom font
        generator.Parameters.Barcode.CodeTextParameters.Font.FamilyName = "Arial";
        generator.Parameters.Barcode.CodeTextParameters.Font.Size.Pixels = 24;
        generator.Parameters.Barcode.CodeTextParameters.Font.Style = Aspose.Drawing.FontStyle.Bold | Aspose.Drawing.FontStyle.Italic;
        generator.Parameters.Barcode.CodeTextParameters.Location = CodeLocation.Below;
        
        // Set dimensions
        generator.Parameters.Barcode.XDimension.Pixels = 2;
        generator.Parameters.Resolution = 300;
        
        generator.Save(filePath, BarCodeImageFormat.Png);
        Console.WriteLine($"   ✅ Custom font barcode: {filePath}");
    }

    private static void CreateStyledBarcode(string outDir, string fileName)
    {
        var filePath = Path.Combine(outDir, $"{fileName}.png");
        
        using var generator = new BarcodeGenerator(EncodeTypes.Code128, "STYLED-BARCODE-789");
        
        // Set border
        generator.Parameters.Border.Width.Pixels = 3;
        generator.Parameters.Border.DashStyle = BorderDashStyle.Dash;
        generator.Parameters.Border.Color = Color.Purple;
        
        // Set background
        generator.Parameters.BackColor = Color.LightGray;
        
        // Set barcode appearance
        generator.Parameters.Barcode.BarColor = Color.Black;
        generator.Parameters.Barcode.XDimension.Pixels = 3;
        generator.Parameters.Resolution = 300;
        
        // Set margins
        generator.Parameters.ImageWidth.Pixels = 400;
        generator.Parameters.ImageHeight.Pixels = 200;
        
        generator.Save(filePath, BarCodeImageFormat.Png);
        Console.WriteLine($"   ✅ Styled barcode: {filePath}");
    }
}