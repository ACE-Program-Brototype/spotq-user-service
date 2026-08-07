import {
	errorMiddleware,
	loggerMiddleware,
	metricsMiddleware,
	notFoundMiddleware,
} from "@interfaces/http/middlewares/index.js";
import { router } from "@interfaces/http/routes/index.routes.js";
import express from "express";

const app = express();

app.use(loggerMiddleware);
app.use(metricsMiddleware);
app.use(express.json());

app.use("/", router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
