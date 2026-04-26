import { supabase } from "../../config/supabaseClient.js";

// Get current image count
export const getShipmentImageCount = async (shipmentId) => {
  const { count, error } = await supabase
    .from("shipment_images")
    .select("*", { count: "exact", head: true })
    .eq("shipment_id", shipmentId);

  if (error) throw error;

  return count || 0;
};

// Insert image record
export const addShipmentImage = async (shipmentId, imageUrl) => {
  const { data, error } = await supabase
    .from("shipment_images")
    .insert({
      shipment_id: shipmentId,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};
export const deleteShipmentImage = async (imageId) => {
  const { error } = await supabase
    .from("shipment_images")
    .delete()
    .eq("id", imageId);

  if (error) throw error;
};

export const getShipmentImage = async (imageId) => {
  const { data, error } = await supabase
    .from("shipment_images")
    .select("*")
    .eq("id", imageId)
    .single();

  if (error) throw error;
  return data;
};