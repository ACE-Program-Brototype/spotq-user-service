import adminAuthRoutes from "@interfaces/http/routes/admin/auth.router";
import { Router } from "express";

const router = Router();

router.use("/auth", adminAuthRoutes);

export default router;
