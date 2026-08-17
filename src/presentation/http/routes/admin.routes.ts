import { Router } from "express";
import adminAuthRoutes from "@presentation/http/routes/admin/auth.router.ts"

const router = Router()

router.use("/auth", adminAuthRoutes)


export default router