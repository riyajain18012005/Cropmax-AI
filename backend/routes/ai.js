const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Local High-fidelity Mock Generator for Fallback or offline operation
function generateMockAIResponse(cropName, quantity, unit, location, question) {
  const cropLower = cropName.toLowerCase().trim();
  const quantityNum = Number(quantity) || 0;
  const isLarge = quantityNum >= 15;
  
  let status = isLarge ? "Processing Recommended" : "Hold Recommended";
  let advice = "";
  let sentiment = "";
  let projectedPriceBoost = "25%";
  let holdingPeriod = "3 weeks";
  let valueAddition = "";
  let suggestedBuyers = [];
  
  if (cropLower.includes("mango")) {
    projectedPriceBoost = isLarge ? "88%" : "22%";
    holdingPeriod = isLarge ? "Immediate processing" : "4 weeks";
    advice = `Based on the latest mandi arrivals in the ${location} region, fresh mangoes are seeing a localized price dip due to peak season harvesting. Since you have a quantity of ${quantity} ${unit}, the market advises taking strategic steps. ${question ? `In response to your query "${question}": ` : ''}We recommend exploring local value-added processing to convert mangoes into pickles, pulp, or puree. Converting to mango pulp allows you to capture high demand in urban centers.`;
    sentiment = "Supply of Alphonso/Kesar mangoes is peaking at the regional APMC mandi, causing a short-term 15% price contraction. Demand for organic processing remains robust.";
    valueAddition = "1. Clean and wash fresh mangoes.\n2. Peel and extract pulp using cold press or slicing.\n3. Add preservative (citric acid/sugar) for shelf-stable pulp, or spice blend for pickle.\n4. Pack in glass jars or food-grade pouches to extend shelf life to 12 months.";
    suggestedBuyers = [
      { name: "Nashik Agro Processing Cooperative", location: "Industrial Area, Nashik", contact: "0253-2940212 (Mandi Ref: APMC-M1)" },
      { name: "Sahyadri Farmer Producer Co.", location: "Dindori Road, Nashik", contact: "info@sahyadrifarms.com" }
    ];
  } else if (cropLower.includes("tomato")) {
    projectedPriceBoost = isLarge ? "75%" : "25%";
    holdingPeriod = isLarge ? "Immediate processing" : "2.5 weeks";
    status = isLarge ? "Processing Recommended" : "Hold Recommended";
    advice = `Tomatoes have high moisture content and rot quickly in humid conditions. ${question ? `Regarding your concern: "${question}": ` : ''}It is highly recommended to route your ${quantity} ${unit} of Tomato to cold storage or process them into tomato puree/paste. The APMC wholesale arrival rates in ${location} indicate high price volatility. Processing protects you against distress selling.`;
    sentiment = "Peak wholesale mandi arrivals from surrounding districts are creating a temporary glut. Local prices have dropped by 18% but are expected to recover within 15 days once local supply gluts clear.";
    valueAddition = "1. Sort tomatoes and remove damaged ones.\n2. Steam blanch for 2 minutes to peel easily.\n3. Crush, pasteurize, and strain seeds.\n4. Boil down to a paste (28% solid concentration) and pack in airtight glass jars or sterilized pouches.";
    suggestedBuyers = [
      { name: "Kolar Tomato Processing Hub", location: "Mandi Road, Kolar", contact: "98451-23091 (APMC Reg: TO-291)" },
      { name: "FreshFruit & Veg Processors", location: "Bangalore Highway, Karnataka", contact: "contact@freshfruitprocessors.in" }
    ];
  } else if (cropLower.includes("potato")) {
    projectedPriceBoost = isLarge ? "60%" : "20%";
    holdingPeriod = isLarge ? "Immediate processing" : "4 weeks";
    advice = `Potatoes can be held in cold storage for a considerable time. For your ${quantity} ${unit} of Potato in ${location}, you have strong leverage. ${question ? `Regarding your query "${question}": ` : ''}Processing into potato starch or dry potato chips yields maximum return. Alternatively, hold in cold storage for offseason demand where prices typically rise by 20%.`;
    sentiment = "Supply forecasts show a 10% decrease in late-harvest crop arrivals. Cold storage capacity remains stable at 85% occupancy across northern cold corridors.";
    valueAddition = "1. Wash and peel potatoes.\n2. Slice thinly (1.5mm) and wash in cold water to remove excess starch.\n3. Blanch in hot water, dehydrate, and flash fry or oven bake with seasonings.\n4. Nitrogen pack to prevent oxidation, increasing market shelf-value by 60%.";
    suggestedBuyers = [
      { name: "Maharashtra Cold Storage & Processing", location: "MIDC Sector 2, Pune", contact: "020-27419202" },
      { name: "Reliance Retail Sourcing Mandi", location: "Vashi APMC Market, Navi Mumbai", contact: "corporate.sourcing@reliance.com" }
    ];
  } else {
    // General crop
    projectedPriceBoost = isLarge ? "55%" : "18%";
    holdingPeriod = isLarge ? "3 weeks" : "2.5 weeks";
    status = isLarge ? "Processing Recommended" : "Hold Recommended";
    advice = `Your harvest of ${quantity} ${unit} of ${cropName} in ${location} represents a standard yield. ${question ? `In answer to "${question}": ` : ''}To optimize value, we recommend either holding for late-season prices or seeking small-scale primary processing (cleaning, drying, and grading) to command a premium of up to ${projectedPriceBoost}. This strategy ensures you stand out from un-graded local commodities.`;
    sentiment = "Market arrivals for this crop category are steady. Regional APMC wholesale price index shows high stability with a slight upward trend in urban centers.";
    valueAddition = "1. Clean the raw crop to remove dirt and husks.\n2. Grade the crops based on size, color, and texture.\n3. Dehydrate or dry to optimal moisture levels (below 12% for grains).\n4. Package in breathable burlap bags or retail-grade zip pouches.";
    suggestedBuyers = [
      { name: "Regional APMC Main Mandi", location: `${location} City Center`, contact: "Inquire at APMC Helpdesk" },
      { name: "Local Farmers Producer Organisation (FPO)", location: `${location} Cooperative Society`, contact: "Visit local FPO office" }
    ];
  }

  return {
    status,
    advice,
    sentiment,
    projectedPriceBoost,
    holdingPeriod,
    valueAddition,
    suggestedBuyers,
    provider: "MockAI (No API Key Configured)"
  };
}

