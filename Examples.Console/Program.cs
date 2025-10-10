using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Examples.Core;
using System;

await Host.CreateDefaultBuilder(args)
    .ConfigureAppConfiguration((ctx, cfg) => cfg.AddJsonFile("appsettings.json", optional:true, reloadOnChange:true))
    .ConfigureServices((ctx, services) =>
    {
        // Register the demo runner as a hosted service
        services.AddHostedService<DemoRunner>();
    })
    .ConfigureLogging(logging =>
    {
        logging.ClearProviders();
        logging.AddConsole();
        logging.SetMinimumLevel(LogLevel.Information);
    })
    .RunConsoleAsync();

/// <summary>
/// Simple IHostedService that parses the first command‑line argument
/// (e.g. "Generation", "Reading", "Formatting", "Advanced") and invokes the
/// corresponding static Run method in the Core library.
/// </summary>
public sealed class DemoRunner : IHostedService
{
    private readonly ILogger<DemoRunner> _log;
    private readonly IHostApplicationLifetime _appLifetime;
    private readonly IConfiguration _configuration;

    public DemoRunner(ILogger<DemoRunner> log, IHostApplicationLifetime appLifetime, IConfiguration configuration)
    {
        _log = log;
        _appLifetime = appLifetime;
        _configuration = configuration;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                await RunDemoAsync();
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Demo failed");
            }
            finally
            {
                _appLifetime.StopApplication();
            }
        }, cancellationToken);

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task RunDemoAsync()
    {
        var args = Environment.GetCommandLineArgs();
        var command = args.Length > 1 ? args[1] : "all";

        _log.LogInformation("🚀 Starting Aspose.BarCode Examples");
        _log.LogInformation("Command: {Command}", command);

        // Initialize license - try configuration first, then auto-detect
        var configLicensePath = _configuration["Aspose:LicensePath"] ?? _configuration["ASPOSE_LICENSE_PATH"];
        
        LicenseHelper.SetLicenseFromConfig(configLicensePath);
        
        // Show license info if running in evaluation mode
        if (!LicenseHelper.IsLicenseSet)
        {
            LicenseHelper.ShowLicenseInfo();
        }

        // Add a small delay to let the console setup complete
        await Task.Delay(100);

        switch (command.ToLowerInvariant())
        {
            case "generation":
            case "gen":
                RunGenerationExamples();
                break;

            case "reading":
            case "read":
                RunReadingExamples();
                break;

            case "formatting":
            case "format":
                RunFormattingExamples();
                break;

            case "advanced":
            case "adv":
                RunAdvancedExamples();
                break;

            case "all":
            default:
                RunAllExamples();
                break;
        }

        _log.LogInformation("✅ Demo completed successfully");
    }

    private void RunGenerationExamples()
    {
        _log.LogInformation("📊 Running Generation Examples");
        Examples.Core.Generation.BasicGenerationExample.Run("BasicGeneration");
        Examples.Core.Generation.QRCodeExample.Run("QRCodeGeneration");
    }

    private void RunReadingExamples()
    {
        _log.LogInformation("📖 Running Reading Examples");
        Examples.Core.Reading.BasicReadingExample.Run("SampleBarcode");
    }

    private void RunFormattingExamples()
    {
        _log.LogInformation("🎨 Running Formatting Examples");
        Examples.Core.Formatting.FormattingExample.Run("FormattedBarcode");
    }

    private void RunAdvancedExamples()
    {
        _log.LogInformation("🔬 Running Advanced Examples");
        Examples.Core.Advanced.AdvancedBarcodeExample.Run("AdvancedBarcode");
    }

    private void RunAllExamples()
    {
        _log.LogInformation("🎯 Running All Examples");
        
        Console.WriteLine();
        Console.WriteLine(new string('=', 60));
        Console.WriteLine("🔧 ASPOSE.BARCODE FOR .NET EXAMPLES");
        Console.WriteLine(new string('=', 60));
        Console.WriteLine();

        RunGenerationExamples();
        Console.WriteLine();

        RunReadingExamples();
        Console.WriteLine();

        RunFormattingExamples();
        Console.WriteLine();

        RunAdvancedExamples();
        Console.WriteLine();

        Console.WriteLine(new string('=', 60));
        Console.WriteLine("✨ All examples completed! Check the 'data/outputs' folder for generated files.");
        Console.WriteLine(new string('=', 60));
    }
}