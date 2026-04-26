export const driverApi = (axios) => ({
  // GET /api/driver/dashboard
  getDashboard: () => axios.get("/driver/dashboard").then((r) => r.data),

  // GET /api/permits
  getPermits: () => axios.get("/permits").then((r) => r.data),

  // POST /api/permits
  addPermit: (payload) => axios.post("/permits", payload).then((r) => r.data),

  // GET /api/shipments/open
  getOpenShipments: () => axios.get("/shipments/open").then((r) => r.data),

  // POST /api/bids  { shipment_id, bid_price, eta_hours }
  placeBid: (payload) => axios.post("/bids", payload).then((r) => r.data),

  // GET /api/vehicles
  getVehicles: () => axios.get("/vehicles").then((r) => r.data),

  // POST /api/vehicles
  addVehicle: (payload) => axios.post("/vehicles", payload).then((r) => r.data),

  // PATCH /api/vehicles/:id
  updateVehicle: (id, payload) =>
    axios.patch(`/vehicles/${id}`, payload).then((r) => r.data),

  // DELETE /api/vehicles/:id
  deleteVehicle: (id) => axios.delete(`/vehicles/${id}`).then((r) => r.data),

  // POST /api/ratings  { shipment_id, rating, comment }
  rateShipment: (payload) =>
    axios.post("/ratings", payload).then((r) => r.data),

  // GET /api/notifications
  getNotifications: () => axios.get("/notifications").then((r) => r.data),

  // PATCH /api/notifications/:id/read
  markNotificationRead: (id) =>
    axios.patch(`/notifications/${id}/read`).then((r) => r.data),
});
