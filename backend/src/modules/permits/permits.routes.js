import { Router }  from "express";
import { requireAuth } from "../../config/clerk.js";
import { createPermit, listPermits} from "./permits.controller.js";

const router = Router();
router.post("/", requireAuth, createPermit);
router.get("/", requireAuth, listPermits);

export default router;
