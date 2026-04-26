import express from "express";
import { requireAuth } from "../../config/clerk.js";
import { postShipment, listShipments, changeShipmentStatus } from "./shipments.controller.js";
import { uploadShipmentImage,deleteShipmentImageHandler } from "./shipmentImages.controller.js";
import { getShipmentDetails,getCompanyShipmentsHandler,updateLocation,fetchLocation,notifyDriver} from "./shipments.controller.js";

const router = express.Router();

router.post("/", requireAuth, postShipment);   // company only
router.get("/", requireAuth, listShipments);   // driver & company
router.post("/:id/images", requireAuth, uploadShipmentImage);
router.get("/myshipments", requireAuth, getCompanyShipmentsHandler);
router.get("/:id", requireAuth, getShipmentDetails);
router.patch("/:id/status", requireAuth, changeShipmentStatus);
router.delete("/:id/images/:imageId", requireAuth, deleteShipmentImageHandler);
router.patch("/:id/location", requireAuth, updateLocation); 
router.get("/:id/location", requireAuth, fetchLocation); 
router.post("/:id/notify", requireAuth, notifyDriver);
export default router;
