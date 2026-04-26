import express from "express";
import { requireAuth } from "../../config/clerk.js";
import { getCompanyDashboard } from "./company.controller.js";

const router = express.Router();

router.get("/dashboard", requireAuth, getCompanyDashboard);

export default router;