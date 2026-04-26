import express from "express";
import { requireAuth } from "../../config/clerk.js";
import { syncUser } from "./user.controller.js";
import { getCurrentUser } from "./user.controller.js";
import { setRole,updateUserAvatar,updatePhoneNumber,submitVerification } from "./user.controller.js";


const router = express.Router();

router.post("/sync", requireAuth, syncUser);
router.post("/set-role", requireAuth, setRole);
router.get("/me", requireAuth, getCurrentUser);
router.patch("/avatar", requireAuth, updateUserAvatar);
router.patch("/phone", requireAuth, updatePhoneNumber);
router.patch("/submit-verification", requireAuth, submitVerification);

export default router;
