import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import shipmentRoutes from "./modules/shipments/shipments.routes.js";
import bidRoutes from "./modules/bids/bids.routes.js";
import permitRoutes from "./modules/permits/permits.routes.js";
import driverRoutes from "./modules/driver/driver.routes.js";
import ratingsRoutes from "./modules/ratings/ratings.routes.js";
import companyRoutes from "./modules/company/company.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import vehiclesRoutes from "./modules/vehicles/vehicles.route.js";

const app = express();

// ── CORS — must be before all routes ─────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev
      "http://localhost:4173", // Vite preview
    ],
    credentials: true, // ← required for Clerk Authorization header
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/permits", permitRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/vehicles", vehiclesRoutes);
export default app;
