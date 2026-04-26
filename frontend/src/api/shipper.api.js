export const shipperApi = (axios) => ({
  // GET /api/company/dashboard
  getDashboard: () => axios.get("/company/dashboard").then((r) => r.data),

  // GET /api/shipments/mine
  getShipments: () => axios.get("/shipments/mine").then((r) => r.data),

  // POST /api/shipments
  postShipment: (payload) =>
    axios.post("/shipments", payload).then((r) => r.data),

  // GET /api/bids/:shipmentId
  getBidsForShipment: (shipmentId) =>
    axios.get(`/bids/${shipmentId}`).then((r) => r.data),

  // POST /api/bids/accept  { bidId, shipmentId }
  acceptBid: (bidId, shipmentId) =>
    axios.post("/bids/accept", { bidId, shipmentId }).then((r) => r.data),

  // POST /api/ratings  { shipment_id, rating, comment }
  rateShipment: (payload) =>
    axios.post("/ratings", payload).then((r) => r.data),

  // GET /api/notifications
  getNotifications: () => axios.get("/notifications").then((r) => r.data),

  // PATCH /api/notifications/:id/read
  markNotificationRead: (id) =>
    axios.patch(`/notifications/${id}/read`).then((r) => r.data),
});
