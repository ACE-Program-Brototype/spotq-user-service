import adminAuthRoutes from "@presentation/http/routes/admin/auth.router.ts";
import { Router } from "express";

const router = Router();

router.use("/auth", adminAuthRoutes);

export default router;
