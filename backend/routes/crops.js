const express = require('express');
const router = express.Router();

// Seeded in-memory data representing active harvests matching the Postman collection
let crops = [
  {
    id: "1",
    name: "Mango",
    quantity: 15,
    unit: "Quintals",
    location: "Nashik, Maharashtra",
    status: "Processing Recommended",
    advice: "Convert to Mango Pulp/Pickle/Juice. Local processor price spreads show a (+88% profit) increase compared to fresh market value."
  },
  {
    id: "2",
    name: "Tomato",
    quantity: 8,
    unit: "Quintals",
    location: "Kolar, Karnataka",
    status: "Hold Recommended",
    advice: "Hold Tomato for 3 weeks. APMC wholesale arrivals are peaking in neighboring districts; prices are projected to rise by 25% once gluts clear."
  }
];

// Helper to generate AI recommendation status and advice
function generateRecommendation(name, quantity, unit, location) {
  const isLargeQty = Number(quantity) >= 10;
  const cropLower = name.toLowerCase().trim();

  let advice = "";
  let status = isLargeQty ? "Processing Recommended" : "Hold Recommended";

  if (isLargeQty) {
    if (cropLower.includes("mango")) {
      advice = `We found a premium value-adding processor in ${location}. Converting your ${quantity} ${unit} of Mango into retail Mango Pulp/Pickle/Juice is projected to raise profits by up to 88%.`;
    } else if (cropLower.includes("tomato")) {
      advice = `High moisture content makes storage risky. We recommend sending your ${quantity} ${unit} of Tomato to a tomato paste/ketchup manufacturer near ${location} for an estimated 75% profit increase.`;
    } else if (cropLower.includes("potato")) {
      advice = `Process your ${quantity} ${unit} of Potato into dehydration starch or premium chips at local processors near ${location} to boost gross margins by 60%.`;
    } else {
      advice = `High harvest volume detected. Converting your ${quantity} ${unit} of ${name} into secondary value-added processed goods in ${location} is projected to raise profits by up to 55%.`;
    }
  } else {
    // Hold recommendation
    if (cropLower.includes("mango")) {
      advice = `Hold Mango for offseason pricing. Cold storage capacity near ${location} is high. Prices are projected to rise by 22% in 4 weeks.`;
    } else if (cropLower.includes("tomato")) {
      advice = `Hold Tomato for 2.5 weeks. Major wholesale mandi arrivals in ${location} are currently peaking, creating a temporary glut. Prices projected to rise by 25% soon.`;
    } else if (cropLower.includes("potato")) {
      advice = `Hold Potato for 3-4 weeks. Current demand trends are low, but supply forecasts show a decline. Prices projected to rise by 18-20% post-harvest peak.`;
    } else {
      advice = `Hold supply of ${name} for 2.5 weeks. Major wholesale mandi arrivals near ${location} are peaking; prices are projected to rise by 18-22% once gluts resolve.`;
    }
  }

  return { status, advice };
}

