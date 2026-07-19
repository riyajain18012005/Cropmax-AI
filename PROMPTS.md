# AI Advisor Prompt Log

This document log details the prompt engineering process for the **CropMax AI Advisor** feature, documenting the three prompt variations tested, their structures, example inputs/outputs, and why the final prompt was chosen.

---

## System Role & Objective
For all prompt variations, the LLM is instructed to adopt the following system role:
> **Role**: Expert Agricultural Economist & Market Analyst specializing in Indian agriculture and crop valuation.
> **Objective**: Analyze regional yield parameters and user queries to generate high-value holding, direct-selling, or value-adding processing recommendations.

---

## Prompt Variation 1: Direct Text Prompt (Unstructured)
This prompt gives simple instructions to analyze the crop parameters and output advice in plain text.

### Prompt Template
```
You are an expert agricultural economist and market analyst specializing in Indian agriculture and crop valuation.
Analyze this crop yield and answer the farmer's question.

Crop Name: {cropName}
Quantity: {quantity} {unit}
Location: {location}
Question: {question}

Provide advice on whether they should sell, wait, or process their crops.
```

### Example Input
- **Crop**: Mango
- **Quantity**: 15 Tons
- **Location**: Nashik, Maharashtra
- **Question**: Is it a good time to sell to local markets?

### Example Output
> For a harvest of 15 Tons of Mangoes in Nashik, Maharashtra, you have a substantial volume. Right now, during the peak season in Maharashtra, mandis are experiencing heavy arrivals, which is lowering wholesale prices. I do not recommend selling raw mangoes directly in the local mandi right now as prices are low. Instead, you should wait 4 weeks or process them into pulp. Local buyers like Sahyadri Farms or processing units in Dindori will pay a better price for processed pulp, boosting profits by around 80%.

---

## Prompt Variation 2: Sectional Structured Text Prompt
This prompt structures the response into dedicated headings (Sentiment, Value-Addition, Buyer Directory) but leaves the output as raw text.

### Prompt Template
```
You are an expert agricultural economist and market analyst specializing in Indian agriculture.
Analyze the following crop details:
- Crop: {cropName}
- Quantity: {quantity} {unit}
- Location: {location}
- User Question: {question}

Format your response exactly with these sections:
### Recommendation
[Sell / Hold / Process]
### Market Sentiment
[Supply/Demand analysis]
### Detailed Advice
[Advisory text answering the user's question]
### Processing Options
[Step-by-step value addition steps]
### Local Buyers
[List of potential mandis or FPOs]
```

### Example Input
- **Crop**: Tomato
- **Quantity**: 20 Quintals
- **Location**: Kolar, Karnataka
- **Question**: How can I store tomatoes if mandi prices are low?

### Example Output
> ### Recommendation
> Hold & Process Recommended
> 
> ### Market Sentiment
> Supply levels from neighboring districts are peaking at the Kolar Mandi, causing an 18% wholesale price drop. Prices will stabilize in 2-3 weeks.
> 
> ### Detailed Advice
> Tomatoes rot quickly due to high moisture, making long-term storage in traditional warehouses risky. Since you have 20 Quintals in Kolar, you should explore cold storage for short-term holds (under 2 weeks) or process the surplus into tomato paste/puree.
> 
> ### Processing Options
> 1. Grade and wash tomatoes.
> 2. Blanch and remove skin/seeds.
> 3. Boil down to a paste concentration.
> 4. Package in sterilized glass jars.
> 
> ### Local Buyers
> - Kolar Tomato Processing Hub (Mandi Road)
> - Bangalore Veg Processors (Bangalore Highway)

---

## Prompt Variation 3: Strict JSON Schema Output (Chosen)
This prompt instructs the LLM to output a JSON object adhering to a strict schema, omitting any markdown formatting or wrapper code. This is the production choice.

### Prompt Template
```
You are an expert agricultural economist and market analyst specializing in Indian agriculture and crop valuation.
Your task is to analyze the following crop harvest details and provide an optimization strategy.

Crop Details:
- Name: {cropName}
- Quantity: {quantity} {unit}
- Location: {location}
- User Specific Question: {question}

Provide your analysis strictly as a JSON object matching the following schema. Return ONLY the raw JSON. Do not include markdown code block syntax (like ```json) or any wrapping text.

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
```

### Example Input
- **Crop**: Potato
- **Quantity**: 25 Tons
- **Location**: Pune, Maharashtra
- **Question**: Should I sell now or wait?

### Example Output
```json
{
  "status": "Processing Recommended",
  "advice": "With a large harvest of 25 Tons in Pune, direct selling will expose you to transport commission fees. Processing potatoes into dehydrated starch or chips provides the best margin improvement. If you cannot process, use local cold storage for 4 weeks.",
  "sentiment": "Potato supply has surged in Pune mandis, dragging wholesale prices down. Demand for processed starch has climbed by 12% in nearby food complexes.",
  "projectedPriceBoost": "60%",
  "holdingPeriod": "Immediate processing / 4 weeks storage",
  "valueAddition": "1. Wash and peel tubers.\n2. Slice thinly and rinse starch.\n3. Blanch in hot water, dehydrate, and pack in nitrogen-flushed packages to prevent spoilage.",
  "suggestedBuyers": [
    { "name": "Maharashtra Processing MIDC", "location": "MIDC Sector 2, Pune", "contact": "020-27419202" },
    { "name": "Vashi APMC Wholesale Sourcing", "location": "Navi Mumbai Mandi", "contact": "corporate.sourcing@apmc.org" }
  ]
}
```

---

## Comparison & Winner Selection

### Selection: **Prompt Variation 3 (Strict JSON Schema)**

### Rationale
- **Structured Rendering**: Variation 3 returns a strict JSON structure. This allows our backend to safely parse and separate parameters, enabling the frontend to display data dynamically in individual visual cards, lists, and stat blocks (instead of a single block of text).
- **Zero Markdown Wrapper**: Explicitly instructing the model to omit markdown wrappers (` ```json `) ensures the Node parser does not break on string conversions.
- **Dynamic Action Integration**: Returning distinct attributes (`status`, `advice`, `projectedPriceBoost`) allows the frontend to run direct database updates (e.g. saving the AI recommendations into the primary MySQL CRUD inventory table) seamlessly.
- **Consistency**: It enforces structure on different underlying LLM engines (Google Gemini 1.5 Flash and OpenAI GPT-4o-mini), securing reliable schema outputs under both providers.
