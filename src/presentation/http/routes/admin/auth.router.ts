import { Router } from "express";
import { validate } from "../../middlewares/validate.middlware";
import { loginValidator } from "../../validators/login.validate";

const router = Router();

router.post("/login", validate(loginValidator));

export default router;