// 1. GET /api/crops/stats - Calculate aggregate metrics (Must be registered BEFORE /api/crops/:id route)
router.get('/stats', (req, res, next) => {
  try {
    const totalCrops = crops.length;
    
    // Calculate projected income based on quantities and recommendations
    let projectedIncome = crops.reduce((sum, crop) => {
      let multiplier = 2000; // Base multiplier per quintal
      if (crop.unit.toLowerCase() === 'tons') multiplier = 20000;
      if (crop.unit.toLowerCase() === 'kg') multiplier = 20;

      const baseValue = crop.quantity * multiplier;
      const profitBoost = crop.status.includes("Processing") ? 1.55 : 1.18;
      return sum + (baseValue * profitBoost);
    }, 0);

    // Format as currency e.g., ₹3.45L
    let formattedIncome = "₹0.00";
    if (projectedIncome >= 100000) {
      formattedIncome = `₹${(projectedIncome / 100000).toFixed(2)}L`;
    } else if (projectedIncome >= 1000) {
      formattedIncome = `₹${(projectedIncome / 1000).toFixed(1)}K`;
    } else {
      formattedIncome = `₹${projectedIncome.toFixed(0)}`;
    }

    res.status(200).json({
      totalCrops,
      projectedIncome: formattedIncome,
      rawProjectedIncome: projectedIncome
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/crops/search - Search crops by name or location
router.get('/search', (req, res, next) => {
  try {
    const query = (req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.status(200).json(crops);
    }

    const filtered = crops.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.location.toLowerCase().includes(query)
    );

    res.status(200).json(filtered);
  } catch (error) {
    next(error);
  }
});

// 3. GET /api/crops - List all crops
router.get('/', (req, res, next) => {
  try {
    res.status(200).json(crops);
  } catch (error) {
    next(error);
  }
});

// 4. GET /api/crops/:id - Get a single crop by ID
router.get('/:id', (req, res, next) => {
  try {
    const cropId = req.params.id;
    const crop = crops.find(c => c.id === cropId);
    
    if (!crop) {
      const err = new Error(`Crop with ID ${cropId} not found`);
      err.status = 404;
      return next(err);
    }
    
    res.status(200).json(crop);
  } catch (error) {
    next(error);
  }
});

// 5. POST /api/crops - Create a new crop harvest entry
router.post('/', (req, res, next) => {
  try {
    const { name, quantity, unit, location } = req.body;

    // Field Validations
    if (!name || !name.trim()) {
      const err = new Error("Crop name cannot be empty");
      err.status = 400;
      return next(err);
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      const err = new Error("Please enter a valid quantity greater than 0");
      err.status = 400;
      return next(err);
    }
    if (!location || !location.trim()) {
      const err = new Error("Location/District is required");
      err.status = 400;
      return next(err);
    }

    const allowedUnits = ["Quintals", "Tons", "Kg"];
    const verifiedUnit = allowedUnits.includes(unit) ? unit : "Quintals";

    // Generate recommendation status & advice
    const { status, advice } = generateRecommendation(name, quantity, verifiedUnit, location);

    const newCrop = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: Number(quantity),
      unit: verifiedUnit,
      location: location.trim(),
      status,
      advice
    };

    // Prepend to return latest crops first
    crops.unshift(newCrop);

    res.status(201).json(newCrop);
  } catch (error) {
    next(error);
  }
});

// 6. PUT /api/crops/:id - Update an existing crop harvest entry
router.put('/:id', (req, res, next) => {
  try {
    const cropId = req.params.id;
    const cropIndex = crops.findIndex(c => c.id === cropId);

    if (cropIndex === -1) {
      const err = new Error(`Crop with ID ${cropId} not found`);
      err.status = 404;
      return next(err);
    }

    const { name, quantity, unit, location } = req.body;

    // Field Validations
    if (!name || !name.trim()) {
      const err = new Error("Crop name cannot be empty");
      err.status = 400;
      return next(err);
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      const err = new Error("Please enter a valid quantity greater than 0");
      err.status = 400;
      return next(err);
    }
    if (!location || !location.trim()) {
      const err = new Error("Location/District is required");
      err.status = 400;
      return next(err);
    }

    const allowedUnits = ["Quintals", "Tons", "Kg"];
    const verifiedUnit = allowedUnits.includes(unit) ? unit : "Quintals";

    // Recalculate recommendations
    const { status, advice } = generateRecommendation(name, quantity, verifiedUnit, location);

    const updatedCrop = {
      id: cropId,
      name: name.trim(),
      quantity: Number(quantity),
      unit: verifiedUnit,
      location: location.trim(),
      status,
      advice
    };

    crops[cropIndex] = updatedCrop;
    res.status(200).json(updatedCrop);
  } catch (error) {
    next(error);
  }
});

// 7. DELETE /api/crops/:id - Delete a crop harvest entry
router.delete('/:id', (req, res, next) => {
  try {
    const cropId = req.params.id;
    const cropIndex = crops.findIndex(c => c.id === cropId);

    if (cropIndex === -1) {
      const err = new Error(`Crop with ID ${cropId} not found`);
      err.status = 404;
      return next(err);
    }

    crops.splice(cropIndex, 1);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    next(error);
  }
});

module.exports = router;
