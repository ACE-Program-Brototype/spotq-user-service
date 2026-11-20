import "reflect-metadata";
import cookieParser from "cookie-parser";
import express from "express";
import {
	errorMiddleware,
	loggerMiddleware,
	metricsMiddleware,
	notFoundMiddleware,
} from "./interfaces/http/middlewares";
import { router } from "./interfaces/http/routes/index.routes";

const app = express();

app.use(cookieParser());

app.use(loggerMiddleware);
app.use(metricsMiddleware);
app.use(express.json());

app.use("/", router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
