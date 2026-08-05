import {
	errorMiddleware,
	loggerMiddleware,
	metricsMiddleware,
	notFoundMiddleware,
} from "@interfaces/http/middlewares/index.js";
import { router } from "@interfaces/http/routes/index.routes.js";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

const app = express();

app.use(loggerMiddleware);
app.use(metricsMiddleware);
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.use("/", router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
