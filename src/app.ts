import "reflect-metadata";
import {
	errorMiddleware,
	loggerMiddleware,
	metricsMiddleware,
	notFoundMiddleware,
} from "@interfaces/http/middlewares/index.ts";
import { router } from "@interfaces/http/routes/index.routes.ts";
import express from "express";

const app = express();

app.use(loggerMiddleware);
app.use(metricsMiddleware);
app.use(express.json());

app.use("/", router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
