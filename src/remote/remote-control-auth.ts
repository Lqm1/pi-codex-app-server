import { z } from "zod";

import type { PiModelRuntime } from "../pi/pi-model-runtime.js";
import { OPENAI_CODEX_PROVIDER } from "../pi/pi-model-runtime.js";

const accountClaimsSchema = z.object({
  "https://api.openai.com/auth": z.object({
    chatgpt_account_id: z.string().min(1),
  }),
});

export interface RemoteControlAuth {
  readonly accessToken: string;
  readonly accountId: string;
}

const accountIdFromToken = (accessToken: string): string => {
  const payload = accessToken.split(".").at(1);
  if (!payload) {
    throw new Error("Pi OpenAI OAuth access token is not a JWT");
  }
  const claims = accountClaimsSchema.parse(
    JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"))
  );
  return claims["https://api.openai.com/auth"].chatgpt_account_id;
};

export const loadRemoteControlAuth = async (
  modelRuntime: PiModelRuntime
): Promise<RemoteControlAuth> => {
  const resolvedAuth = await modelRuntime.modelRuntime.getAuth(
    OPENAI_CODEX_PROVIDER
  );
  const accessToken = resolvedAuth?.auth.apiKey;
  if (!accessToken) {
    throw new Error("ChatGPT Remote Control requires Pi OpenAI OAuth login");
  }
  return { accessToken, accountId: accountIdFromToken(accessToken) };
};
