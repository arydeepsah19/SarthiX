import { supabase } from "../../config/supabaseClient.js";

export const getCompanyStats = async (companyId) => {

  // 1️⃣ Total shipments
  const { count: totalShipments } = await supabase
    .from("shipments")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId);

  // 2️⃣ Active shipments
  const { count: activeShipments } = await supabase
    .from("shipments")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .in("status", ["open", "assigned", "in_transit"]);

  // 3️⃣ Completed shipments
  const { count: completedShipments } = await supabase
    .from("shipments")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("status", "delivered");

  // 4️⃣ Cancelled shipments
  const { count: cancelledShipments } = await supabase
    .from("shipments")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("status", "cancelled");

  // 5️⃣ Total spent (sum of trip earnings for company shipments)
  const { data: trips } = await supabase
    .from("trips")
    .select("earning_amount, shipment_id");

  let totalSpent = 0;

  if (trips?.length) {

    const { data: companyShipments } = await supabase
      .from("shipments")
      .select("id")
      .eq("company_id", companyId);

    const shipmentIds = companyShipments?.map(s => s.id) || [];

    trips.forEach(trip => {
      if (shipmentIds.includes(trip.shipment_id)) {
        totalSpent += Number(trip.earning_amount);
      }
    });
  }

  return {
    totalShipments: totalShipments || 0, activeShipments: activeShipments || 0,
    completedShipments: completedShipments || 0, cancelledShipments: cancelledShipments || 0,
    totalSpent
  };
};