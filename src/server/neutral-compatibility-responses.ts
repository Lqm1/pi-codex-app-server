import type { JsonRpcConnection } from "../protocol/json-rpc-connection.js";

export const registerNeutralCompatibilityResponses = (
  connection: JsonRpcConnection
): void => {
  connection.registerRequest("configRequirements/read", () => ({
    requirements: null,
  }));
  connection.registerRequest("plugin/installed", () => ({
    marketplaceLoadErrors: [],
    marketplaces: [],
  }));
  connection.registerRequest("collaborationMode/list", () => ({ data: [] }));
  connection.registerRequest("permissionProfile/list", () => ({
    data: [],
    nextCursor: null,
  }));
  connection.registerRequest("threadSection/list", () => ({
    data: [],
    nextCursor: null,
  }));
  connection.registerRequest("thread/goal/get", () => ({ goal: null }));
  connection.registerRequest("experimentalFeature/list", () => ({
    data: [],
    nextCursor: null,
  }));
};
