import express from "express";
import { requireAuth } from "../../config/clerk.js";
import {
  addVehicle,
  listVehicles,
  editVehicle,
  removeVehicle
} from "./vehicles.controller.js";

const router = express.Router();

// Add vehicle
router.post("/", requireAuth, addVehicle);

// List driver vehicles
router.get("/", requireAuth, listVehicles);

// Update vehicle
router.patch("/:id", requireAuth, editVehicle);

// Delete vehicle
router.delete("/:id", requireAuth, removeVehicle);

export default router;