import { app, httpServer } from "./app.js";
import { config } from "./config/env.js";
import { logger } from "./config/logger.js";

const PORT = config.port || 4000;
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}/graphql`);
});
  