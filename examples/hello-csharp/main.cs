using System.IO;
using Hosihikari;
using Microsoft.Extensions.Logging;

public sealed class HelloPlugin : IPlugin
{
    private IPluginContext _context = null!;

    public void OnLoad(IPluginContext context)
    {
        _context = context;
        context.Logger.LogInformation("loaded, package {Dir}", context.PackageDirectory);
        File.WriteAllText(Path.Combine(context.DataDirectory, "loaded.txt"), "loaded");
    }

    public PluginHookResult OnEnable()
    {
        var greeting = _context.Configuration["greeting"];
        _context.Logger.LogInformation("enabled, greeting={Greeting}", greeting);
        File.WriteAllText(Path.Combine(_context.DataDirectory, "enabled.txt"), greeting ?? "");
        return PluginHookResult.Allow();
    }

    public PluginHookResult OnDisable() => PluginHookResult.Allow();

    public void OnUnload() { }
}
