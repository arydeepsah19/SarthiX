import { supabase } from "../../config/supabaseClient.js";

export const createShipment = async (shipment) => {
  const { data, error } = await supabase
    .from("shipments")
    .insert(shipment)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllOpenShipments = async () => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("shipments")
    .select(
      `
      *,
      company:users!shipments_company_id_fkey (
        id,
        name,
        avatar_url
      )
    `,
    )
    .eq("status", "open")
    .or(`bidding_deadline.is.null,bidding_deadline.gt.${now}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  console.log("First shipment raw:", JSON.stringify(data?.[0], null, 2));
  return data;
};

// GET /company/shipments — company only: their own shipments (all statuses)
export const getCompanyShipments = async (companyId) => {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateShipmentStatus = async (shipmentId, status) => {
  const { data, error } = await supabase
    .from("shipments")
    .update({ status })
    .eq("id", shipmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getShipmentById = async (shipmentId) => {
  const { data: shipment, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", shipmentId)
    .single();

  if (error) throw error;

  const { data: images } = await supabase
    .from("shipment_images")
    .select("id, image_url")
    .eq("shipment_id", shipmentId);

  return {
    ...shipment,
    images: images || [],
  };
};

export const upsertShipmentLocation = async (shipmentId, lat, lng) => {
  const { data, error } = await supabase
    .from("shipment_locations")
    .upsert(
      {
        shipment_id: shipmentId,
        lat,
        lng,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "shipment_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getShipmentLocation = async (shipmentId) => {
  const { data, error } = await supabase
    .from("shipment_locations")
    .select("*")
    .eq("shipment_id", shipmentId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data ?? null;
};