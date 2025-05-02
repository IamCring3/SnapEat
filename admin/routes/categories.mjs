import { Router } from "express";
import { categories, products } from "../constants/index.mjs";

const router = Router();

router.get("/categories", (req, res) => {
  res.send(categories);
});

router.get("/categories/:id", (req, res) => {
  const id = req.params.id;

  // Simple approach: match products by category name or _base
  const matchedProducts = products.filter((item) => {
    // Match by _base (exact or case-insensitive)
    if (item._base === id ||
        (typeof item._base === 'string' && item._base.toLowerCase() === id.toLowerCase())) {
      return true;
    }

    // Match by category name for specific categories
    if (id === "beverages" && item.category === "Beverages") {
      return true;
    }
    if (id === "babyCare" && item.category === "Baby Care") {
      return true;
    }
    if (id === "hairCare" && item.category === "Hair Care") {
      return true;
    }
    if (id === "personalCare" && item.category === "Personal Care") {
      return true;
    }
    if (id === "skinCare" && item.category === "Skin Care") {
      return true;
    }
    if (id === "homeCare" && item.category === "Home Care") {
      return true;
    }
    if (id === "oralCare" && item.category === "Oral Care") {
      return true;
    }
    if (id === "cleaningDisinfectant" && item.category === "Cleaning & Disinfectants") {
      return true;
    }
    if (id === "stationary" && item.category === "Stationary") {
      return true;
    }

    return false;
  });

  // Return the products (even if it's an empty array)
  res.json(matchedProducts);
});

export default router;
