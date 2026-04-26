import {supabase} from "../../config/supabaseClient.js";


export const addPermit = async ({
  driver_id,
  permit_number,
  permit_type,
  valid_from,
  expiry_date
}) => {
  const { data, error } = await supabase
    .from("permits")
    .insert({
      driver_id,
      permit_number,
      permit_type,
      valid_from,
      expiry_date
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getDriverPermits = async (driverId) => {
  const { data, error } = await supabase
    .from("permits")
    .select("*")
    .eq("driver_id", driverId)
    .order("expiry_date", { ascending: true });

  if (error) throw error;
  return data;
};
