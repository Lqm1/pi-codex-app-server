import stream from "node:stream";

import {
  configure,
  getJsonLinesFormatter,
  getLogger,
  getStreamSink,
} from "@logtape/logtape";
import {
  EMAIL_ADDRESS_PATTERN,
  JWT_PATTERN,
  redactByField,
  redactByPattern,
} from "@logtape/redaction";

const APP_SERVER_LOGGER_CATEGORY = "pi-codex-app-server";

export const configureAppServerLogging = async (): Promise<void> => {
  const formatter = redactByPattern(getJsonLinesFormatter(), [
    EMAIL_ADDRESS_PATTERN,
    JWT_PATTERN,
  ]);
  const stderrSink = redactByField(
    getStreamSink(stream.Writable.toWeb(process.stderr), { formatter })
  );
  await configure({
    loggers: [
      {
        category: APP_SERVER_LOGGER_CATEGORY,
        lowestLevel: "debug",
        sinks: ["stderr"],
      },
      {
        category: ["logtape", "meta"],
        lowestLevel: "warning",
        sinks: ["stderr"],
      },
    ],
    sinks: { stderr: stderrSink },
  });
};

export const appServerLogger = getLogger([APP_SERVER_LOGGER_CATEGORY]);
