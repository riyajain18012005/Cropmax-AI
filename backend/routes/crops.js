const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

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
router.get('/stats', async (req, res, next) => {
  try {
    const list = await prisma.crop.findMany();
    const totalCrops = list.length;
    
    // Calculate projected income based on quantities and recommendations
    let projectedIncome = list.reduce((sum, crop) => {
      let multiplier = 2000; // Base multiplier per quintal
      if (crop.unit.toLowerCase() === 'tons') multiplier = 20000;
      if (crop.unit.toLowerCase() === 'kg') multiplier = 2; // base multiplier for kg adjusted to be reasonable

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
router.get('/search', async (req, res, next) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      const list = await prisma.crop.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(list);
    }

    const filtered = await prisma.crop.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { location: { contains: query } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(filtered);
  } catch (error) {
    next(error);
  }
});

// 3. GET /api/crops - List all crops
router.get('/', async (req, res, next) => {
  try {
    const list = await prisma.crop.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
});

// 4. GET /api/crops/:id - Get a single crop by ID
router.get('/:id', async (req, res, next) => {
  try {
    const idVal = parseInt(req.params.id);
    if (isNaN(idVal)) {
      const err = new Error(`Invalid ID format: ${req.params.id}`);
      err.status = 400;
      return next(err);
    }

    const crop = await prisma.crop.findUnique({
      where: { id: idVal }
    });
    
    if (!crop) {
      const err = new Error(`Crop with ID ${req.params.id} not found`);
      err.status = 404;
      return next(err);
    }
    
    res.status(200).json(crop);
  } catch (error) {
    next(error);
  }
});

// 5. POST /api/crops - Create a new crop harvest entry
router.post('/', async (req, res, next) => {
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

    // Get seeded default User and Category
    const defaultUser = await prisma.user.findUnique({
      where: { email: 'farmer.john@cropmax.ai' }
    });
    const defaultCategory = await prisma.category.findUnique({
      where: { name: 'General' }
    });

    if (!defaultUser || !defaultCategory) {
      const err = new Error("Default database associations not seeded yet");
      err.status = 500;
      return next(err);
    }

    const newCrop = await prisma.crop.create({
      data: {
        name: name.trim(),
        quantity: Number(quantity),
        unit: verifiedUnit,
        location: location.trim(),
        status,
        advice,
        userId: defaultUser.id,
        categoryId: defaultCategory.id
      }
    });

    res.status(201).json(newCrop);
  } catch (error) {
    next(error);
  }
});

// 6. PUT /api/crops/:id - Update an existing crop harvest entry
router.put('/:id', async (req, res, next) => {
  try {
    const cropId = parseInt(req.params.id);
    if (isNaN(cropId)) {
      const err = new Error(`Invalid ID format: ${req.params.id}`);
      err.status = 400;
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

    // Find and update document
    try {
      const updatedCrop = await prisma.crop.update({
        where: { id: cropId },
        data: {
          name: name.trim(),
          quantity: Number(quantity),
          unit: verifiedUnit,
          location: location.trim(),
          status,
          advice
        }
      });
      res.status(200).json(updatedCrop);
    } catch (err) {
      if (err.code === 'P2025') {
        const notFoundErr = new Error(`Crop with ID ${cropId} not found`);
        notFoundErr.status = 404;
        return next(notFoundErr);
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
});

// 7. DELETE /api/crops/:id - Delete a crop harvest entry
router.delete('/:id', async (req, res, next) => {
  try {
    const cropId = parseInt(req.params.id);
    if (isNaN(cropId)) {
      const err = new Error(`Invalid ID format: ${req.params.id}`);
      err.status = 400;
      return next(err);
    }

    try {
      await prisma.crop.delete({
        where: { id: cropId }
      });
      res.status(204).send(); // 204 No Content
    } catch (err) {
      if (err.code === 'P2025') {
        const notFoundErr = new Error(`Crop with ID ${cropId} not found`);
        notFoundErr.status = 404;
        return next(notFoundErr);
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
