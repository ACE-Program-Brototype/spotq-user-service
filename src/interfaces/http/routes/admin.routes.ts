import adminAuthRoutes from "@interfaces/http/routes/admin/auth.router";
import adminCustomerRoutes from "@interfaces/http/routes/admin/customer.router";
import { Router } from "express";

const router = Router();

router.use("/", adminAuthRoutes);
router.use("/customers", adminCustomerRoutes);

export default router;
