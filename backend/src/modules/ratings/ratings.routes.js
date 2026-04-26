import express from "express";
import { requireAuth } from "../../config/clerk.js";
import { rateShipment,checkRating } from "./ratings.controller.js";

const router = express.Router();

router.post("/", requireAuth, rateShipment);
router.get("/check", requireAuth, checkRating);
export default router;