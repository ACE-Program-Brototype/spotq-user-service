import { Router } from "express";
import { validate } from "@interfaces/http/middlewares/validate.middlware.ts";
import { loginValidator } from "@interfaces/http/validators/login.validate.ts";


const router = Router();

router.post("/login", validate(loginValidator),);

export default router;