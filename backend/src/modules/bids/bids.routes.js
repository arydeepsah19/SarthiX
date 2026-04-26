import express from "express";
import { requireAuth } from "../../config/clerk.js";
import {
  createOrUpdateBid,
  listBids,
  acceptBidByCompany,
  updateBid,
  getMyBid,
} from "./bids.controller.js";

const router = express.Router();

router.post("/", requireAuth, createOrUpdateBid); // driver: place bid
router.get("/my", requireAuth, getMyBid); // ← MOVED UP: before /:shipmentId
router.get("/:shipmentId", requireAuth, listBids); // company: list bids
router.post("/accept", requireAuth, acceptBidByCompany); // company: accept bid
router.patch("/:bidId", requireAuth, updateBid); // driver: edit bid

export default router;
