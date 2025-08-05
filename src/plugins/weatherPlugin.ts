import axios from "axios";
import { PluginResult } from "../types";

export class WeatherPlugin {
  private apiKey: string;

  constructor() {
    this.apiKey = "";
  }

  async execute(query: string): Promise<PluginResult> {
    try {
      // Extract city name from query
      const cityMatch = query.match(/weather.*?in\s+([a-zA-Z\s]+)/i);
      const city = cityMatch ? cityMatch[1].trim() : "Bangalore";

      if (this.apiKey) {
        // Use real weather API (OpenWeatherMap example)
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`
        );

        const weather = response.data;
        const result = {
          city: weather.name,
          temperature: weather.main.temp,
          description: weather.weather[0].description,
          humidity: weather.main.humidity,
          wind_speed: weather.wind.speed,
        };

        return {
          plugin_name: "weather",
          result,
        };
      } else {
        // Mock weather data
        const mockWeather = {
          city,
          temperature: Math.round(Math.random() * 20 + 15),
          description: ["sunny", "cloudy", "rainy", "partly cloudy"][
            Math.floor(Math.random() * 4)
          ],
          humidity: Math.round(Math.random() * 40 + 40),
          wind_speed: Math.round(Math.random() * 10 + 5),
        };

        return {
          plugin_name: "weather",
          result: mockWeather,
        };
      }
    } catch (error) {
      return {
        plugin_name: "weather",
        result: null,
        error: `Failed to get weather data: ${error}`,
      };
    }
  }
}
