import { HttpStatus } from "@shared/constants/http.constants.js";
import { Routes } from "@shared/constants/index.js";
import { Router } from "express";
import client from "prom-client";

const router = Router();

router.get(Routes.METRICS, async (_req, res) => {
	try {
		res.set("Content-Type", client.register.contentType);
		res.end(await client.register.metrics());
	} catch (error) {
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).end(error);
	}
});

export { router as metricsRouter };
