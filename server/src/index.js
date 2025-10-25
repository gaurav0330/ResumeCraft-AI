import app from "./app.js";
import { config } from "./config/env.js";
import { logger } from "./config/logger.js";

app.listen(config.port, () => {
  logger.info(`🚀 Server running at http://localhost:${config.port}/graphql`);
});
