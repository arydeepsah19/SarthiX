import { supabase } from "../../config/supabaseClient.js";
import { findUserByClerkId } from "../users/user.service.js";
import {
  getShipmentImageCount,
  addShipmentImage,
  getShipmentImage,
  deleteShipmentImage,
} from "./shipmentImages.service.js";

export const uploadShipmentImage = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { id } = req.params; 
    const { image_url } = req.body;

    if (user.role !== "company") {
      return res
        .status(403)
        .json({ message: "Only companies can upload images" });
    }

    // 1️⃣ Check shipment ownership
    const { data: shipment } = await supabase
      .from("shipments")
      .select("company_id")
      .eq("id", id)
      .single();

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    if (shipment.company_id !== user.id) {
      return res.status(403).json({ message: "Not your shipment" });
    }

    // 2️⃣ Enforce max 4 images
    const imageCount = await getShipmentImageCount(id);

    if (imageCount >= 4) {
      return res.status(400).json({ message: "Maximum 4 images allowed" });
    }

    // 3️⃣ Save image URL
    const image = await addShipmentImage(id, image_url);

    res.status(201).json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload image" });
  }
};
export const deleteShipmentImageHandler = async (req, res) => {
  try {
    const user = await findUserByClerkId(req.auth.userId);
    const { id, imageId } = req.params; // id = shipment_id, imageId = image id

    if (user.role !== "company") {
      return res
        .status(403)
        .json({ message: "Only companies can delete images" });
    }

    // Verify ownership — check the shipment belongs to this company
    const { data: shipment } = await supabase
      .from("shipments")
      .select("company_id")
      .eq("id", id)
      .single();

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    if (shipment.company_id !== user.id) {
      return res.status(403).json({ message: "Not your shipment" });
    }

    // Verify the image belongs to this shipment
    const image = await getShipmentImage(imageId);

    if (image.shipment_id !== id) {
      return res
        .status(403)
        .json({ message: "Image does not belong to this shipment" });
    }

    await deleteShipmentImage(imageId);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete image" });
  }
};