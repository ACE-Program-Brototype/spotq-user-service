import "reflect-metadata";
import express from "express";
import {
	errorMiddleware,
	loggerMiddleware,
	metricsMiddleware,
	notFoundMiddleware,
} from "./presentation/http/middlewares";
import { router } from "./presentation/http/routes/index.routes";

const app = express();

app.use(loggerMiddleware);
app.use(metricsMiddleware);
app.use(express.json());

app.use("/", router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
