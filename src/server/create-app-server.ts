import type { AppServerConfig } from "../config/app-server-config.js";
import { PiLiveSessionManager } from "../pi/live-session-manager.js";
import { PiModelCatalog } from "../pi/model-catalog.js";
import { PiModelRuntime } from "../pi/pi-model-runtime.js";
import { PiSessionRepository } from "../pi/session-repository.js";
import { PiThreadCatalog } from "../pi/thread-catalog.js";
import { MetadataDatabase } from "../storage/metadata-database.js";
import { AppServer } from "./app-server.js";

export const createAppServer = async (
  config: AppServerConfig
): Promise<AppServer> => {
  const database = new MetadataDatabase(config.paths.database);
  const piModelRuntime = await PiModelRuntime.create(config);
  const modelCatalog = new PiModelCatalog(piModelRuntime);
  const sessionRepository = new PiSessionRepository(database);
  const threadCatalog = new PiThreadCatalog({
    database,
    sessionRepository,
  });
  const liveSessionManager = new PiLiveSessionManager({
    modelCatalog,
    modelRuntime: piModelRuntime,
    sessionRepository,
    threadCatalog,
  });
  return new AppServer({
    config,
    database,
    liveSessionManager,
    modelCatalog,
    modelRuntime: piModelRuntime,
    sessionRepository,
    threadCatalog,
  });
};
