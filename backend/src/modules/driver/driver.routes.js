import express from "express";
import { requireAuth } from "../../config/clerk.js";
import { getDriverDashboard ,getDriverBidsHandler,getDriverTripsHandler,getActiveShipmentsHandler} from "./driver.controller.js";

const router = express.Router();

router.get("/dashboard", requireAuth, getDriverDashboard);
router.get("/bids", requireAuth, getDriverBidsHandler);
router.get("/trips", requireAuth, getDriverTripsHandler);
router.get("/active-shipments", requireAuth, getActiveShipmentsHandler);
export default router;
