import { WeatherPlugin } from "../plugins/weatherPlugin";
import { MathPlugin } from "../plugins/mathPlugin";
import { PluginResult } from "../types";

export class PluginManager {
  private weatherPlugin: WeatherPlugin;
  private mathPlugin: MathPlugin;

  constructor() {
    this.weatherPlugin = new WeatherPlugin();
    this.mathPlugin = new MathPlugin();
  }

  async detectAndExecutePlugins(message: string): Promise<PluginResult[]> {
    const results: PluginResult[] = [];

    // Weather intent detection
    if (/weather.*in\s+\w+/i.test(message) || /what.*weather/i.test(message)) {
      const result = await this.weatherPlugin.execute(message);
      results.push(result);
    }

    // Math intent detection
    if (
      /\d+\s*[+\-*/]\s*\d+/i.test(message) ||
      /calculate|math|compute/i.test(message)
    ) {
      const result = await this.mathPlugin.execute(message);
      results.push(result);
    }

    return results;
  }
}
