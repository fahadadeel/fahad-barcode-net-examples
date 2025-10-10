using Aspose.BarCode.Generation;
using System;
using System.IO;

namespace Examples.Core.Advanced;

/// <summary>
/// Demonstrates advanced barcode features including DataMatrix, PDF417, and Aztec codes.
/// Shows complex data encoding and specialized barcode types.
/// </summary>
public static class AdvancedBarcodeExample
{
    public static void Run(string outputBaseName)
    {
        // Initialize license before any barcode operations
        LicenseHelper.SetLicense();

        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var outDir = Path.Combine(baseDir, "data", "outputs");
        
        // Ensure output directory exists
        Directory.CreateDirectory(outDir);

        Console.WriteLine($"🔄 Generating advanced barcodes: {outputBaseName}");

        // Example 1: DataMatrix
        CreateDataMatrixBarcode(outDir, $"{outputBaseName}_DataMatrix");
        
        // Example 2: PDF417
        CreatePDF417Barcode(outDir, $"{outputBaseName}_PDF417");
        
        // Example 3: Aztec
        CreateAztecBarcode(outDir, $"{outputBaseName}_Aztec");

        Console.WriteLine();
    }

    private static void CreateDataMatrixBarcode(string outDir, string fileName)
    {
        var filePath = Path.Combine(outDir, $"{fileName}.png");
        
        using var generator = new BarcodeGenerator(EncodeTypes.DataMatrix, 
            "DataMatrix can encode large amounts of data in a compact square format. " +
            "This is perfect for tracking and identification applications.");
        
        // Set DataMatrix properties
        generator.Parameters.Barcode.XDimension.Pixels = 4;
        generator.Parameters.Barcode.DataMatrix.DataMatrixEcc = DataMatrixEccType.Ecc200;
        generator.Parameters.Resolution = 300;
        
        generator.Save(filePath, BarCodeImageFormat.Png);
        Console.WriteLine($"   ✅ DataMatrix barcode: {filePath}");
    }

    private static void CreatePDF417Barcode(string outDir, string fileName)
    {
        var filePath = Path.Combine(outDir, $"{fileName}.png");
        
        using var generator = new BarcodeGenerator(EncodeTypes.Pdf417, 
            "PDF417 barcode format used in transport and inventory management.");
        
        // Set PDF417 properties with more appropriate dimensions
        generator.Parameters.Barcode.XDimension.Pixels = 2;
        generator.Parameters.Barcode.Pdf417.Rows = 10;
        generator.Parameters.Barcode.Pdf417.Columns = 8;
        generator.Parameters.Resolution = 300;
        
        generator.Save(filePath, BarCodeImageFormat.Png);
        Console.WriteLine($"   ✅ PDF417 barcode: {filePath}");
    }

    private static void CreateAztecBarcode(string outDir, string fileName)
    {
        var filePath = Path.Combine(outDir, $"{fileName}.png");
        
        using var generator = new BarcodeGenerator(EncodeTypes.Aztec, 
            "Aztec code is a 2D barcode format that can encode large amounts of data. " +
            "It's commonly used in transport applications and mobile ticketing.");
        
        // Set Aztec properties
        generator.Parameters.Barcode.XDimension.Pixels = 4;
        generator.Parameters.Barcode.Aztec.AztecErrorLevel = 23; // Error correction level
        generator.Parameters.Resolution = 300;
        
        generator.Save(filePath, BarCodeImageFormat.Png);
        Console.WriteLine($"   ✅ Aztec barcode: {filePath}");
    }
}