using Xunit;
using System.IO;
using System;
using Examples.Core.Reading;

namespace Examples.Tests;

/// <summary>
/// Tests for barcode reading functionality
/// </summary>
public class ReadingTests
{
    [Fact]
    public void BasicReadingExample_ShouldHandleNoInputFiles()
    {
        // Arrange
        var testInputName = $"NonExistent_{Guid.NewGuid():N}";

        // Act & Assert - Should not throw exception
        var exception = Record.Exception(() => BasicReadingExample.Run(testInputName));
        
        Assert.Null(exception);
    }

    [Fact]
    public void BasicReadingExample_ShouldGenerateAndReadSampleWhenNoInput()
    {
        // Arrange
        var testInputName = $"NoInput_{Guid.NewGuid():N}";
        var originalOut = Console.Out;
        var stringWriter = new StringWriter();

        try
        {
            // Capture console output
            Console.SetOut(stringWriter);

            // Act
            BasicReadingExample.Run(testInputName);

            // Assert
            var output = stringWriter.ToString();
            Assert.Contains("No input files found", output);
            Assert.Contains("Found: Code128", output);
        }
        finally
        {
            Console.SetOut(originalOut);
        }
    }
}