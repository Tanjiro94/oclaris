import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { getGear, getGearById, createGear, updateGear, deleteGear } from "../modules/gear/controllers/gear.controller.js";

const router = Router();

router.get("/gear", requireAuth, getGear);
router.get("/gear/:id", requireAuth, getGearById);
router.post("/gear", requireAuth, createGear);
router.patch("/gear", requireAuth, updateGear);
router.delete("/gear/:id", requireAuth, deleteGear);

export default router;
