import adminAuthRoutes from "@interfaces/http/routes/admin/auth.router";
import { Router } from "express";

const router = Router();

router.use("/", adminAuthRoutes);

export default router;
