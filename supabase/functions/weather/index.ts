import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, locationName } = await req.json();
    const apiKey = Deno.env.get("WEATHER_API_KEY") || "demo_openweather_key";

    // Call OpenWeatherMap or fallback simulation
    let weatherData;
    if (apiKey !== "demo_openweather_key") {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );
      if (res.ok) {
        const json = await res.json();
        weatherData = {
          location_name: locationName || json.name,
          latitude,
          longitude,
          temperature: json.main.temp,
          humidity: json.main.humidity,
          rainfall: json.rain ? json.rain["1h"] || 0 : 0,
          wind_speed: json.wind.speed,
          pressure: json.main.pressure,
          weather_condition: json.weather[0]?.main || "Cloudy",
          timestamp: new Date().toISOString()
        };
      }
    }

    if (!weatherData) {
      weatherData = {
        location_name: locationName || "Regional Monitoring Point",
        latitude,
        longitude,
        temperature: Math.round(28 + Math.random() * 5),
        humidity: Math.round(75 + Math.random() * 20),
        rainfall: Number((Math.random() * 12.5).toFixed(1)),
        wind_speed: Math.round(18 + Math.random() * 25),
        pressure: 1008,
        weather_condition: "Tropical Depression Warning",
        timestamp: new Date().toISOString()
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
