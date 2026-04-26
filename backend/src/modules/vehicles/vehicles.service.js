import { supabase } from "../../config/supabaseClient.js";

// Get all vehicles of a driver
export const getDriverVehicles = async (driverId) => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Create vehicle — matches actual table columns
export const createVehicle = async (vehicleData) => {
  // ← single object, no driverId param
  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      driver_id: vehicleData.driver_id,
      vehicle_number:
        vehicleData.registration_number ?? // ← table uses vehicle_number
        vehicleData.vehicle_number ??
        null,
      vehicle_type: vehicleData.vehicle_type ?? null,
      capacity_kg:
        vehicleData.capacity_kg ?? // ← table uses capacity_kg
        vehicleData.capacity ??
        null,
      document_url: vehicleData.document_url ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update vehicle — matches actual table columns
export const updateVehicle = async (vehicleId, vehicleData, driverId) => {
  // ← fixed param order
  const { data, error } = await supabase
    .from("vehicles")
    .update({
      vehicle_number:
        vehicleData.registration_number ?? vehicleData.vehicle_number ?? null,
      vehicle_type: vehicleData.vehicle_type ?? null,
      capacity_kg: vehicleData.capacity_kg ?? vehicleData.capacity ?? null,
      document_url: vehicleData.document_url ?? null,
    })
    .eq("id", vehicleId)
    .eq("driver_id", driverId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete vehicle
export const deleteVehicle = async (vehicleId, driverId) => {
  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", vehicleId)
    .eq("driver_id", driverId);

  if (error) throw error;
};