// POST /api/ai/advise
router.post('/advise', requireAuth, async (req, res, next) => {
  const { cropName, quantity, unit, location, question, simulateError } = req.body;

  // Validate fields
  if (!cropName || !cropName.trim()) {
    const err = new Error("Crop name is required for AI analysis");
    err.status = 400;
    return next(err);
  }
  if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
    const err = new Error("Valid crop quantity is required");
    err.status = 400;
    return next(err);
  }
  if (!location || !location.trim()) {
    const err = new Error("Location/District is required to analyze regional markets");
    err.status = 400;
    return next(err);
  }

  // Handle manual error simulation (for frontend testing)
  if (simulateError === true || simulateError === 'true') {
    console.log("[AI Route] Simulating API failure as requested by client.");
    const err = new Error("API Connection Timeout (HTTP 429 Rate Limit Exceeded). Please retry in 60 seconds.");
    err.status = 429;
    return next(err);
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Prompt Construction
  const promptText = `
You are an expert agricultural economist and market analyst specializing in Indian agriculture and crop valuation.
Your task is to analyze the following crop harvest details and provide an optimization strategy.

Crop Details:
- Name: ${cropName.trim()}
- Quantity: ${quantity} ${unit || 'Quintals'}
- Location: ${location.trim()}
- User Specific Question: ${question ? question.trim() : 'None provided. Analyze the general selling vs holding vs processing options.'}

Provide your analysis strictly as a JSON object matching the following schema. Return ONLY the raw JSON. Do not include markdown code block syntax (like \`\`\`json) or any wrapping text.

Schema:
{
  "status": "Processing Recommended" or "Hold Recommended" or "Sell Recommended",
  "advice": "Detailed agricultural advice for this crop in this location addressing the user's specific question.",
  "sentiment": "Analysis of current market supply and demand trends in this region.",
  "projectedPriceBoost": "Estimated percentage price increase or premium margin (e.g. 25% or 88%)",
  "holdingPeriod": "Recommended wait duration (e.g. 3 weeks, or 'Immediate' if selling)",
  "valueAddition": "Step-by-step description of value-added processing options.",
  "suggestedBuyers": [
    { "name": "Buyer/Mandi Name", "location": "Buyer Location", "contact": "Contact info/address" },
    { "name": "Buyer/Mandi Name", "location": "Buyer Location", "contact": "Contact info/address" }
  ]
}
`.trim();

  // 1. Google Gemini API Branch
  if (geminiKey) {
    console.log("[AI Route] Initiating call to Google Gemini API (gemini-1.5-flash)...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error (HTTP ${response.status}): ${errText}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error("Invalid response format received from Gemini API");
      }

      const text = data.candidates[0].content.parts[0].text;
      
      // Clean possible Markdown wrappers from JSON output
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanText.trim());
      parsed.provider = "Google Gemini (gemini-1.5-flash)";
      return res.status(200).json(parsed);

    } catch (error) {
      console.error("[AI Route] Gemini API execution failed:", error.message);
      const apiErr = new Error(`AI Service Unavailable: ${error.message}`);
      apiErr.status = 500;
      return next(apiErr);
    }
  }

  // 2. OpenAI API Branch
  if (openaiKey) {
    console.log("[AI Route] Initiating call to OpenAI API (gpt-4o-mini)...");
    const url = "https://api.openai.com/v1/chat/completions";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: promptText }
          ],
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API Error (HTTP ${response.status}): ${errText}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanText.trim());
      parsed.provider = "OpenAI GPT-4o-mini";
      return res.status(200).json(parsed);

    } catch (error) {
      console.error("[AI Route] OpenAI API execution failed:", error.message);
      const apiErr = new Error(`AI Service Unavailable: ${error.message}`);
      apiErr.status = 500;
      return next(apiErr);
    }
  }

  // 3. Fallback Mock Mode (when no API keys are provided in .env)
  console.log("[AI Route] No API keys configured in .env. Falling back to local Mock Generator.");
  
  // Simulate network latency (e.g. 1.2 seconds) to show loading state nicely
  await new Promise(resolve => setTimeout(resolve, 1200)); // 1.2s
  
  const mockResult = generateMockAIResponse(cropName, quantity, unit, location, question);
  return res.status(200).json(mockResult);
});

module.exports = router;
