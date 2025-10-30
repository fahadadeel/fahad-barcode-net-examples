using Aspose.BarCode.BarCodeRecognition;
using System;
using System.IO;

namespace Examples.Core.Reading;

/// <summary>
/// Test example to verify documentation and gist generation workflow.
/// </summary>
public static class BasicReadingExample_Test
{
    public static void Run()
    {
        LicenseHelper.SetLicense();

        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var sampleFile = Path.Combine(baseDir, "data", "inputs", "test-barcode.png");

        if (!File.Exists(sampleFile))
        {
            Console.WriteLine("⚠️ Sample barcode file not found. Generating one...");

            using var generator = new Aspose.BarCode.Generation.BarcodeGenerator(
                Aspose.BarCode.Generation.EncodeTypes.Code128, "Workflow Test 123"
            );

            generator.Save(sampleFile, Aspose.BarCode.Generation.BarCodeImageFormat.Png);
        }

        using var reader = new BarCodeReader(sampleFile, DecodeType.AllSupportedTypes);
        foreach (var result in reader.ReadBarCodes())
        {
            Console.WriteLine($"✅ Found barcode: {result.CodeText} ({result.CodeTypeName})");
        }
    }
}
