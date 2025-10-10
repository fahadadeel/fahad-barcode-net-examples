using Aspose.BarCode;
using System;
using System.IO;
using System.Linq;

namespace Examples.Core;

/// <summary>
/// Centralized license management for Aspose.BarCode examples.
/// Handles license loading from multiple possible locations with fallback options.
/// </summary>
public static class LicenseHelper
{
    private static bool _licenseSet = false;
    private static readonly object _lockObject = new object();

    // Configurable license file patterns
    private static readonly string[] LicenseFilePatterns = new[]
    {
        "Aspose.BarCode.NET.lic",           // Default Aspose.BarCode license
        "Aspose.BarCode.lic",               // Alternative naming
        "AsposeBarcodeNet.lic",             // Simplified naming
        "aspose-barcode.lic",               // Lowercase with dash
        "license.lic",                      // Generic license file
        "*.lic"                             // Any .lic file as fallback
    };

    /// <summary>
    /// Attempts to set the Aspose.BarCode license from various locations.
    /// This method is thread-safe and will only attempt to set the license once.
    /// </summary>
    /// <param name="customLicensePath">Optional custom license file path to try first</param>
    public static void SetLicense(string? customLicensePath = null)
    {
        if (_licenseSet) return;

        lock (_lockObject)
        {
            if (_licenseSet) return; // Double-check after acquiring lock

            try
            {
                var license = new License();

                // Try custom license path first if provided
                if (!string.IsNullOrEmpty(customLicensePath) && TrySetLicenseFromFile(license, customLicensePath))
                {
                    return;
                }

                // Try environment variable
                var envLicensePath = Environment.GetEnvironmentVariable("ASPOSE_LICENSE_PATH");
                if (!string.IsNullOrEmpty(envLicensePath) && TrySetLicenseFromFile(license, envLicensePath))
                {
                    return;
                }

                // Try multiple license file patterns in various directories
                var searchDirectories = new[]
                {
                    ".",                                                        // Current directory
                    "licenses",                                                 // Licenses subfolder
                    "..",                                                       // Parent folder
                    "../..",                                                    // Two levels up
                    Environment.GetFolderPath(Environment.SpecialFolder.UserProfile) // User home
                };

                foreach (var directory in searchDirectories)
                {
                    if (TrySetLicenseFromDirectory(license, directory))
                    {
                        return;
                    }
                }

                // Try embedded resource as final fallback
                if (TrySetLicenseFromEmbeddedResource(license))
                {
                    return;
                }

                // No license found
                ShowNoLicenseMessage();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error setting Aspose.BarCode license: {ex.Message}");
                Console.WriteLine("📝 Running in evaluation mode with limitations");
            }
        }
    }

    private static bool TrySetLicenseFromFile(License license, string filePath)
    {
        try
        {
            if (File.Exists(filePath))
            {
                license.SetLicense(filePath);
                _licenseSet = true;
                Console.WriteLine($"✅ Aspose.BarCode license loaded successfully from: {Path.GetFileName(filePath)}");
                return true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️  Failed to load license from {filePath}: {ex.Message}");
        }
        return false;
    }

    private static bool TrySetLicenseFromDirectory(License license, string directory)
    {
        try
        {
            if (!Directory.Exists(directory)) return false;

            foreach (var pattern in LicenseFilePatterns)
            {
                if (pattern == "*.lic")
                {
                    // Find any .lic file
                    var licFiles = Directory.GetFiles(directory, "*.lic");
                    foreach (var licFile in licFiles)
                    {
                        if (TrySetLicenseFromFile(license, licFile))
                        {
                            return true;
                        }
                    }
                }
                else
                {
                    var filePath = Path.Combine(directory, pattern);
                    if (TrySetLicenseFromFile(license, filePath))
                    {
                        return true;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️  Error searching directory {directory}: {ex.Message}");
        }
        return false;
    }

    private static bool TrySetLicenseFromEmbeddedResource(License license)
    {
        try
        {
            foreach (var pattern in LicenseFilePatterns.Take(3)) // Try main patterns only
            {
                license.SetLicense($"Examples.Core.{pattern}");
                _licenseSet = true;
                Console.WriteLine($"✅ Aspose.BarCode license loaded from embedded resource: {pattern}");
                return true;
            }
        }
        catch
        {
            // Embedded resource not found, this is expected
        }
        return false;
    }

    private static void ShowNoLicenseMessage()
    {
        Console.WriteLine("⚠️  No Aspose.BarCode license found in any of the expected locations:");
        Console.WriteLine("   • Root folder: Aspose.BarCode.NET.lic (or other .lic files)");
        Console.WriteLine("   • Licenses folder: licenses/Aspose.BarCode.NET.lic");
        Console.WriteLine("   • Environment variable: ASPOSE_LICENSE_PATH");
        Console.WriteLine("   • Embedded resource");
        Console.WriteLine("📝 Running in evaluation mode with limitations (Code39 only for some formats)");
    }

    /// <summary>
    /// Gets the current license status
    /// </summary>
    public static bool IsLicenseSet => _licenseSet;

    /// <summary>
    /// Sets license from configuration value (useful for appsettings.json)
    /// </summary>
    /// <param name="licensePath">License file path from configuration</param>
    public static void SetLicenseFromConfig(string? licensePath)
    {
        if (!string.IsNullOrEmpty(licensePath))
        {
            SetLicense(licensePath);
        }
        else
        {
            SetLicense();
        }
    }

    /// <summary>
    /// Provides information about where to place license files
    /// </summary>
    public static void ShowLicenseInfo()
    {
        Console.WriteLine();
        Console.WriteLine("📄 Supported License File Names:");
        foreach (var pattern in LicenseFilePatterns.Take(LicenseFilePatterns.Length - 1)) // Skip *.lic wildcard
        {
            Console.WriteLine($"   • {pattern}");
        }
        Console.WriteLine("   • Any .lic file");
        Console.WriteLine();
        Console.WriteLine("📁 Searched Locations (in order):");
        Console.WriteLine("   1. Custom path (if provided)");
        Console.WriteLine("   2. Environment variable: ASPOSE_LICENSE_PATH");
        Console.WriteLine("   3. Current directory");
        Console.WriteLine("   4. Licenses subfolder: licenses/");
        Console.WriteLine("   5. Parent folders: ../, ../../");
        Console.WriteLine("   6. User home directory");
        Console.WriteLine("   7. Embedded resource in Examples.Core");
        Console.WriteLine();
        Console.WriteLine("💡 Tips:");
        Console.WriteLine("   • Place license file in root folder for simplest setup");
        Console.WriteLine("   • Use licenses/ folder for organized structure");
        Console.WriteLine("   • Set ASPOSE_LICENSE_PATH environment variable for production");
        Console.WriteLine("   • *.lic files are excluded from version control");
        Console.WriteLine();
    }
}