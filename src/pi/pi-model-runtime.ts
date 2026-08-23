import path from "node:path";

import { ModelRegistry, ModelRuntime } from "@earendil-works/pi-coding-agent";

import type { AppServerConfig } from "../config/app-server-config.js";

export const OPENAI_CODEX_PROVIDER = "openai-codex";

export class PiModelRuntime {
  readonly modelRegistry: ModelRegistry;
  readonly modelRuntime: ModelRuntime;

  private constructor(modelRuntime: ModelRuntime) {
    this.modelRuntime = modelRuntime;
    this.modelRegistry = new ModelRegistry(modelRuntime);
  }

  static async create(config: AppServerConfig): Promise<PiModelRuntime> {
    const modelRuntime = await ModelRuntime.create({
      allowModelNetwork: false,
      authPath: path.join(config.piAgentDir, "auth.json"),
      modelsPath: path.join(config.piAgentDir, "models.json"),
      refreshOnCreate: true,
    });
    return new PiModelRuntime(modelRuntime);
  }

  hasOpenAiAuthentication(): boolean {
    return this.modelRuntime.getProviderAuthStatus(OPENAI_CODEX_PROVIDER)
      .configured;
  }

  async refreshModels(signal?: AbortSignal): Promise<void> {
    await this.modelRuntime.refresh({ allowNetwork: false, signal });
  }

  async logoutOpenAi(signal?: AbortSignal): Promise<void> {
    await this.modelRuntime.logout(OPENAI_CODEX_PROVIDER, { signal });
  }
}
