using Aspose.BarCode.BarCodeRecognition;
using System;
using System.IO;

namespace Examples.Core.Reading;

/// <summary>
/// Demonstrates barcode reading capabilities from image files.
/// Shows how to read different types of barcodes and extract their data.
/// </summary>
public static class BasicReadingExample
{
    public static void Run(string inputBaseName)
    {
        // Initialize license before any barcode operations
        LicenseHelper.SetLicense();

        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var inputDir = Path.Combine(baseDir, "data", "inputs");
        
        Console.WriteLine($"🔄 Reading barcodes from: {inputBaseName}");

        // Try to read various barcode types from input directory
        var imageExtensions = new[] { ".png", ".jpg", ".jpeg", ".bmp", ".gif", ".tiff" };
        
        foreach (var ext in imageExtensions)
        {
            var imagePath = Path.Combine(inputDir, $"{inputBaseName}{ext}");
            
            if (File.Exists(imagePath))
            {
                ReadBarcodeFromFile(imagePath);
                break;
            }
        }

        // If no input file exists, demonstrate with a generated barcode
        if (!Directory.Exists(inputDir) || Directory.GetFiles(inputDir).Length == 0)
        {
            Console.WriteLine("ℹ️  No input files found. Generating sample barcode for reading demonstration...");
            GenerateAndReadSampleBarcode();
        }

        Console.WriteLine();
    }

    private static void ReadBarcodeFromFile(string imagePath)
    {
        Console.WriteLine($"📖 Reading from: {Path.GetFileName(imagePath)}");

        using var reader = new BarCodeReader(imagePath, DecodeType.AllSupportedTypes);
        
        foreach (var result in reader.ReadBarCodes())
        {
            Console.WriteLine($"   ✅ Found: {result.CodeTypeName}");
            Console.WriteLine($"      Text: {result.CodeText}");
            Console.WriteLine($"      Confidence: {result.Confidence}%");
            Console.WriteLine($"      Region: {result.Region}");
        }
    }

    private static void GenerateAndReadSampleBarcode()
    {
        var tempFile = Path.GetTempFileName() + ".png";
        
        try
        {
            // Generate a sample barcode
            using (var generator = new Aspose.BarCode.Generation.BarcodeGenerator(
                Aspose.BarCode.Generation.EncodeTypes.Code128, "Sample Data 123"))
            {
                generator.Save(tempFile, Aspose.BarCode.Generation.BarCodeImageFormat.Png);
            }

            // Read the generated barcode
            ReadBarcodeFromFile(tempFile);
        }
        finally
        {
            if (File.Exists(tempFile))
                File.Delete(tempFile);
        }
    }
}