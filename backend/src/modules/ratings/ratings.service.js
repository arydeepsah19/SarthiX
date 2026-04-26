import { supabase } from "../../config/supabaseClient.js";

export const createRating = async ({
  shipment_id,
  driver_id,
  company_id,
  rating,
  comment
}) => {

  const { data, error } = await supabase
    .from("ratings")
    .insert({
      shipment_id,
      driver_id,
      company_id,
      rating,
      comment
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};