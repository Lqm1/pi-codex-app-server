import { getSupportedThinkingLevels } from "@earendil-works/pi-ai";
import type { Model as PiModel } from "@earendil-works/pi-ai";
import { z } from "zod";

import type { Model as CodexModel } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/Model.js";
import type { ModelListParams } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/ModelListParams.js";
import type { ModelListResponse } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/ModelListResponse.js";
import type { ReasoningEffortOption } from "../../vendor/openai-codex-app-server-protocol/typescript/v2/ReasoningEffortOption.js";
import type { PiModelRuntime } from "./pi-model-runtime.js";

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;
const CURSOR_PREFIX = "pi-models:";
const cursorSchema = z
  .string()
  .regex(/^pi-models:\d+$/u)
  .transform((cursor) =>
    Math.trunc(Number(cursor.slice(CURSOR_PREFIX.length)))
  );

const modelKey = (model: PiModel<string>): string =>
  `${encodeURIComponent(model.provider)}/${encodeURIComponent(model.id)}`;

const decodeModelKey = (
  key: string
): { readonly modelId: string; readonly provider: string } | undefined => {
  const separator = key.indexOf("/");
  if (separator < 1 || separator === key.length - 1) {
    return undefined;
  }
  try {
    return {
      modelId: decodeURIComponent(key.slice(separator + 1)),
      provider: decodeURIComponent(key.slice(0, separator)),
    };
  } catch {
    return undefined;
  }
};

const reasoningDescription = (effort: string): string =>
  effort === "off" ? "Disable model reasoning" : `Use ${effort} reasoning`;

const reasoningOptions = (
  model: PiModel<string>
): readonly ReasoningEffortOption[] =>
  getSupportedThinkingLevels(model).map((reasoningEffort) => ({
    description: reasoningDescription(reasoningEffort),
    reasoningEffort,
  }));

const defaultReasoningEffort = (
  options: readonly ReasoningEffortOption[]
): string => {
  const medium = options.find(
    ({ reasoningEffort }) => reasoningEffort === "medium"
  );
  if (medium) {
    return medium.reasoningEffort;
  }
  const disabled = options.find(
    ({ reasoningEffort }) => reasoningEffort === "off"
  );
  return disabled?.reasoningEffort ?? options.at(0)?.reasoningEffort ?? "off";
};

const toCodexModel = (
  model: PiModel<string>,
  providerDisplayName: string,
  defaultKey?: string
): CodexModel => {
  const key = modelKey(model);
  const efforts = reasoningOptions(model);
  return {
    additionalSpeedTiers: [],
    availabilityNux: null,
    defaultReasoningEffort: defaultReasoningEffort(efforts),
    defaultServiceTier: null,
    description: `${model.provider} · ${model.api} · ${model.contextWindow.toLocaleString()} token context`,
    displayName: `[${providerDisplayName}] ${model.name}`,
    hidden: false,
    id: key,
    inputModalities: model.input,
    isDefault: key === defaultKey,
    model: key,
    modelSpecialty: null,
    multiAgentVersion: null,
    serviceTiers: [],
    supportedReasoningEfforts: [...efforts],
    supportsPersonality: false,
    upgrade: null,
    upgradeInfo: null,
  };
};

export class PiModelCatalog {
  readonly #modelRuntime: PiModelRuntime;

  constructor(modelRuntime: PiModelRuntime) {
    this.#modelRuntime = modelRuntime;
  }

  async list(
    params: ModelListParams,
    signal?: AbortSignal
  ): Promise<ModelListResponse> {
    await this.#modelRuntime.refreshModels(signal);
    const offset = params.cursor ? cursorSchema.parse(params.cursor) : 0;
    const pageSize = Math.min(
      Math.max(params.limit ?? DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE
    );
    const models = this.#modelRuntime.modelRegistry.getAvailable();
    const defaultModel = models.at(0);
    const defaultKey = defaultModel ? modelKey(defaultModel) : undefined;
    const page = models.slice(offset, offset + pageSize);
    const nextOffset = offset + page.length;
    return {
      data: page.map((model) =>
        toCodexModel(
          model,
          this.#modelRuntime.modelRegistry.getProviderDisplayName(
            model.provider
          ),
          defaultKey
        )
      ),
      nextCursor:
        nextOffset < models.length ? `${CURSOR_PREFIX}${nextOffset}` : null,
    };
  }

  resolve(key?: string | null): PiModel<string> | undefined {
    if (!key) {
      return this.#modelRuntime.modelRegistry.getAvailable().at(0);
    }
    const identity = decodeModelKey(key);
    return identity
      ? this.#modelRuntime.modelRuntime.getModel(
          identity.provider,
          identity.modelId
        )
      : undefined;
  }

  static key(model: PiModel<string>): string {
    return modelKey(model);
  }
}
