import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getWindDirectionString = (deg?: number): string => {
  if (deg === undefined) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, locationName } = await req.json();
    const apiKey = Deno.env.get("WEATHER_API_KEY") || "";

    let weatherData = null;

    if (apiKey) {
      try {
        if (apiKey.startsWith('AIzaSy')) {
          // Google Maps Weather API
          const [curRes, fcRes, alertRes] = await Promise.all([
            fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${latitude}&location.longitude=${longitude}&unitsSystem=METRIC`),
            fetch(`https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${latitude}&location.longitude=${longitude}&days=3&unitsSystem=METRIC`),
            fetch(`https://weather.googleapis.com/v1/publicAlerts:lookup?key=${apiKey}&location.latitude=${latitude}&location.longitude=${longitude}`)
          ]);

          if (curRes.ok && fcRes.ok) {
            const curJson = await curRes.json();
            const fcJson = await fcRes.json();
            const alertJson = alertRes.ok ? await alertRes.json() : null;

            const forecast = (fcJson.forecastDays || []).slice(0, 3).map((item: any, idx: number) => {
              const date = new Date(item.date);
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayName = idx === 0 ? 'TODAY' : idx === 1 ? 'TOMORROW' : dayNames[date.getDay()].toUpperCase();
              return {
                dayName,
                dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                iconUrl: item.daytimeCondition?.iconBaseUri ? `${item.daytimeCondition.iconBaseUri}_day.png` : '',
                condition: item.daytimeCondition?.summary || 'Clear',
                maxTemp: Math.round(item.maxTemperature?.value || 30),
                minTemp: Math.round(item.minTemperature?.value || 22),
                rainProbability: item.precipitation?.probability || 0,
                windSpeed: Math.round(item.wind?.speed?.value || 10)
              };
            });

            const alerts = (alertJson?.publicAlerts || []).map((alert: any) => ({
              title: alert.event || 'Weather Alert',
              message: alert.description || alert.headline || 'Severe weather warning',
              severity: alert.severity === 'EXTREME' ? 'CRITICAL' : alert.severity === 'SEVERE' ? 'HIGH' : 'WARNING',
              source: alert.senderName || 'Meteorological Authority'
            }));

            weatherData = {
              location_name: locationName,
              latitude,
              longitude,
              temperature: Math.round(curJson.temperature?.value || 29),
              feels_like: Math.round(curJson.feelsLikeTemperature?.value || 31),
              humidity: curJson.relativeHumidity || 75,
              rainfall: curJson.precipitation?.intensity || 0,
              wind_speed: Math.round(curJson.wind?.speed?.value || 15),
              wind_direction: curJson.wind?.direction || 'N',
              visibility: curJson.visibility?.distance?.value || 10,
              pressure: curJson.pressure || 1012,
              weather_condition: curJson.weatherCondition?.summary || 'Clear',
              icon_url: curJson.weatherCondition?.iconBaseUri ? `${curJson.weatherCondition.iconBaseUri}_day.png` : '',
              timestamp: new Date().toISOString(),
              forecast,
              alerts
            };
          }
        } else if (apiKey.length === 32) {
          // OpenWeatherMap
          const [curRes, fcRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
          ]);

          if (curRes.ok && fcRes.ok) {
            const curJson = await curRes.json();
            const fcJson = await fcRes.json();

            const list = fcJson.list || [];
            const daysMap: Record<string, any[]> = {};
            list.forEach((item: any) => {
              const dateStr = item.dt_txt.split(' ')[0];
              if (!daysMap[dateStr]) daysMap[dateStr] = [];
              daysMap[dateStr].push(item);
            });

            const dates = Object.keys(daysMap).sort();
            const forecast = dates.slice(0, 3).map((dateStr, idx) => {
              const items = daysMap[dateStr];
              const date = new Date(dateStr);
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayName = idx === 0 ? 'TODAY' : idx === 1 ? 'TOMORROW' : dayNames[date.getDay()].toUpperCase();
              
              let maxTemp = -Infinity;
              let minTemp = Infinity;
              let maxRainProb = 0;
              let windSum = 0;
              items.forEach(it => {
                if (it.main.temp_max > maxTemp) maxTemp = it.main.temp_max;
                if (it.main.temp_min < minTemp) minTemp = it.main.temp_min;
                if (it.pop !== undefined && it.pop > maxRainProb) maxRainProb = it.pop;
                windSum += it.wind?.speed || 0;
              });

              const midItem = items[Math.floor(items.length / 2)] || items[0];
              return {
                dayName,
                dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                iconUrl: midItem.weather[0]?.icon ? `https://openweathermap.org/img/wn/${midItem.weather[0].icon}@2x.png` : '',
                condition: midItem.weather[0]?.main || 'Clear',
                maxTemp: Math.round(maxTemp),
                minTemp: Math.round(minTemp),
                rainProbability: Math.round(maxRainProb * 100),
                windSpeed: Math.round((windSum / items.length) * 3.6)
              };
            });

            weatherData = {
              location_name: locationName || curJson.name,
              latitude,
              longitude,
              temperature: Math.round(curJson.main.temp),
              feels_like: Math.round(curJson.main.feels_like),
              humidity: curJson.main.humidity,
              rainfall: curJson.rain ? curJson.rain["1h"] || 0 : 0,
              wind_speed: Math.round(curJson.wind.speed * 3.6),
              wind_direction: getWindDirectionString(curJson.wind.deg),
              visibility: curJson.visibility ? curJson.visibility / 1000 : 10,
              pressure: curJson.main.pressure,
              weather_condition: curJson.weather[0]?.main || 'Clear',
              icon_url: curJson.weather[0]?.icon ? `https://openweathermap.org/img/wn/${curJson.weather[0].icon}@2x.png` : '',
              timestamp: new Date().toISOString(),
              forecast,
              alerts: []
            };
          }
        } else if (apiKey.length === 31) {
          // WeatherAPI.com
          const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=3&aqi=no&alerts=yes`);
          if (res.ok) {
            const json = await res.json();
            const forecast = json.forecast.forecastday.slice(0, 3).map((item: any, idx: number) => {
              const date = new Date(item.date);
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayName = idx === 0 ? 'TODAY' : idx === 1 ? 'TOMORROW' : dayNames[date.getDay()].toUpperCase();
              return {
                dayName,
                dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                iconUrl: item.day.condition.icon ? `https:${item.day.condition.icon}` : '',
                condition: item.day.condition.text,
                maxTemp: Math.round(item.day.maxtemp_c),
                minTemp: Math.round(item.day.mintemp_c),
                rainProbability: item.day.daily_chance_of_rain || 0,
                windSpeed: Math.round(item.day.maxwind_kph)
              };
            });

            const alerts = (json.alerts?.alert || []).map((alert: any) => ({
              title: alert.event || 'Weather Advisory',
              message: alert.desc || alert.headline || 'Official warning active',
              severity: alert.severity === 'Extreme' ? 'CRITICAL' : alert.severity === 'Severe' ? 'HIGH' : 'WARNING',
              source: alert.sender || 'Weather Department'
            }));

            weatherData = {
              location_name: locationName || json.location.name,
              latitude,
              longitude,
              temperature: Math.round(json.current.temp_c),
              feels_like: Math.round(json.current.feelslike_c),
              humidity: json.current.humidity,
              rainfall: json.current.precip_mm || 0,
              wind_speed: Math.round(json.current.wind_kph),
              wind_direction: json.current.wind_dir,
              visibility: json.current.vis_km,
              pressure: json.current.pressure_mb,
              weather_condition: json.current.condition.text,
              icon_url: json.current.condition.icon ? `https:${json.current.condition.icon}` : '',
              timestamp: new Date().toISOString(),
              forecast,
              alerts
            };
          }
        }
      } catch (err) {
        console.warn("API request failed:", err);
      }
    }

    if (!weatherData) {
      // Local Deno simulation fallback
      const isWetZone = ['Wayanad', 'Silchar', 'Cachar', 'Puri', 'Chennai', 'Assam'].some(zone => locationName && locationName.includes(zone));
      const isHotZone = ['Delhi', 'Rajasthan', 'Gujarat'].some(zone => locationName && locationName.includes(zone));

      const baseTemp = isHotZone ? 38.5 : isWetZone ? 24.2 : 28.5;
      const baseHumidity = isWetZone ? 92 : isHotZone ? 40 : 70;
      const baseWind = isWetZone ? 35 : 12;
      const baseRain = isWetZone ? 18.4 : 0;

      weatherData = {
        location_name: locationName || "Regional Station",
        latitude,
        longitude,
        temperature: Number((baseTemp + Math.random() * 3).toFixed(1)),
        feels_like: Number((baseTemp + 2.5 + Math.random() * 2).toFixed(1)),
        humidity: Math.round(baseHumidity + Math.random() * 5),
        rainfall: Number((baseRain + Math.random() * 8).toFixed(1)),
        wind_speed: Math.round(baseWind + Math.random() * 10),
        wind_direction: 'SW',
        visibility: isWetZone ? 6.5 : 10,
        pressure: 1007,
        weather_condition: isWetZone ? 'Heavy Torrential Downpour' : isHotZone ? 'Extreme Heat Wave' : 'Partly Cloudy',
        timestamp: new Date().toISOString(),
        forecast: [
          {
            dayName: 'TODAY',
            dateString: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            iconUrl: '',
            condition: isWetZone ? 'Heavy Rain' : 'Partly Cloudy',
            maxTemp: Math.round(baseTemp + 3),
            minTemp: Math.round(baseTemp - 3),
            rainProbability: isWetZone ? 90 : 20,
            windSpeed: Math.round(baseWind + 5)
          },
          {
            dayName: 'TOMORROW',
            dateString: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            iconUrl: '',
            condition: isWetZone ? 'Severe Thunderstorms' : 'Mostly Sunny',
            maxTemp: Math.round(baseTemp + 2),
            minTemp: Math.round(baseTemp - 4),
            rainProbability: isWetZone ? 95 : 10,
            windSpeed: Math.round(baseWind + 12)
          },
          {
            dayName: 'DAY 3',
            dateString: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            iconUrl: '',
            condition: isWetZone ? 'Moderate Showers' : 'Clear Sky',
            maxTemp: Math.round(baseTemp + 4),
            minTemp: Math.round(baseTemp - 2),
            rainProbability: isWetZone ? 75 : 5,
            windSpeed: Math.round(baseWind)
          }
        ],
        alerts: isWetZone ? [
          {
            title: 'IMD Red Alert: Extreme Precipitation',
            message: 'Intense waterlogging and river overflow risk. Stay away from low-lying areas.',
            severity: 'CRITICAL',
            source: 'India Meteorological Department'
          }
        ] : []
      };
    }

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
