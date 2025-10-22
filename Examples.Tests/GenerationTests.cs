using Xunit;
using System.IO;
using System;
using Examples.Core.Generation;

namespace Examples.Tests;

/// <summary>
/// Tests for barcode generation functionality
/// </summary>
public class GenerationTests
{
    [Fact]
    public void BasicGenerationExample_ShouldCreateFiles()
    {
        // Arrange
        var testOutputName = $"Test_BasicGeneration_{Guid.NewGuid():N}";
        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var expectedPng = Path.Combine(baseDir, "data", "outputs", $"{testOutputName}.png");
        var expectedSvg = Path.Combine(baseDir, "data", "outputs", $"{testOutputName}.svg");

        try
        {
            // Act
            BasicGenerationExample.Run(testOutputName);

            // Assert
            Assert.True(File.Exists(expectedPng), $"PNG file should be created at {expectedPng}");
            Assert.True(File.Exists(expectedSvg), $"SVG file should be created at {expectedSvg}");
            
            // Verify files are not empty
            Assert.True(new FileInfo(expectedPng).Length > 0, "PNG file should not be empty");
            Assert.True(new FileInfo(expectedSvg).Length > 0, "SVG file should not be empty");
        }
        finally
        {
            // Cleanup
            if (File.Exists(expectedPng)) File.Delete(expectedPng);
            if (File.Exists(expectedSvg)) File.Delete(expectedSvg);
        }
    }

    [Fact]
    public void QRCodeExample_ShouldCreateMultipleFiles()
    {
        // Arrange
        var testOutputName = $"Test_QRCode_{Guid.NewGuid():N}";
        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var outputDir = Path.Combine(baseDir, "data", "outputs");
        var expectedFiles = new[]
        {
            Path.Combine(outputDir, $"{testOutputName}_QR_Low.png"),
            Path.Combine(outputDir, $"{testOutputName}_QR_Medium.png"),
            Path.Combine(outputDir, $"{testOutputName}_QR_Quartile.png"),
            Path.Combine(outputDir, $"{testOutputName}_QR_High.png")
        };

        try
        {
            // Act
            QRCodeExample.Run(testOutputName);

            // Assert
            foreach (var expectedFile in expectedFiles)
            {
                Assert.True(File.Exists(expectedFile), $"QR code file should be created at {expectedFile}");
                Assert.True(new FileInfo(expectedFile).Length > 0, $"File {expectedFile} should not be empty");
            }
        }
        finally
        {
            // Cleanup
            foreach (var file in expectedFiles)
            {
                if (File.Exists(file)) File.Delete(file);
            }
        }
    }

    [Fact]
    public void SimpleQRExample_ShouldCreateFile()
    {
        // Arrange
        var testOutputName = $"Test_SimpleQR_{Guid.NewGuid():N}";
        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var expectedFile = Path.Combine(baseDir, "data", "outputs", $"{testOutputName}_SimpleQR.png");

        try
        {
            // Act
            Examples.Core.Generation.SimpleQRExample.Run(testOutputName);

            // Assert
            Assert.True(File.Exists(expectedFile), $"QR code file should be created at {expectedFile}");
            Assert.True(new FileInfo(expectedFile).Length > 0, "QR code file should not be empty");
        }
        finally
        {
            // Cleanup
            if (File.Exists(expectedFile)) File.Delete(expectedFile);
        }
    }
}