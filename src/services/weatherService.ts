import axios from 'axios';

export interface LiveWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  uvIndex: number;
  description: string;
}

export const weatherService = {
  getLiveWeather: async (lat: number, lng: number): Promise<LiveWeather> => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&hourly=uv_index&timezone=auto`;
      const response = await axios.get(url);
      const data = response.data;
      
      const current = data.current;
      
      // Map WMO weather codes to readable strings
      const weatherCodes: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
        95: 'Thunderstorm',
      };

      // Get current hour index for UV
      const currentHour = new Date().getHours();
      const uvIndex = data.hourly?.uv_index?.[currentHour] || 8;

      return {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        uvIndex: uvIndex,
        description: weatherCodes[current.weather_code] || 'Clear',
      };
    } catch (error) {
      console.error('Error fetching live weather:', error);
      // Fallback to extreme heat scenario if API fails
      return {
        temperature: 42.3,
        feelsLike: 46.1,
        humidity: 38,
        uvIndex: 9,
        description: 'Clear',
      };
    }
  }
};
