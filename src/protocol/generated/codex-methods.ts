// GENERATED CODE! DO NOT MODIFY BY HAND!
// Source: openai/codex app-server-protocol at the commit recorded in UPSTREAM.md.

import type { AppsInstalledResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/AppsInstalledResponse.js";
import type { AppsListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/AppsListResponse.js";
import type { AppsReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/AppsReadResponse.js";
import type { BedrockDiscoverResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/BedrockDiscoverResponse.js";
import type { BedrockSetupResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/BedrockSetupResponse.js";
import type { CancelLoginAccountResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/CancelLoginAccountResponse.js";
import type { CollaborationModeListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/CollaborationModeListResponse.js";
import type { CommandExecResizeResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/CommandExecResizeResponse.js";
import type { CommandExecResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/CommandExecResponse.js";
import type { CommandExecTerminateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/CommandExecTerminateResponse.js";
import type { CommandExecWriteResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/CommandExecWriteResponse.js";
import type { ConfigReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ConfigReadResponse.js";
import type { ConfigRequirementsReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ConfigRequirementsReadResponse.js";
import type { ConfigWriteResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ConfigWriteResponse.js";
import type { ConsumeAccountRateLimitResetCreditResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ConsumeAccountRateLimitResetCreditResponse.js";
import type { EnvironmentAddResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/EnvironmentAddResponse.js";
import type { EnvironmentInfoResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/EnvironmentInfoResponse.js";
import type { EnvironmentStatusResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/EnvironmentStatusResponse.js";
import type { ExperimentalFeatureEnablementSetResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ExperimentalFeatureEnablementSetResponse.js";
import type { ExperimentalFeatureListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ExperimentalFeatureListResponse.js";
import type { ExternalAgentConfigDetectResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ExternalAgentConfigDetectResponse.js";
import type { ExternalAgentConfigImportHistoriesReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ExternalAgentConfigImportHistoriesReadResponse.js";
import type { ExternalAgentConfigImportHistoryRecordResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ExternalAgentConfigImportHistoryRecordResponse.js";
import type { ExternalAgentConfigImportResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ExternalAgentConfigImportResponse.js";
import type { FeedbackUploadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FeedbackUploadResponse.js";
import type { FsCopyResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FsCopyResponse.js";
import type { FsCreateDirectoryResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FsCreateDirectoryResponse.js";
import type { FsGetMetadataResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FsGetMetadataResponse.js";
import type { FsReadDirectoryResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FsReadDirectoryResponse.js";
import type { FsReadFileResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FsReadFileResponse.js";
import type { FsRemoveResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FsRemoveResponse.js";
import type { FsUnwatchResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FsUnwatchResponse.js";
import type { FsWatchResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FsWatchResponse.js";
import type { FsWriteFileResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FsWriteFileResponse.js";
import type { FuzzyFileSearchResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/FuzzyFileSearchResponse.js";
import type { FuzzyFileSearchSessionStartResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/FuzzyFileSearchSessionStartResponse.js";
import type { FuzzyFileSearchSessionStopResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/FuzzyFileSearchSessionStopResponse.js";
import type { FuzzyFileSearchSessionUpdateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/FuzzyFileSearchSessionUpdateResponse.js";
import type { GetAccountRateLimitsResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/GetAccountRateLimitsResponse.js";
import type { GetAccountResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/GetAccountResponse.js";
import type { GetAccountTokenUsageResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/GetAccountTokenUsageResponse.js";
import type { GetAuthStatusResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/GetAuthStatusResponse.js";
import type { GetConversationSummaryResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/GetConversationSummaryResponse.js";
import type { GetWorkspaceMessagesResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/GetWorkspaceMessagesResponse.js";
import type { GitDiffToRemoteResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/GitDiffToRemoteResponse.js";
import type { HooksListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/HooksListResponse.js";
import type { InitializeResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/InitializeResponse.js";
import type { ListMcpServerStatusResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ListMcpServerStatusResponse.js";
import type { LoginAccountResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/LoginAccountResponse.js";
import type { LogoutAccountResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/LogoutAccountResponse.js";
import type { MarketplaceAddResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/MarketplaceAddResponse.js";
import type { MarketplaceRemoveResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/MarketplaceRemoveResponse.js";
import type { MarketplaceUpgradeResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/MarketplaceUpgradeResponse.js";
import type { McpResourceReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/McpResourceReadResponse.js";
import type { McpServerEventStreamStartResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/McpServerEventStreamStartResponse.js";
import type { McpServerEventStreamStopResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/McpServerEventStreamStopResponse.js";
import type { McpServerOauthLoginResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/McpServerOauthLoginResponse.js";
import type { McpServerRefreshResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/McpServerRefreshResponse.js";
import type { McpServerToolCallResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/McpServerToolCallResponse.js";
import type { MemoryResetResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/MemoryResetResponse.js";
import type { MockExperimentalMethodResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/MockExperimentalMethodResponse.js";
import type { ModelListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ModelListResponse.js";
import type { ModelProviderCapabilitiesReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ModelProviderCapabilitiesReadResponse.js";
import type { PermissionProfileListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PermissionProfileListResponse.js";
import type { PluginInstallResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginInstallResponse.js";
import type { PluginInstalledResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginInstalledResponse.js";
import type { PluginListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginListResponse.js";
import type { PluginReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginReadResponse.js";
import type { PluginSearchResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginSearchResponse.js";
import type { PluginShareCheckoutResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginShareCheckoutResponse.js";
import type { PluginShareDeleteResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginShareDeleteResponse.js";
import type { PluginShareListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginShareListResponse.js";
import type { PluginShareSaveResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginShareSaveResponse.js";
import type { PluginShareUpdateTargetsResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginShareUpdateTargetsResponse.js";
import type { PluginSkillReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginSkillReadResponse.js";
import type { PluginUninstallResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PluginUninstallResponse.js";
import type { ProcessKillResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProcessKillResponse.js";
import type { ProcessResizePtyResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProcessResizePtyResponse.js";
import type { ProcessSpawnResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProcessSpawnResponse.js";
import type { ProcessWriteStdinResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProcessWriteStdinResponse.js";
import type { ProjectCreateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProjectCreateResponse.js";
import type { ProjectDeleteResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProjectDeleteResponse.js";
import type { ProjectImportResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProjectImportResponse.js";
import type { ProjectListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProjectListResponse.js";
import type { ProjectMoveResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProjectMoveResponse.js";
import type { ProjectReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProjectReadResponse.js";
import type { ProjectUpdateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ProjectUpdateResponse.js";
import type { RemoteControlClientsListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/RemoteControlClientsListResponse.js";
import type { RemoteControlClientsRevokeResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/RemoteControlClientsRevokeResponse.js";
import type { RemoteControlDisableResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/RemoteControlDisableResponse.js";
import type { RemoteControlEnableResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/RemoteControlEnableResponse.js";
import type { RemoteControlPairingStartResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/RemoteControlPairingStartResponse.js";
import type { RemoteControlPairingStatusResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/RemoteControlPairingStatusResponse.js";
import type { RemoteControlStatusReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/RemoteControlStatusReadResponse.js";
import type { ReviewStartResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ReviewStartResponse.js";
import type { SendAddCreditsNudgeEmailResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/SendAddCreditsNudgeEmailResponse.js";
import type { ServerDiagnosticsResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ServerDiagnosticsResponse.js";
import type { SkillsConfigWriteResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/SkillsConfigWriteResponse.js";
import type { SkillsExtraRootsSetResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/SkillsExtraRootsSetResponse.js";
import type { SkillsListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/SkillsListResponse.js";
import type { ThreadApproveGuardianDeniedActionResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadApproveGuardianDeniedActionResponse.js";
import type { ThreadArchiveResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadArchiveResponse.js";
import type { ThreadBackgroundTerminalsCleanResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadBackgroundTerminalsCleanResponse.js";
import type { ThreadBackgroundTerminalsListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadBackgroundTerminalsListResponse.js";
import type { ThreadBackgroundTerminalsTerminateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadBackgroundTerminalsTerminateResponse.js";
import type { ThreadCompactStartResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadCompactStartResponse.js";
import type { ThreadDecrementElicitationResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadDecrementElicitationResponse.js";
import type { ThreadDeleteResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadDeleteResponse.js";
import type { ThreadForkResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadForkResponse.js";
import type { ThreadGoalClearResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadGoalClearResponse.js";
import type { ThreadGoalGetResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadGoalGetResponse.js";
import type { ThreadGoalSetResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadGoalSetResponse.js";
import type { ThreadIncrementElicitationResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadIncrementElicitationResponse.js";
import type { ThreadInjectItemsResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadInjectItemsResponse.js";
import type { ThreadItemsListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadItemsListResponse.js";
import type { ThreadListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadListResponse.js";
import type { ThreadLoadedListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadLoadedListResponse.js";
import type { ThreadMemoryModeSetResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadMemoryModeSetResponse.js";
import type { ThreadMetadataUpdateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadMetadataUpdateResponse.js";
import type { ThreadQueueAddResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadQueueAddResponse.js";
import type { ThreadQueueDeleteResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadQueueDeleteResponse.js";
import type { ThreadQueueListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadQueueListResponse.js";
import type { ThreadQueueReorderResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadQueueReorderResponse.js";
import type { ThreadQueueStartResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadQueueStartResponse.js";
import type { ThreadQueueUpdateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadQueueUpdateResponse.js";
import type { ThreadReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadReadResponse.js";
import type { ThreadRealtimeAppendAudioResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadRealtimeAppendAudioResponse.js";
import type { ThreadRealtimeAppendSpeechResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadRealtimeAppendSpeechResponse.js";
import type { ThreadRealtimeAppendTextResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadRealtimeAppendTextResponse.js";
import type { ThreadRealtimeListVoicesResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadRealtimeListVoicesResponse.js";
import type { ThreadRealtimeStartResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadRealtimeStartResponse.js";
import type { ThreadRealtimeStopResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadRealtimeStopResponse.js";
import type { ThreadResumeResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadResumeResponse.js";
import type { ThreadRevertResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadRevertResponse.js";
import type { ThreadRollbackResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadRollbackResponse.js";
import type { ThreadSearchOccurrencesResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadSearchOccurrencesResponse.js";
import type { ThreadSearchResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadSearchResponse.js";
import type { ThreadSectionCreateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadSectionCreateResponse.js";
import type { ThreadSectionDeleteResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadSectionDeleteResponse.js";
import type { ThreadSectionListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadSectionListResponse.js";
import type { ThreadSectionMoveResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadSectionMoveResponse.js";
import type { ThreadSectionUpdateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadSectionUpdateResponse.js";
import type { ThreadSetNameResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadSetNameResponse.js";
import type { ThreadSettingsUpdateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadSettingsUpdateResponse.js";
import type { ThreadShellCommandResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadShellCommandResponse.js";
import type { ThreadStartResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadStartResponse.js";
import type { ThreadTurnsListResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadTurnsListResponse.js";
import type { ThreadUnarchiveResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadUnarchiveResponse.js";
import type { ThreadUnsubscribeResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ThreadUnsubscribeResponse.js";
import type { TurnInterruptResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/TurnInterruptResponse.js";
import type { TurnStartResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/TurnStartResponse.js";
import type { TurnSteerResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/TurnSteerResponse.js";
import type { WindowsSandboxReadinessResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/WindowsSandboxReadinessResponse.js";
import type { WindowsSandboxSetupStartResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/WindowsSandboxSetupStartResponse.js";
import AppsInstalledResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/AppsInstalledResponse.json" with { type: "json" };
import AppsListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/AppsListResponse.json" with { type: "json" };
import AppsReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/AppsReadResponse.json" with { type: "json" };
import BedrockDiscoverResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/BedrockDiscoverResponse.json" with { type: "json" };
import BedrockSetupResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/BedrockSetupResponse.json" with { type: "json" };
import CancelLoginAccountResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/CancelLoginAccountResponse.json" with { type: "json" };
import CollaborationModeListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/CollaborationModeListResponse.json" with { type: "json" };
import CommandExecResizeResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/CommandExecResizeResponse.json" with { type: "json" };
import CommandExecResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/CommandExecResponse.json" with { type: "json" };
import CommandExecTerminateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/CommandExecTerminateResponse.json" with { type: "json" };
import CommandExecWriteResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/CommandExecWriteResponse.json" with { type: "json" };
import ConfigReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ConfigReadResponse.json" with { type: "json" };
import ConfigRequirementsReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ConfigRequirementsReadResponse.json" with { type: "json" };
import ConfigWriteResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ConfigWriteResponse.json" with { type: "json" };
import ConsumeAccountRateLimitResetCreditResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ConsumeAccountRateLimitResetCreditResponse.json" with { type: "json" };
import EnvironmentAddResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/EnvironmentAddResponse.json" with { type: "json" };
import EnvironmentInfoResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/EnvironmentInfoResponse.json" with { type: "json" };
import EnvironmentStatusResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/EnvironmentStatusResponse.json" with { type: "json" };
import ExperimentalFeatureEnablementSetResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ExperimentalFeatureEnablementSetResponse.json" with { type: "json" };
import ExperimentalFeatureListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ExperimentalFeatureListResponse.json" with { type: "json" };
import ExternalAgentConfigDetectResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ExternalAgentConfigDetectResponse.json" with { type: "json" };
import ExternalAgentConfigImportHistoriesReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ExternalAgentConfigImportHistoriesReadResponse.json" with { type: "json" };
import ExternalAgentConfigImportHistoryRecordResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ExternalAgentConfigImportHistoryRecordResponse.json" with { type: "json" };
import ExternalAgentConfigImportResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ExternalAgentConfigImportResponse.json" with { type: "json" };
import FeedbackUploadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/FeedbackUploadResponse.json" with { type: "json" };
import FsCopyResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/FsCopyResponse.json" with { type: "json" };
import FsCreateDirectoryResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/FsCreateDirectoryResponse.json" with { type: "json" };
import FsGetMetadataResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/FsGetMetadataResponse.json" with { type: "json" };
import FsReadDirectoryResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/FsReadDirectoryResponse.json" with { type: "json" };
import FsReadFileResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/FsReadFileResponse.json" with { type: "json" };
import FsRemoveResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/FsRemoveResponse.json" with { type: "json" };
import FsUnwatchResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/FsUnwatchResponse.json" with { type: "json" };
import FsWatchResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/FsWatchResponse.json" with { type: "json" };
import FsWriteFileResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/FsWriteFileResponse.json" with { type: "json" };
import FuzzyFileSearchResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/FuzzyFileSearchResponse.json" with { type: "json" };
import FuzzyFileSearchSessionStartResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/FuzzyFileSearchSessionStartResponse.json" with { type: "json" };
import FuzzyFileSearchSessionStopResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/FuzzyFileSearchSessionStopResponse.json" with { type: "json" };
import FuzzyFileSearchSessionUpdateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/FuzzyFileSearchSessionUpdateResponse.json" with { type: "json" };
import GetAccountRateLimitsResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/GetAccountRateLimitsResponse.json" with { type: "json" };
import GetAccountResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/GetAccountResponse.json" with { type: "json" };
import GetAccountTokenUsageResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/GetAccountTokenUsageResponse.json" with { type: "json" };
import GetWorkspaceMessagesResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/GetWorkspaceMessagesResponse.json" with { type: "json" };
import HooksListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/HooksListResponse.json" with { type: "json" };
import InitializeResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v1/InitializeResponse.json" with { type: "json" };
import ListMcpServerStatusResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ListMcpServerStatusResponse.json" with { type: "json" };
import LoginAccountResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/LoginAccountResponse.json" with { type: "json" };
import LogoutAccountResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/LogoutAccountResponse.json" with { type: "json" };
import MarketplaceAddResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/MarketplaceAddResponse.json" with { type: "json" };
import MarketplaceRemoveResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/MarketplaceRemoveResponse.json" with { type: "json" };
import MarketplaceUpgradeResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/MarketplaceUpgradeResponse.json" with { type: "json" };
import McpResourceReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/McpResourceReadResponse.json" with { type: "json" };
import McpServerEventStreamStartResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/McpServerEventStreamStartResponse.json" with { type: "json" };
import McpServerEventStreamStopResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/McpServerEventStreamStopResponse.json" with { type: "json" };
import McpServerOauthLoginResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/McpServerOauthLoginResponse.json" with { type: "json" };
import McpServerRefreshResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/McpServerRefreshResponse.json" with { type: "json" };
import McpServerToolCallResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/McpServerToolCallResponse.json" with { type: "json" };
import MemoryResetResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/MemoryResetResponse.json" with { type: "json" };
import MockExperimentalMethodResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/MockExperimentalMethodResponse.json" with { type: "json" };
import ModelListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ModelListResponse.json" with { type: "json" };
import ModelProviderCapabilitiesReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ModelProviderCapabilitiesReadResponse.json" with { type: "json" };
import PermissionProfileListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PermissionProfileListResponse.json" with { type: "json" };
import PluginInstallResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginInstallResponse.json" with { type: "json" };
import PluginInstalledResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginInstalledResponse.json" with { type: "json" };
import PluginListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginListResponse.json" with { type: "json" };
import PluginReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginReadResponse.json" with { type: "json" };
import PluginSearchResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginSearchResponse.json" with { type: "json" };
import PluginShareCheckoutResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginShareCheckoutResponse.json" with { type: "json" };
import PluginShareDeleteResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginShareDeleteResponse.json" with { type: "json" };
import PluginShareListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginShareListResponse.json" with { type: "json" };
import PluginShareSaveResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginShareSaveResponse.json" with { type: "json" };
import PluginShareUpdateTargetsResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginShareUpdateTargetsResponse.json" with { type: "json" };
import PluginSkillReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginSkillReadResponse.json" with { type: "json" };
import PluginUninstallResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/PluginUninstallResponse.json" with { type: "json" };
import ProcessKillResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProcessKillResponse.json" with { type: "json" };
import ProcessResizePtyResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProcessResizePtyResponse.json" with { type: "json" };
import ProcessSpawnResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProcessSpawnResponse.json" with { type: "json" };
import ProcessWriteStdinResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProcessWriteStdinResponse.json" with { type: "json" };
import ProjectCreateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProjectCreateResponse.json" with { type: "json" };
import ProjectDeleteResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProjectDeleteResponse.json" with { type: "json" };
import ProjectImportResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProjectImportResponse.json" with { type: "json" };
import ProjectListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProjectListResponse.json" with { type: "json" };
import ProjectMoveResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProjectMoveResponse.json" with { type: "json" };
import ProjectReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProjectReadResponse.json" with { type: "json" };
import ProjectUpdateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ProjectUpdateResponse.json" with { type: "json" };
import RemoteControlClientsListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/RemoteControlClientsListResponse.json" with { type: "json" };
import RemoteControlClientsRevokeResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/RemoteControlClientsRevokeResponse.json" with { type: "json" };
import RemoteControlDisableResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/RemoteControlDisableResponse.json" with { type: "json" };
import RemoteControlEnableResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/RemoteControlEnableResponse.json" with { type: "json" };
import RemoteControlPairingStartResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/RemoteControlPairingStartResponse.json" with { type: "json" };
import RemoteControlPairingStatusResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/RemoteControlPairingStatusResponse.json" with { type: "json" };
import RemoteControlStatusReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/RemoteControlStatusReadResponse.json" with { type: "json" };
import ReviewStartResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ReviewStartResponse.json" with { type: "json" };
import SendAddCreditsNudgeEmailResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/SendAddCreditsNudgeEmailResponse.json" with { type: "json" };
import ServerDiagnosticsResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ServerDiagnosticsResponse.json" with { type: "json" };
import SkillsConfigWriteResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/SkillsConfigWriteResponse.json" with { type: "json" };
import SkillsExtraRootsSetResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/SkillsExtraRootsSetResponse.json" with { type: "json" };
import SkillsListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/SkillsListResponse.json" with { type: "json" };
import ThreadApproveGuardianDeniedActionResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadApproveGuardianDeniedActionResponse.json" with { type: "json" };
import ThreadArchiveResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadArchiveResponse.json" with { type: "json" };
import ThreadBackgroundTerminalsCleanResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadBackgroundTerminalsCleanResponse.json" with { type: "json" };
import ThreadBackgroundTerminalsListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadBackgroundTerminalsListResponse.json" with { type: "json" };
import ThreadBackgroundTerminalsTerminateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadBackgroundTerminalsTerminateResponse.json" with { type: "json" };
import ThreadCompactStartResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadCompactStartResponse.json" with { type: "json" };
import ThreadDecrementElicitationResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadDecrementElicitationResponse.json" with { type: "json" };
import ThreadDeleteResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadDeleteResponse.json" with { type: "json" };
import ThreadForkResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadForkResponse.json" with { type: "json" };
import ThreadGoalClearResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadGoalClearResponse.json" with { type: "json" };
import ThreadGoalGetResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadGoalGetResponse.json" with { type: "json" };
import ThreadGoalSetResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadGoalSetResponse.json" with { type: "json" };
import ThreadIncrementElicitationResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadIncrementElicitationResponse.json" with { type: "json" };
import ThreadInjectItemsResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadInjectItemsResponse.json" with { type: "json" };
import ThreadItemsListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadItemsListResponse.json" with { type: "json" };
import ThreadListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadListResponse.json" with { type: "json" };
import ThreadLoadedListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadLoadedListResponse.json" with { type: "json" };
import ThreadMemoryModeSetResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadMemoryModeSetResponse.json" with { type: "json" };
import ThreadMetadataUpdateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadMetadataUpdateResponse.json" with { type: "json" };
import ThreadQueueAddResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadQueueAddResponse.json" with { type: "json" };
import ThreadQueueDeleteResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadQueueDeleteResponse.json" with { type: "json" };
import ThreadQueueListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadQueueListResponse.json" with { type: "json" };
import ThreadQueueReorderResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadQueueReorderResponse.json" with { type: "json" };
import ThreadQueueStartResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadQueueStartResponse.json" with { type: "json" };
import ThreadQueueUpdateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadQueueUpdateResponse.json" with { type: "json" };
import ThreadReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadReadResponse.json" with { type: "json" };
import ThreadRealtimeAppendAudioResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadRealtimeAppendAudioResponse.json" with { type: "json" };
import ThreadRealtimeAppendSpeechResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadRealtimeAppendSpeechResponse.json" with { type: "json" };
import ThreadRealtimeAppendTextResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadRealtimeAppendTextResponse.json" with { type: "json" };
import ThreadRealtimeListVoicesResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadRealtimeListVoicesResponse.json" with { type: "json" };
import ThreadRealtimeStartResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadRealtimeStartResponse.json" with { type: "json" };
import ThreadRealtimeStopResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadRealtimeStopResponse.json" with { type: "json" };
import ThreadResumeResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadResumeResponse.json" with { type: "json" };
import ThreadRevertResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadRevertResponse.json" with { type: "json" };
import ThreadRollbackResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadRollbackResponse.json" with { type: "json" };
import ThreadSearchOccurrencesResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadSearchOccurrencesResponse.json" with { type: "json" };
import ThreadSearchResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadSearchResponse.json" with { type: "json" };
import ThreadSectionCreateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadSectionCreateResponse.json" with { type: "json" };
import ThreadSectionDeleteResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadSectionDeleteResponse.json" with { type: "json" };
import ThreadSectionListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadSectionListResponse.json" with { type: "json" };
import ThreadSectionMoveResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadSectionMoveResponse.json" with { type: "json" };
import ThreadSectionUpdateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadSectionUpdateResponse.json" with { type: "json" };
import ThreadSetNameResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadSetNameResponse.json" with { type: "json" };
import ThreadSettingsUpdateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadSettingsUpdateResponse.json" with { type: "json" };
import ThreadShellCommandResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadShellCommandResponse.json" with { type: "json" };
import ThreadStartResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadStartResponse.json" with { type: "json" };
import ThreadTurnsListResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadTurnsListResponse.json" with { type: "json" };
import ThreadUnarchiveResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadUnarchiveResponse.json" with { type: "json" };
import ThreadUnsubscribeResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/ThreadUnsubscribeResponse.json" with { type: "json" };
import TurnInterruptResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/TurnInterruptResponse.json" with { type: "json" };
import TurnStartResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/TurnStartResponse.json" with { type: "json" };
import TurnSteerResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/TurnSteerResponse.json" with { type: "json" };
import WindowsSandboxReadinessResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/WindowsSandboxReadinessResponse.json" with { type: "json" };
import WindowsSandboxSetupStartResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/v2/WindowsSandboxSetupStartResponse.json" with { type: "json" };
import type { ClientRequest } from "../../../vendor/openai-codex-app-server-protocol/typescript/ClientRequest.js";

export type CodexClientResponses = {
  readonly "initialize": InitializeResponse;
  readonly "server/diagnostics": ServerDiagnosticsResponse;
  readonly "thread/start": ThreadStartResponse;
  readonly "thread/resume": ThreadResumeResponse;
  readonly "thread/fork": ThreadForkResponse;
  readonly "thread/archive": ThreadArchiveResponse;
  readonly "thread/delete": ThreadDeleteResponse;
  readonly "thread/unsubscribe": ThreadUnsubscribeResponse;
  readonly "thread/increment_elicitation": ThreadIncrementElicitationResponse;
  readonly "thread/decrement_elicitation": ThreadDecrementElicitationResponse;
  readonly "thread/name/set": ThreadSetNameResponse;
  readonly "thread/goal/set": ThreadGoalSetResponse;
  readonly "thread/goal/get": ThreadGoalGetResponse;
  readonly "thread/goal/clear": ThreadGoalClearResponse;
  readonly "thread/queue/add": ThreadQueueAddResponse;
  readonly "thread/queue/list": ThreadQueueListResponse;
  readonly "thread/queue/update": ThreadQueueUpdateResponse;
  readonly "thread/queue/delete": ThreadQueueDeleteResponse;
  readonly "thread/queue/reorder": ThreadQueueReorderResponse;
  readonly "thread/queue/start": ThreadQueueStartResponse;
  readonly "thread/metadata/update": ThreadMetadataUpdateResponse;
  readonly "thread/section/move": ThreadSectionMoveResponse;
  readonly "thread/settings/update": ThreadSettingsUpdateResponse;
  readonly "thread/memoryMode/set": ThreadMemoryModeSetResponse;
  readonly "memory/reset": MemoryResetResponse;
  readonly "thread/unarchive": ThreadUnarchiveResponse;
  readonly "thread/compact/start": ThreadCompactStartResponse;
  readonly "thread/shellCommand": ThreadShellCommandResponse;
  readonly "thread/approveGuardianDeniedAction": ThreadApproveGuardianDeniedActionResponse;
  readonly "thread/backgroundTerminals/clean": ThreadBackgroundTerminalsCleanResponse;
  readonly "thread/backgroundTerminals/list": ThreadBackgroundTerminalsListResponse;
  readonly "thread/backgroundTerminals/terminate": ThreadBackgroundTerminalsTerminateResponse;
  readonly "thread/rollback": ThreadRollbackResponse;
  readonly "thread/revert": ThreadRevertResponse;
  readonly "thread/list": ThreadListResponse;
  readonly "project/list": ProjectListResponse;
  readonly "project/read": ProjectReadResponse;
  readonly "project/create": ProjectCreateResponse;
  readonly "project/import": ProjectImportResponse;
  readonly "project/update": ProjectUpdateResponse;
  readonly "project/move": ProjectMoveResponse;
  readonly "project/delete": ProjectDeleteResponse;
  readonly "threadSection/list": ThreadSectionListResponse;
  readonly "threadSection/create": ThreadSectionCreateResponse;
  readonly "threadSection/update": ThreadSectionUpdateResponse;
  readonly "threadSection/delete": ThreadSectionDeleteResponse;
  readonly "thread/search": ThreadSearchResponse;
  readonly "thread/searchOccurrences": ThreadSearchOccurrencesResponse;
  readonly "thread/loaded/list": ThreadLoadedListResponse;
  readonly "thread/read": ThreadReadResponse;
  readonly "thread/turns/list": ThreadTurnsListResponse;
  readonly "thread/items/list": ThreadItemsListResponse;
  readonly "thread/inject_items": ThreadInjectItemsResponse;
  readonly "skills/list": SkillsListResponse;
  readonly "skills/extraRoots/set": SkillsExtraRootsSetResponse;
  readonly "hooks/list": HooksListResponse;
  readonly "marketplace/add": MarketplaceAddResponse;
  readonly "marketplace/remove": MarketplaceRemoveResponse;
  readonly "marketplace/upgrade": MarketplaceUpgradeResponse;
  readonly "plugin/list": PluginListResponse;
  readonly "plugin/search": PluginSearchResponse;
  readonly "plugin/installed": PluginInstalledResponse;
  readonly "plugin/read": PluginReadResponse;
  readonly "plugin/skill/read": PluginSkillReadResponse;
  readonly "plugin/share/save": PluginShareSaveResponse;
  readonly "plugin/share/updateTargets": PluginShareUpdateTargetsResponse;
  readonly "plugin/share/list": PluginShareListResponse;
  readonly "plugin/share/checkout": PluginShareCheckoutResponse;
  readonly "plugin/share/delete": PluginShareDeleteResponse;
  readonly "app/read": AppsReadResponse;
  readonly "app/list": AppsListResponse;
  readonly "app/installed": AppsInstalledResponse;
  readonly "fs/readFile": FsReadFileResponse;
  readonly "fs/writeFile": FsWriteFileResponse;
  readonly "fs/createDirectory": FsCreateDirectoryResponse;
  readonly "fs/getMetadata": FsGetMetadataResponse;
  readonly "fs/readDirectory": FsReadDirectoryResponse;
  readonly "fs/remove": FsRemoveResponse;
  readonly "fs/copy": FsCopyResponse;
  readonly "fs/watch": FsWatchResponse;
  readonly "fs/unwatch": FsUnwatchResponse;
  readonly "skills/config/write": SkillsConfigWriteResponse;
  readonly "plugin/install": PluginInstallResponse;
  readonly "plugin/uninstall": PluginUninstallResponse;
  readonly "turn/start": TurnStartResponse;
  readonly "turn/steer": TurnSteerResponse;
  readonly "turn/interrupt": TurnInterruptResponse;
  readonly "thread/realtime/start": ThreadRealtimeStartResponse;
  readonly "thread/realtime/appendAudio": ThreadRealtimeAppendAudioResponse;
  readonly "thread/realtime/appendText": ThreadRealtimeAppendTextResponse;
  readonly "thread/realtime/appendSpeech": ThreadRealtimeAppendSpeechResponse;
  readonly "thread/realtime/stop": ThreadRealtimeStopResponse;
  readonly "thread/realtime/listVoices": ThreadRealtimeListVoicesResponse;
  readonly "review/start": ReviewStartResponse;
  readonly "model/list": ModelListResponse;
  readonly "modelProvider/capabilities/read": ModelProviderCapabilitiesReadResponse;
  readonly "experimentalFeature/list": ExperimentalFeatureListResponse;
  readonly "permissionProfile/list": PermissionProfileListResponse;
  readonly "experimentalFeature/enablement/set": ExperimentalFeatureEnablementSetResponse;
  readonly "remoteControl/enable": RemoteControlEnableResponse;
  readonly "remoteControl/disable": RemoteControlDisableResponse;
  readonly "remoteControl/status/read": RemoteControlStatusReadResponse;
  readonly "remoteControl/pairing/start": RemoteControlPairingStartResponse;
  readonly "remoteControl/pairing/status": RemoteControlPairingStatusResponse;
  readonly "remoteControl/client/list": RemoteControlClientsListResponse;
  readonly "remoteControl/client/revoke": RemoteControlClientsRevokeResponse;
  readonly "collaborationMode/list": CollaborationModeListResponse;
  readonly "mock/experimentalMethod": MockExperimentalMethodResponse;
  readonly "environment/add": EnvironmentAddResponse;
  readonly "environment/info": EnvironmentInfoResponse;
  readonly "environment/status": EnvironmentStatusResponse;
  readonly "mcpServer/oauth/login": McpServerOauthLoginResponse;
  readonly "config/mcpServer/reload": McpServerRefreshResponse;
  readonly "mcpServerStatus/list": ListMcpServerStatusResponse;
  readonly "mcpServer/resource/read": McpResourceReadResponse;
  readonly "mcpServer/event/stream/start": McpServerEventStreamStartResponse;
  readonly "mcpServer/event/stream/stop": McpServerEventStreamStopResponse;
  readonly "mcpServer/tool/call": McpServerToolCallResponse;
  readonly "windowsSandbox/setupStart": WindowsSandboxSetupStartResponse;
  readonly "windowsSandbox/readiness": WindowsSandboxReadinessResponse;
  readonly "account/login/start": LoginAccountResponse;
  readonly "account/bedrock/discover": BedrockDiscoverResponse;
  readonly "account/bedrock/setup": BedrockSetupResponse;
  readonly "account/login/cancel": CancelLoginAccountResponse;
  readonly "account/logout": LogoutAccountResponse;
  readonly "account/rateLimits/read": GetAccountRateLimitsResponse;
  readonly "account/rateLimitResetCredit/consume": ConsumeAccountRateLimitResetCreditResponse;
  readonly "account/usage/read": GetAccountTokenUsageResponse;
  readonly "account/workspaceMessages/read": GetWorkspaceMessagesResponse;
  readonly "account/sendAddCreditsNudgeEmail": SendAddCreditsNudgeEmailResponse;
  readonly "feedback/upload": FeedbackUploadResponse;
  readonly "command/exec": CommandExecResponse;
  readonly "command/exec/write": CommandExecWriteResponse;
  readonly "command/exec/terminate": CommandExecTerminateResponse;
  readonly "command/exec/resize": CommandExecResizeResponse;
  readonly "process/spawn": ProcessSpawnResponse;
  readonly "process/writeStdin": ProcessWriteStdinResponse;
  readonly "process/kill": ProcessKillResponse;
  readonly "process/resizePty": ProcessResizePtyResponse;
  readonly "config/read": ConfigReadResponse;
  readonly "externalAgentConfig/detect": ExternalAgentConfigDetectResponse;
  readonly "externalAgentConfig/import": ExternalAgentConfigImportResponse;
  readonly "externalAgentConfig/import/recordHistory": ExternalAgentConfigImportHistoryRecordResponse;
  readonly "externalAgentConfig/import/readHistories": ExternalAgentConfigImportHistoriesReadResponse;
  readonly "config/value/write": ConfigWriteResponse;
  readonly "config/batchWrite": ConfigWriteResponse;
  readonly "configRequirements/read": ConfigRequirementsReadResponse;
  readonly "account/read": GetAccountResponse;
  readonly "getConversationSummary": GetConversationSummaryResponse;
  readonly "gitDiffToRemote": GitDiffToRemoteResponse;
  readonly "getAuthStatus": GetAuthStatusResponse;
  readonly "fuzzyFileSearch": FuzzyFileSearchResponse;
  readonly "fuzzyFileSearch/sessionStart": FuzzyFileSearchSessionStartResponse;
  readonly "fuzzyFileSearch/sessionUpdate": FuzzyFileSearchSessionUpdateResponse;
  readonly "fuzzyFileSearch/sessionStop": FuzzyFileSearchSessionStopResponse;
};

type CodexClientRequestFor<Method extends keyof CodexClientResponses> = Extract<
  ClientRequest,
  { readonly method: Method }
>;

export type CodexClientMethods = {
  readonly [Method in keyof CodexClientResponses]: (
    params: CodexClientRequestFor<Method>["params"]
  ) => CodexClientResponses[Method];
};

export const CodexClientMethodNames = [
  "initialize",
  "server/diagnostics",
  "thread/start",
  "thread/resume",
  "thread/fork",
  "thread/archive",
  "thread/delete",
  "thread/unsubscribe",
  "thread/increment_elicitation",
  "thread/decrement_elicitation",
  "thread/name/set",
  "thread/goal/set",
  "thread/goal/get",
  "thread/goal/clear",
  "thread/queue/add",
  "thread/queue/list",
  "thread/queue/update",
  "thread/queue/delete",
  "thread/queue/reorder",
  "thread/queue/start",
  "thread/metadata/update",
  "thread/section/move",
  "thread/settings/update",
  "thread/memoryMode/set",
  "memory/reset",
  "thread/unarchive",
  "thread/compact/start",
  "thread/shellCommand",
  "thread/approveGuardianDeniedAction",
  "thread/backgroundTerminals/clean",
  "thread/backgroundTerminals/list",
  "thread/backgroundTerminals/terminate",
  "thread/rollback",
  "thread/revert",
  "thread/list",
  "project/list",
  "project/read",
  "project/create",
  "project/import",
  "project/update",
  "project/move",
  "project/delete",
  "threadSection/list",
  "threadSection/create",
  "threadSection/update",
  "threadSection/delete",
  "thread/search",
  "thread/searchOccurrences",
  "thread/loaded/list",
  "thread/read",
  "thread/turns/list",
  "thread/items/list",
  "thread/inject_items",
  "skills/list",
  "skills/extraRoots/set",
  "hooks/list",
  "marketplace/add",
  "marketplace/remove",
  "marketplace/upgrade",
  "plugin/list",
  "plugin/search",
  "plugin/installed",
  "plugin/read",
  "plugin/skill/read",
  "plugin/share/save",
  "plugin/share/updateTargets",
  "plugin/share/list",
  "plugin/share/checkout",
  "plugin/share/delete",
  "app/read",
  "app/list",
  "app/installed",
  "fs/readFile",
  "fs/writeFile",
  "fs/createDirectory",
  "fs/getMetadata",
  "fs/readDirectory",
  "fs/remove",
  "fs/copy",
  "fs/watch",
  "fs/unwatch",
  "skills/config/write",
  "plugin/install",
  "plugin/uninstall",
  "turn/start",
  "turn/steer",
  "turn/interrupt",
  "thread/realtime/start",
  "thread/realtime/appendAudio",
  "thread/realtime/appendText",
  "thread/realtime/appendSpeech",
  "thread/realtime/stop",
  "thread/realtime/listVoices",
  "review/start",
  "model/list",
  "modelProvider/capabilities/read",
  "experimentalFeature/list",
  "permissionProfile/list",
  "experimentalFeature/enablement/set",
  "remoteControl/enable",
  "remoteControl/disable",
  "remoteControl/status/read",
  "remoteControl/pairing/start",
  "remoteControl/pairing/status",
  "remoteControl/client/list",
  "remoteControl/client/revoke",
  "collaborationMode/list",
  "mock/experimentalMethod",
  "environment/add",
  "environment/info",
  "environment/status",
  "mcpServer/oauth/login",
  "config/mcpServer/reload",
  "mcpServerStatus/list",
  "mcpServer/resource/read",
  "mcpServer/event/stream/start",
  "mcpServer/event/stream/stop",
  "mcpServer/tool/call",
  "windowsSandbox/setupStart",
  "windowsSandbox/readiness",
  "account/login/start",
  "account/bedrock/discover",
  "account/bedrock/setup",
  "account/login/cancel",
  "account/logout",
  "account/rateLimits/read",
  "account/rateLimitResetCredit/consume",
  "account/usage/read",
  "account/workspaceMessages/read",
  "account/sendAddCreditsNudgeEmail",
  "feedback/upload",
  "command/exec",
  "command/exec/write",
  "command/exec/terminate",
  "command/exec/resize",
  "process/spawn",
  "process/writeStdin",
  "process/kill",
  "process/resizePty",
  "config/read",
  "externalAgentConfig/detect",
  "externalAgentConfig/import",
  "externalAgentConfig/import/recordHistory",
  "externalAgentConfig/import/readHistories",
  "config/value/write",
  "config/batchWrite",
  "configRequirements/read",
  "account/read",
  "getConversationSummary",
  "gitDiffToRemote",
  "getAuthStatus",
  "fuzzyFileSearch",
  "fuzzyFileSearch/sessionStart",
  "fuzzyFileSearch/sessionUpdate",
  "fuzzyFileSearch/sessionStop",
] as const satisfies readonly (keyof CodexClientResponses)[];

export const CodexClientResponseSchemas = {
  "initialize": InitializeResponseSchema,
  "server/diagnostics": ServerDiagnosticsResponseSchema,
  "thread/start": ThreadStartResponseSchema,
  "thread/resume": ThreadResumeResponseSchema,
  "thread/fork": ThreadForkResponseSchema,
  "thread/archive": ThreadArchiveResponseSchema,
  "thread/delete": ThreadDeleteResponseSchema,
  "thread/unsubscribe": ThreadUnsubscribeResponseSchema,
  "thread/increment_elicitation": ThreadIncrementElicitationResponseSchema,
  "thread/decrement_elicitation": ThreadDecrementElicitationResponseSchema,
  "thread/name/set": ThreadSetNameResponseSchema,
  "thread/goal/set": ThreadGoalSetResponseSchema,
  "thread/goal/get": ThreadGoalGetResponseSchema,
  "thread/goal/clear": ThreadGoalClearResponseSchema,
  "thread/queue/add": ThreadQueueAddResponseSchema,
  "thread/queue/list": ThreadQueueListResponseSchema,
  "thread/queue/update": ThreadQueueUpdateResponseSchema,
  "thread/queue/delete": ThreadQueueDeleteResponseSchema,
  "thread/queue/reorder": ThreadQueueReorderResponseSchema,
  "thread/queue/start": ThreadQueueStartResponseSchema,
  "thread/metadata/update": ThreadMetadataUpdateResponseSchema,
  "thread/section/move": ThreadSectionMoveResponseSchema,
  "thread/settings/update": ThreadSettingsUpdateResponseSchema,
  "thread/memoryMode/set": ThreadMemoryModeSetResponseSchema,
  "memory/reset": MemoryResetResponseSchema,
  "thread/unarchive": ThreadUnarchiveResponseSchema,
  "thread/compact/start": ThreadCompactStartResponseSchema,
  "thread/shellCommand": ThreadShellCommandResponseSchema,
  "thread/approveGuardianDeniedAction": ThreadApproveGuardianDeniedActionResponseSchema,
  "thread/backgroundTerminals/clean": ThreadBackgroundTerminalsCleanResponseSchema,
  "thread/backgroundTerminals/list": ThreadBackgroundTerminalsListResponseSchema,
  "thread/backgroundTerminals/terminate": ThreadBackgroundTerminalsTerminateResponseSchema,
  "thread/rollback": ThreadRollbackResponseSchema,
  "thread/revert": ThreadRevertResponseSchema,
  "thread/list": ThreadListResponseSchema,
  "project/list": ProjectListResponseSchema,
  "project/read": ProjectReadResponseSchema,
  "project/create": ProjectCreateResponseSchema,
  "project/import": ProjectImportResponseSchema,
  "project/update": ProjectUpdateResponseSchema,
  "project/move": ProjectMoveResponseSchema,
  "project/delete": ProjectDeleteResponseSchema,
  "threadSection/list": ThreadSectionListResponseSchema,
  "threadSection/create": ThreadSectionCreateResponseSchema,
  "threadSection/update": ThreadSectionUpdateResponseSchema,
  "threadSection/delete": ThreadSectionDeleteResponseSchema,
  "thread/search": ThreadSearchResponseSchema,
  "thread/searchOccurrences": ThreadSearchOccurrencesResponseSchema,
  "thread/loaded/list": ThreadLoadedListResponseSchema,
  "thread/read": ThreadReadResponseSchema,
  "thread/turns/list": ThreadTurnsListResponseSchema,
  "thread/items/list": ThreadItemsListResponseSchema,
  "thread/inject_items": ThreadInjectItemsResponseSchema,
  "skills/list": SkillsListResponseSchema,
  "skills/extraRoots/set": SkillsExtraRootsSetResponseSchema,
  "hooks/list": HooksListResponseSchema,
  "marketplace/add": MarketplaceAddResponseSchema,
  "marketplace/remove": MarketplaceRemoveResponseSchema,
  "marketplace/upgrade": MarketplaceUpgradeResponseSchema,
  "plugin/list": PluginListResponseSchema,
  "plugin/search": PluginSearchResponseSchema,
  "plugin/installed": PluginInstalledResponseSchema,
  "plugin/read": PluginReadResponseSchema,
  "plugin/skill/read": PluginSkillReadResponseSchema,
  "plugin/share/save": PluginShareSaveResponseSchema,
  "plugin/share/updateTargets": PluginShareUpdateTargetsResponseSchema,
  "plugin/share/list": PluginShareListResponseSchema,
  "plugin/share/checkout": PluginShareCheckoutResponseSchema,
  "plugin/share/delete": PluginShareDeleteResponseSchema,
  "app/read": AppsReadResponseSchema,
  "app/list": AppsListResponseSchema,
  "app/installed": AppsInstalledResponseSchema,
  "fs/readFile": FsReadFileResponseSchema,
  "fs/writeFile": FsWriteFileResponseSchema,
  "fs/createDirectory": FsCreateDirectoryResponseSchema,
  "fs/getMetadata": FsGetMetadataResponseSchema,
  "fs/readDirectory": FsReadDirectoryResponseSchema,
  "fs/remove": FsRemoveResponseSchema,
  "fs/copy": FsCopyResponseSchema,
  "fs/watch": FsWatchResponseSchema,
  "fs/unwatch": FsUnwatchResponseSchema,
  "skills/config/write": SkillsConfigWriteResponseSchema,
  "plugin/install": PluginInstallResponseSchema,
  "plugin/uninstall": PluginUninstallResponseSchema,
  "turn/start": TurnStartResponseSchema,
  "turn/steer": TurnSteerResponseSchema,
  "turn/interrupt": TurnInterruptResponseSchema,
  "thread/realtime/start": ThreadRealtimeStartResponseSchema,
  "thread/realtime/appendAudio": ThreadRealtimeAppendAudioResponseSchema,
  "thread/realtime/appendText": ThreadRealtimeAppendTextResponseSchema,
  "thread/realtime/appendSpeech": ThreadRealtimeAppendSpeechResponseSchema,
  "thread/realtime/stop": ThreadRealtimeStopResponseSchema,
  "thread/realtime/listVoices": ThreadRealtimeListVoicesResponseSchema,
  "review/start": ReviewStartResponseSchema,
  "model/list": ModelListResponseSchema,
  "modelProvider/capabilities/read": ModelProviderCapabilitiesReadResponseSchema,
  "experimentalFeature/list": ExperimentalFeatureListResponseSchema,
  "permissionProfile/list": PermissionProfileListResponseSchema,
  "experimentalFeature/enablement/set": ExperimentalFeatureEnablementSetResponseSchema,
  "remoteControl/enable": RemoteControlEnableResponseSchema,
  "remoteControl/disable": RemoteControlDisableResponseSchema,
  "remoteControl/status/read": RemoteControlStatusReadResponseSchema,
  "remoteControl/pairing/start": RemoteControlPairingStartResponseSchema,
  "remoteControl/pairing/status": RemoteControlPairingStatusResponseSchema,
  "remoteControl/client/list": RemoteControlClientsListResponseSchema,
  "remoteControl/client/revoke": RemoteControlClientsRevokeResponseSchema,
  "collaborationMode/list": CollaborationModeListResponseSchema,
  "mock/experimentalMethod": MockExperimentalMethodResponseSchema,
  "environment/add": EnvironmentAddResponseSchema,
  "environment/info": EnvironmentInfoResponseSchema,
  "environment/status": EnvironmentStatusResponseSchema,
  "mcpServer/oauth/login": McpServerOauthLoginResponseSchema,
  "config/mcpServer/reload": McpServerRefreshResponseSchema,
  "mcpServerStatus/list": ListMcpServerStatusResponseSchema,
  "mcpServer/resource/read": McpResourceReadResponseSchema,
  "mcpServer/event/stream/start": McpServerEventStreamStartResponseSchema,
  "mcpServer/event/stream/stop": McpServerEventStreamStopResponseSchema,
  "mcpServer/tool/call": McpServerToolCallResponseSchema,
  "windowsSandbox/setupStart": WindowsSandboxSetupStartResponseSchema,
  "windowsSandbox/readiness": WindowsSandboxReadinessResponseSchema,
  "account/login/start": LoginAccountResponseSchema,
  "account/bedrock/discover": BedrockDiscoverResponseSchema,
  "account/bedrock/setup": BedrockSetupResponseSchema,
  "account/login/cancel": CancelLoginAccountResponseSchema,
  "account/logout": LogoutAccountResponseSchema,
  "account/rateLimits/read": GetAccountRateLimitsResponseSchema,
  "account/rateLimitResetCredit/consume": ConsumeAccountRateLimitResetCreditResponseSchema,
  "account/usage/read": GetAccountTokenUsageResponseSchema,
  "account/workspaceMessages/read": GetWorkspaceMessagesResponseSchema,
  "account/sendAddCreditsNudgeEmail": SendAddCreditsNudgeEmailResponseSchema,
  "feedback/upload": FeedbackUploadResponseSchema,
  "command/exec": CommandExecResponseSchema,
  "command/exec/write": CommandExecWriteResponseSchema,
  "command/exec/terminate": CommandExecTerminateResponseSchema,
  "command/exec/resize": CommandExecResizeResponseSchema,
  "process/spawn": ProcessSpawnResponseSchema,
  "process/writeStdin": ProcessWriteStdinResponseSchema,
  "process/kill": ProcessKillResponseSchema,
  "process/resizePty": ProcessResizePtyResponseSchema,
  "config/read": ConfigReadResponseSchema,
  "externalAgentConfig/detect": ExternalAgentConfigDetectResponseSchema,
  "externalAgentConfig/import": ExternalAgentConfigImportResponseSchema,
  "externalAgentConfig/import/recordHistory": ExternalAgentConfigImportHistoryRecordResponseSchema,
  "externalAgentConfig/import/readHistories": ExternalAgentConfigImportHistoriesReadResponseSchema,
  "config/value/write": ConfigWriteResponseSchema,
  "config/batchWrite": ConfigWriteResponseSchema,
  "configRequirements/read": ConfigRequirementsReadResponseSchema,
  "account/read": GetAccountResponseSchema,
  "fuzzyFileSearch": FuzzyFileSearchResponseSchema,
  "fuzzyFileSearch/sessionStart": FuzzyFileSearchSessionStartResponseSchema,
  "fuzzyFileSearch/sessionUpdate": FuzzyFileSearchSessionUpdateResponseSchema,
  "fuzzyFileSearch/sessionStop": FuzzyFileSearchSessionStopResponseSchema,
} as const;

export const CodexClientNeutralResponses = {
  "initialize": {"codexHome":"aG88rL","platformFamily":"A9CEizp","platformOs":"E","userAgent":""},
  "server/diagnostics": {"gauges":[],"process":{"id":2}},
  "thread/start": {"approvalPolicy":{"granular":{"mcp_elicitations":false,"rules":false,"sandbox_approval":true}},"approvalsReviewer":"guardian_subagent","cwd":"9CEi","model":"jE","modelProvider":"","sandbox":{"type":"readOnly"},"thread":{"cliVersion":"lSCV9oUj","createdAt":-354,"cwd":"pjTJ","ephemeral":true,"id":"9S","modelProvider":"sP75","preview":"hc1s2F6RkP","projectId":"kyhyuOFGeY","sessionId":"3ri","source":"vscode","status":{"type":"idle"},"turns":[],"updatedAt":-767}},
  "thread/resume": {"approvalPolicy":{"granular":{"mcp_elicitations":false,"rules":false,"sandbox_approval":true}},"approvalsReviewer":"guardian_subagent","cwd":"9CEi","model":"eyVrl","modelProvider":"","sandbox":{"type":"externalSandbox"},"thread":{"cliVersion":"oUjuzpjTJh","createdAt":-471,"cwd":"","ephemeral":false,"id":"sP75","modelProvider":"4Z5hc1s","preview":"kP6i8ky","projectId":"OFG","sessionId":"ks3","source":{"custom":"IuhiesP"},"status":{"activeFlags":[],"type":"active"},"turns":[],"updatedAt":984}},
  "thread/fork": {"approvalPolicy":{"granular":{"mcp_elicitations":false,"rules":false,"sandbox_approval":true}},"approvalsReviewer":"guardian_subagent","cwd":"9CEi","model":"jE","modelProvider":"","sandbox":{"type":"readOnly"},"thread":{"cliVersion":"lSCV9oUj","createdAt":-354,"cwd":"pjTJ","ephemeral":true,"id":"9S","modelProvider":"sP75","preview":"hc1s2F6RkP","projectId":"kyhyuOFGeY","sessionId":"3ri","source":"vscode","status":{"type":"idle"},"turns":[],"updatedAt":-767}},
  "thread/archive": {},
  "thread/delete": {},
  "thread/unsubscribe": {"status":"notSubscribed"},
  "thread/increment_elicitation": {"count":254,"paused":true},
  "thread/decrement_elicitation": {"count":254,"paused":true},
  "thread/name/set": {},
  "thread/goal/set": {"goal":{"createdAt":254,"objective":"","status":"usageLimited","threadId":"8rLSA9CEiz","timeUsedSeconds":-505,"tokensUsed":-22,"updatedAt":-866}},
  "thread/goal/get": {},
  "thread/goal/clear": {"cleared":false},
  "thread/queue/add": {"queuedSubmission":{"clientUserMessageId":"aG88rL","id":"A9CEizp","input":[]}},
  "thread/queue/list": {"data":[]},
  "thread/queue/update": {"queuedSubmission":{"clientUserMessageId":"aG88rL","id":"A9CEizp","input":[]}},
  "thread/queue/delete": {"deleted":false},
  "thread/queue/reorder": {},
  "thread/queue/start": {"turn":{"id":"8rLSA9CEiz","items":[],"status":"completed"}},
  "thread/metadata/update": {"thread":{"cliVersion":"8rLSA9CEiz","createdAt":-505,"cwd":"E","ephemeral":true,"id":"","modelProvider":"KXsm","preview":"SC","projectId":null,"sessionId":"zpj","source":"cli","status":{"type":"systemError"},"turns":[],"updatedAt":437}},
  "thread/section/move": {},
  "thread/settings/update": {},
  "thread/memoryMode/set": {},
  "memory/reset": {},
  "thread/unarchive": {"thread":{"cliVersion":"8rLSA9CEiz","createdAt":-505,"cwd":"E","ephemeral":true,"id":"","modelProvider":"KXsm","preview":"SC","projectId":null,"sessionId":"zpj","source":"cli","status":{"type":"systemError"},"turns":[],"updatedAt":437}},
  "thread/compact/start": {},
  "thread/shellCommand": {},
  "thread/approveGuardianDeniedAction": {},
  "thread/backgroundTerminals/clean": {},
  "thread/backgroundTerminals/list": {"data":[]},
  "thread/backgroundTerminals/terminate": {"terminated":false},
  "thread/rollback": {"thread":{"cliVersion":"8rLSA9CEiz","createdAt":-505,"cwd":"E","ephemeral":true,"id":"","modelProvider":"KXsm","preview":"SC","projectId":null,"sessionId":"zpj","source":"cli","status":{"type":"systemError"},"turns":[],"updatedAt":437}},
  "thread/revert": {"thread":{"cliVersion":"rLSA9CEizp","createdAt":-691,"cwd":"eyVrl","ephemeral":true,"id":"OH","modelProvider":"lSCV9oUj","preview":"T","projectId":"dM","sessionId":"ysP75Q4","source":"cli","status":{"type":"idle"},"turns":[],"updatedAt":409}},
  "thread/list": {"data":[]},
  "project/list": {"data":[]},
  "project/read": {"project":{"createdAt":254,"id":"","metadata":{},"name":"88rLS","position":-148,"roots":[],"updatedAt":-90}},
  "project/create": {"project":{"createdAt":254,"id":"","metadata":{},"name":"88rLS","position":-148,"roots":[],"updatedAt":-90}},
  "project/import": {"project":{"createdAt":254,"id":"","metadata":{},"name":"88rLS","position":-148,"roots":[],"updatedAt":-90}},
  "project/update": {"project":{"createdAt":254,"id":"","metadata":{},"name":"88rLS","position":-148,"roots":[],"updatedAt":-90}},
  "project/move": {},
  "project/delete": {},
  "threadSection/list": {"data":[]},
  "threadSection/create": {"section":{"id":"","name":"88rLS"}},
  "threadSection/update": {"section":{"id":"","name":"88rLS"}},
  "threadSection/delete": {},
  "thread/search": {"data":[]},
  "thread/searchOccurrences": {"data":[]},
  "thread/loaded/list": {"data":[]},
  "thread/read": {"thread":{"cliVersion":"8rLSA9CEiz","createdAt":-505,"cwd":"E","ephemeral":true,"id":"","modelProvider":"KXsm","preview":"SC","projectId":null,"sessionId":"zpj","source":"cli","status":{"type":"systemError"},"turns":[],"updatedAt":437}},
  "thread/turns/list": {"data":[]},
  "thread/items/list": {"data":[]},
  "thread/inject_items": {},
  "skills/list": {"data":[]},
  "skills/extraRoots/set": {},
  "hooks/list": {"data":[]},
  "marketplace/add": {"alreadyAdded":false,"installedRoot":"","marketplaceName":"88rLS"},
  "marketplace/remove": {"marketplaceName":""},
  "marketplace/upgrade": {"errors":[],"selectedMarketplaces":[],"upgradedRoots":[]},
  "plugin/list": {"marketplaces":[]},
  "plugin/search": {"data":[]},
  "plugin/installed": {"marketplaces":[]},
  "plugin/read": {"plugin":{"appTemplates":[],"apps":[],"hooks":[],"marketplaceName":"rLSA9CEizp","mcpServers":[],"skills":[],"summary":{"authPolicy":"ON_INSTALL","enabled":false,"id":"smOHVlSC","installPolicy":"INSTALLED_BY_DEFAULT","installed":true,"name":"T","source":{"package":"","type":"npm"}}}},
  "plugin/skill/read": {},
  "plugin/share/save": {"remotePluginId":"","shareUrl":"88rLS"},
  "plugin/share/updateTargets": {"discoverability":"UNLISTED","principals":[]},
  "plugin/share/list": {"data":[]},
  "plugin/share/checkout": {"marketplaceName":"aG88rL","marketplacePath":"A9CEizp","pluginId":"E","pluginName":"","pluginPath":"Vrlc","remotePluginId":"KXsm"},
  "plugin/share/delete": {},
  "app/read": {"apps":[],"missingAppIds":[]},
  "app/list": {"data":[]},
  "app/installed": {"apps":[]},
  "fs/readFile": {"dataBase64":"aG88rL"},
  "fs/writeFile": {},
  "fs/createDirectory": {},
  "fs/getMetadata": {"createdAtMs":254,"isDirectory":true,"isFile":false,"isSymlink":false,"modifiedAtMs":937},
  "fs/readDirectory": {"entries":[]},
  "fs/remove": {},
  "fs/copy": {},
  "fs/watch": {"path":"aG88rL"},
  "fs/unwatch": {},
  "skills/config/write": {"effectiveEnabled":false},
  "plugin/install": {"appsNeedingAuth":[],"authPolicy":"ON_INSTALL"},
  "plugin/uninstall": {},
  "turn/start": {"turn":{"id":"8rLSA9CEiz","items":[],"status":"completed"}},
  "turn/steer": {"turnId":"aG88rL"},
  "turn/interrupt": {},
  "thread/realtime/start": {},
  "thread/realtime/appendAudio": {},
  "thread/realtime/appendText": {},
  "thread/realtime/appendSpeech": {},
  "thread/realtime/stop": {},
  "thread/realtime/listVoices": {"voices":{"defaultV1":"maple","defaultV2":"alloy","v1":[],"v2":[]}},
  "review/start": {"reviewThreadId":"aG88rL","turn":{"id":"Eizpj","items":[],"status":"inProgress"}},
  "model/list": {"data":[]},
  "modelProvider/capabilities/read": {"imageGeneration":false,"namespaceTools":true,"webSearch":false},
  "experimentalFeature/list": {"data":[]},
  "permissionProfile/list": {"data":[]},
  "experimentalFeature/enablement/set": {"enablement":{}},
  "remoteControl/enable": {"installationId":"","serverName":"88rLS","status":"connecting"},
  "remoteControl/disable": {"installationId":"","serverName":"88rLS","status":"connecting"},
  "remoteControl/status/read": {"installationId":"","serverName":"88rLS","status":"connecting"},
  "remoteControl/pairing/start": {"environmentId":"aG88rL","expiresAt":442,"pairingCode":"CEizpjEeyV"},
  "remoteControl/pairing/status": {"claimed":false},
  "remoteControl/client/list": {"data":[]},
  "remoteControl/client/revoke": {},
  "collaborationMode/list": {"data":[]},
  "mock/experimentalMethod": {},
  "environment/add": {},
  "environment/info": {"shell":{"name":"","path":"88rLS"}},
  "environment/status": {"status":"unknown"},
  "mcpServer/oauth/login": {"authorizationUrl":"aG88rL"},
  "config/mcpServer/reload": {},
  "mcpServerStatus/list": {"data":[]},
  "mcpServer/resource/read": {"contents":[]},
  "mcpServer/event/stream/start": {},
  "mcpServer/event/stream/stop": {},
  "mcpServer/tool/call": {"content":[]},
  "windowsSandbox/setupStart": {"started":false},
  "windowsSandbox/readiness": {"status":"notConfigured"},
  "account/login/start": {"type":"amazonBedrock"},
  "account/bedrock/discover": {"environmentCredentials":[],"profiles":[]},
  "account/bedrock/setup": {},
  "account/login/cancel": {"status":"notFound"},
  "account/logout": {},
  "account/rateLimits/read": {"rateLimits":{}},
  "account/rateLimitResetCredit/consume": {"outcome":"alreadyRedeemed"},
  "account/usage/read": {"summary":{}},
  "account/workspaceMessages/read": {"featureEnabled":false,"messages":[]},
  "account/sendAddCreditsNudgeEmail": {"status":"cooldown_active"},
  "feedback/upload": {"threadId":"aG88rL"},
  "command/exec": {"exitCode":254,"stderr":"","stdout":"88rLS"},
  "command/exec/write": {},
  "command/exec/terminate": {},
  "command/exec/resize": {},
  "process/spawn": {},
  "process/writeStdin": {},
  "process/kill": {},
  "process/resizePty": {},
  "config/read": {"config":{},"origins":{}},
  "externalAgentConfig/detect": {"items":[]},
  "externalAgentConfig/import": {"importId":"aG88rL"},
  "externalAgentConfig/import/recordHistory": {"importId":"aG88rL"},
  "externalAgentConfig/import/readHistories": {"connectors":[],"data":[]},
  "config/value/write": {"filePath":"aG88rL","status":"ok","version":"CEizpjEeyV"},
  "config/batchWrite": {"filePath":"aG88rL","status":"ok","version":"CEizpjEeyV"},
  "configRequirements/read": {},
  "account/read": {"requiresOpenaiAuth":true},
  "getConversationSummary": {"summary":{"cliVersion":"","conversationId":"","cwd":"","gitInfo":null,"modelProvider":"pi","path":"","preview":"","source":"unknown","timestamp":null,"updatedAt":null}},
  "gitDiffToRemote": {"diff":"","sha":""},
  "getAuthStatus": {"authMethod":null,"authToken":null,"requiresOpenaiAuth":null},
  "fuzzyFileSearch": {"files":[]},
  "fuzzyFileSearch/sessionStart": {},
  "fuzzyFileSearch/sessionUpdate": {},
  "fuzzyFileSearch/sessionStop": {},
} satisfies Record<keyof CodexClientResponses, unknown>;

import type { ApplyPatchApprovalResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/ApplyPatchApprovalResponse.js";
import type { AttestationGenerateResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/AttestationGenerateResponse.js";
import type { ChatgptAuthTokensRefreshResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ChatgptAuthTokensRefreshResponse.js";
import type { CommandExecutionRequestApprovalResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/CommandExecutionRequestApprovalResponse.js";
import type { CurrentTimeReadResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/CurrentTimeReadResponse.js";
import type { DynamicToolCallResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/DynamicToolCallResponse.js";
import type { ExecCommandApprovalResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/ExecCommandApprovalResponse.js";
import type { FileChangeRequestApprovalResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/FileChangeRequestApprovalResponse.js";
import type { McpServerElicitationRequestResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/McpServerElicitationRequestResponse.js";
import type { PermissionsRequestApprovalResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/PermissionsRequestApprovalResponse.js";
import type { ToolRequestUserInputResponse } from "../../../vendor/openai-codex-app-server-protocol/typescript/v2/ToolRequestUserInputResponse.js";
import ApplyPatchApprovalResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/ApplyPatchApprovalResponse.json" with { type: "json" };
import AttestationGenerateResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/AttestationGenerateResponse.json" with { type: "json" };
import ChatgptAuthTokensRefreshResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/ChatgptAuthTokensRefreshResponse.json" with { type: "json" };
import CommandExecutionRequestApprovalResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/CommandExecutionRequestApprovalResponse.json" with { type: "json" };
import CurrentTimeReadResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/CurrentTimeReadResponse.json" with { type: "json" };
import DynamicToolCallResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/DynamicToolCallResponse.json" with { type: "json" };
import ExecCommandApprovalResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/ExecCommandApprovalResponse.json" with { type: "json" };
import FileChangeRequestApprovalResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/FileChangeRequestApprovalResponse.json" with { type: "json" };
import McpServerElicitationRequestResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/McpServerElicitationRequestResponse.json" with { type: "json" };
import PermissionsRequestApprovalResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/PermissionsRequestApprovalResponse.json" with { type: "json" };
import ToolRequestUserInputResponseSchema from "../../../vendor/openai-codex-app-server-protocol/json-schema/ToolRequestUserInputResponse.json" with { type: "json" };
import type { ServerRequest } from "../../../vendor/openai-codex-app-server-protocol/typescript/ServerRequest.js";

export type CodexServerResponses = {
  readonly "item/commandExecution/requestApproval": CommandExecutionRequestApprovalResponse;
  readonly "item/fileChange/requestApproval": FileChangeRequestApprovalResponse;
  readonly "item/tool/requestUserInput": ToolRequestUserInputResponse;
  readonly "mcpServer/elicitation/request": McpServerElicitationRequestResponse;
  readonly "item/permissions/requestApproval": PermissionsRequestApprovalResponse;
  readonly "item/tool/call": DynamicToolCallResponse;
  readonly "account/chatgptAuthTokens/refresh": ChatgptAuthTokensRefreshResponse;
  readonly "attestation/generate": AttestationGenerateResponse;
  readonly "currentTime/read": CurrentTimeReadResponse;
  readonly "applyPatchApproval": ApplyPatchApprovalResponse;
  readonly "execCommandApproval": ExecCommandApprovalResponse;
};

type CodexServerRequestFor<Method extends keyof CodexServerResponses> = Extract<
  ServerRequest,
  { readonly method: Method }
>;

export type CodexServerMethods = {
  readonly [Method in keyof CodexServerResponses]: (
    params: CodexServerRequestFor<Method>["params"]
  ) => CodexServerResponses[Method];
};

export const CodexServerMethodNames = [
  "item/commandExecution/requestApproval",
  "item/fileChange/requestApproval",
  "item/tool/requestUserInput",
  "mcpServer/elicitation/request",
  "item/permissions/requestApproval",
  "item/tool/call",
  "account/chatgptAuthTokens/refresh",
  "attestation/generate",
  "currentTime/read",
  "applyPatchApproval",
  "execCommandApproval",
] as const satisfies readonly (keyof CodexServerResponses)[];

export const CodexServerResponseSchemas = {
  "item/commandExecution/requestApproval": CommandExecutionRequestApprovalResponseSchema,
  "item/fileChange/requestApproval": FileChangeRequestApprovalResponseSchema,
  "item/tool/requestUserInput": ToolRequestUserInputResponseSchema,
  "mcpServer/elicitation/request": McpServerElicitationRequestResponseSchema,
  "item/permissions/requestApproval": PermissionsRequestApprovalResponseSchema,
  "item/tool/call": DynamicToolCallResponseSchema,
  "account/chatgptAuthTokens/refresh": ChatgptAuthTokensRefreshResponseSchema,
  "attestation/generate": AttestationGenerateResponseSchema,
  "currentTime/read": CurrentTimeReadResponseSchema,
  "applyPatchApproval": ApplyPatchApprovalResponseSchema,
  "execCommandApproval": ExecCommandApprovalResponseSchema,
} as const;

export const CodexServerNeutralResponses = {
  "item/commandExecution/requestApproval": {"decision":"decline"},
  "item/fileChange/requestApproval": {"decision":"cancel"},
  "item/tool/requestUserInput": {"answers":{}},
  "mcpServer/elicitation/request": {"action":"accept"},
  "item/permissions/requestApproval": {"permissions":{}},
  "item/tool/call": {"contentItems":[],"success":true},
  "account/chatgptAuthTokens/refresh": {"accessToken":"aG88rL","chatgptAccountId":"A9CEizp"},
  "attestation/generate": {"token":"aG88rL"},
  "currentTime/read": {"currentTimeAt":254},
  "applyPatchApproval": {"decision":"approved_for_session"},
  "execCommandApproval": {"decision":"approved_for_session"},
} satisfies Record<keyof CodexServerResponses, unknown>;
