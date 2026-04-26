import { findUserByClerkId } from "../users/user.service.js";
import {
  createVehicle,
  getDriverVehicles,
  updateVehicle,
  deleteVehicle
} from "./vehicles.service.js";

// Add vehicle
export const addVehicle = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers can add vehicles" });
    }

    const vehicle = await createVehicle({
      driver_id: user.id,
      ...req.body
    });

    res.status(201).json(vehicle);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add vehicle" });
  }
};

// List driver's vehicles
export const listVehicles = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);

    if (user.role !== "driver") {
      return res.status(403).json({ message: "Only drivers allowed" });
    }

    const vehicles = await getDriverVehicles(user.id);

    res.json(vehicles);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};

// Update vehicle
export const editVehicle = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { id } = req.params;

    const vehicle = await updateVehicle(id, req.body, user.id);

    res.json(vehicle);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update vehicle" });
  }
};

// Delete vehicle
export const removeVehicle = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { id } = req.params;

    await deleteVehicle(id, user.id);

    res.json({ message: "Vehicle deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete vehicle" });
  }
};