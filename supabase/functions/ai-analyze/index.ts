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
    const { incident, weather, riskProfile, peopleAffected } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    let aiResult;

    if (apiKey) {
      const prompt = `You are SURAKSHA AI, Senior Disaster Response Assistant.
Analyze this incident:
Location: ${incident.location_name}
Category: ${incident.category || incident.incident_type}
Note: ${incident.note || incident.description}
People Impacted: ${peopleAffected || incident.people_count || 1}
Risk Level: ${riskProfile?.risk_level || 'HIGH'}
Weather: ${weather?.weather_condition || 'Heavy Rain'}, Rain: ${weather?.rainfall || 0}mm, Wind: ${weather?.wind_speed || 0}km/h.

Return a JSON object with:
- severity: ("CRITICAL" | "HIGH" | "MODERATE" | "NORMAL")
- priority_score: (number 0-100)
- recommended_action: (short tactical instruction)
- recommended_team_type: (rescue team specification)
- explanation: (1-2 sentences reasoning)
Return ONLY raw valid JSON.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
        try {
          const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
          aiResult = JSON.parse(cleanJson);
        } catch (_) {
          // fallback parser
        }
      }
    }

    if (!aiResult) {
      // Deterministic rule-based fallback when Gemini API key is not configured or in offline mode
      const isCritical =
        (incident.category && ['Trapped', 'Medical', 'Evacuation'].includes(incident.category)) ||
        (peopleAffected && peopleAffected >= 4);

      aiResult = {
        severity: isCritical ? "CRITICAL" : "HIGH",
        priority_score: isCritical ? 92 : 78,
        recommended_action: isCritical
          ? "Immediate NDRF motorboat deployment & medical evacuation."
          : "Deploy local district SDRF patrol unit for ground assessment.",
        recommended_team_type: isCritical ? "NDRF Motorboat & Trauma Unit" : "SDRF Ground Patrol",
        explanation: `Automated AI risk assessment based on ${incident.category || 'emergency'} signal and reported exposure of ${peopleAffected || 1} citizens.`
      };
    }

    return new Response(JSON.stringify(aiResult), {
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
