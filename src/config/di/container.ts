import "reflect-metadata";
import { Container } from "inversify";
import { healthModule } from "./health/health.module.ts";
import { infrastructureModule } from "./infrastructure/infrastructure.module.ts";
import { userModule } from "./user/user.module.ts";

const container = new Container({ defaultScope: "Singleton" });

container.load(infrastructureModule);
container.load(userModule);
container.load(healthModule);

export { container };
