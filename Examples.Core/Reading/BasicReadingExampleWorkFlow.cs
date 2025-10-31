using Aspose.BarCode.BarCodeRecognition;
using Aspose.BarCode.Generation;
using System;
using System.IO;

namespace Examples.Core.Reading;

/// <summary>
/// Test example to verify documentation and gist generation workflow.
/// </summary>
public static class BasicReadingExampleWorkFlow
{
    public static void Run(string outputBaseName)
    {
        LicenseHelper.SetLicense();

        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var outputDir = Path.Combine(baseDir, "data", "outputs");
        Directory.CreateDirectory(outputDir);

        Console.WriteLine($"🔄 Workflow Test - Reading barcodes: {outputBaseName}");

        // Generate a test barcode first
        var testBarcodeFile = Path.Combine(outputDir, $"{outputBaseName}_test_barcode.png");
        using (var generator = new Aspose.BarCode.Generation.BarcodeGenerator(
            Aspose.BarCode.Generation.EncodeTypes.Code128, "Workflow Test 123"))
        {
            generator.Parameters.Barcode.XDimension.Pixels = 2;
            generator.Parameters.Resolution = 300;
            generator.Save(testBarcodeFile, Aspose.BarCode.Generation.BarCodeImageFormat.Png);
        }

        Console.WriteLine($"📄 Generated test barcode: {Path.GetFileName(testBarcodeFile)}");

        // Read the generated barcode
        using var reader = new BarCodeReader(testBarcodeFile, DecodeType.AllSupportedTypes);
        foreach (var result in reader.ReadBarCodes())
        {
            Console.WriteLine($"✅ Found barcode: {result.CodeText} ({result.CodeTypeName})");
        }

        Console.WriteLine($"✅ Workflow test completed successfully. Testing PR in QA branch.");
    }
}
