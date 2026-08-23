import { readdir } from "node:fs/promises";
import path from "node:path";

import Ajv from "ajv";
import { generateSync } from "json-schema-faker";
import { z } from "zod";

const CLIENT_REQUEST = "ClientRequest";
const SERVER_REQUEST = "ServerRequest";

interface MethodDefinition {
  readonly method: string;
  readonly responseName: string;
}

const jsonSchema = z.looseObject({});
const jsonValueSchema = z.json();
type GeneratedJsonValue = z.infer<typeof jsonValueSchema>;
const ajv = new Ajv({ strict: false });
for (const format of [
  "double",
  "int32",
  "int64",
  "uint",
  "uint16",
  "uint32",
  "uint64",
]) {
  ajv.addFormat(format, true);
}
const legacyNeutralResponses = new Map<string, GeneratedJsonValue>([
  [
    "GetConversationSummaryResponse",
    {
      summary: {
        cliVersion: "",
        conversationId: "",
        cwd: "",
        gitInfo: null,
        modelProvider: "pi",
        path: "",
        preview: "",
        source: "unknown",
        timestamp: null,
        updatedAt: null,
      },
    },
  ],
  [
    "GetAuthStatusResponse",
    { authMethod: null, authToken: null, requiresOpenaiAuth: null },
  ],
  ["GitDiffToRemoteResponse", { diff: "", sha: "" }],
]);

const readArgument = (name: string): string => {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (!value) {
    throw new Error(`Missing ${name} argument`);
  }
  return path.resolve(value);
};

const extractMacroBody = (source: string, macroName: string): string => {
  const marker = `${macroName}! {`;
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find ${marker}`);
  }
  const bodyStart = start + marker.length;
  let depth = 1;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(bodyStart, index);
      }
    }
  }
  throw new Error(`Unclosed ${macroName} invocation`);
};

const parseMethodDefinitions = (body: string): readonly MethodDefinition[] => {
  const definitions: MethodDefinition[] = [];
  const entryPattern =
    /\b\w+\s*=>\s*"(?<method>[^"]+)"\s*\{(?<fields>[\s\S]*?)\n\s{4}\},/gu;
  for (const match of body.matchAll(entryPattern)) {
    const { fields, method } = match.groups ?? {};
    const response = fields?.match(/\bresponse:\s*(?:\w+::)?(?<response>\w+),/u)
      ?.groups?.response;
    if (!(method && response)) {
      throw new Error(`Could not parse method entry: ${match[0]}`);
    }
    definitions.push({ method, responseName: response });
  }
  const legacyEntryPattern =
    /^\s{4}(?<variant>\w+)\s*\{(?<fields>[\s\S]*?)^\s{4}\},/gmu;
  for (const match of body.matchAll(legacyEntryPattern)) {
    const { fields, variant } = match.groups ?? {};
    const response = fields?.match(/\bresponse:\s*(?:\w+::)?(?<response>\w+),/u)
      ?.groups?.response;
    if (!(variant && response)) {
      throw new Error(`Could not parse legacy method entry: ${match[0]}`);
    }
    definitions.push({
      method: `${variant[0]?.toLowerCase()}${variant.slice(1)}`,
      responseName: response,
    });
  }
  if (definitions.length === 0) {
    throw new Error("No protocol methods were parsed");
  }
  return definitions;
};

const extractGeneratedMethods = (source: string): ReadonlySet<string> =>
  new Set(
    Array.from(source.matchAll(/"method":\s*"(?<method>[^"]+)"/gu), (match) => {
      const method = match.groups?.method;
      if (!method) {
        throw new Error("Generated request contains an empty method");
      }
      return method;
    })
  );

const listFiles = async (
  directory: string,
  extension: string
): Promise<readonly string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry): Promise<readonly string[]> => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return await listFiles(entryPath, extension);
      }
      return entry.isFile() && entry.name.endsWith(extension)
        ? [entryPath]
        : [];
    })
  );
  return nestedFiles.flat();
};

const relativeImport = (output: string, importedFile: string): string => {
  const relative = path
    .relative(path.dirname(output), importedFile)
    .replaceAll(path.sep, "/")
    .replace(/\.ts$/u, ".js");
  return relative.startsWith(".") ? relative : `./${relative}`;
};

const generateNeutralResponse = async (
  schemaPath: string
): Promise<GeneratedJsonValue> => {
  const schema = jsonSchema.parse(await Bun.file(schemaPath).json());
  const response = jsonValueSchema.parse(
    generateSync(schema, {
      maxDefaultItems: 0,
      optionalsProbability: 0,
      seed: 1,
      useDefaultValue: true,
      useExamplesValue: true,
    })
  );
  if (!ajv.validate(schema, response)) {
    throw new Error(
      `Generated response does not match ${schemaPath}: ${ajv.errorsText()}`
    );
  }
  return response;
};

const renderMap = async (
  name: string,
  requestTypeName: string,
  requestTypeImport: string,
  methods: readonly MethodDefinition[],
  responseImports: ReadonlyMap<string, string>,
  responseSchemaImports: ReadonlyMap<string, string>,
  responseSchemaSources: ReadonlyMap<string, string>
): Promise<string> => {
  const imports = [...new Set(methods.map(({ responseName }) => responseName))]
    .toSorted()
    .map((responseName) => {
      const importPath = responseImports.get(responseName);
      if (!importPath) {
        throw new Error(`Missing generated response type: ${responseName}`);
      }
      return `import type { ${responseName} } from "${importPath}";`;
    });
  const entries = methods.map(
    ({ method, responseName }) => `  readonly "${method}": ${responseName};`
  );
  const methodsWithSchemas = methods.filter(({ responseName }) =>
    responseSchemaImports.has(responseName)
  );
  const schemaImports = [
    ...new Set(methodsWithSchemas.map(({ responseName }) => responseName)),
  ]
    .toSorted()
    .map((responseName) => {
      const importPath = responseSchemaImports.get(responseName);
      if (!importPath) {
        throw new Error(`Response schema disappeared: ${responseName}`);
      }
      return `import ${responseName}Schema from "${importPath}" with { type: "json" };`;
    });
  const schemaEntries = methodsWithSchemas.map(
    ({ method, responseName }) => `  "${method}": ${responseName}Schema,`
  );
  const neutralEntries = await Promise.all(
    methods.map(async ({ method, responseName }) => {
      const schemaPath = responseSchemaSources.get(responseName);
      if (!schemaPath) {
        const legacyResponse = legacyNeutralResponses.get(responseName);
        if (legacyResponse !== undefined) {
          return `  "${method}": ${JSON.stringify(legacyResponse)},`;
        }
        throw new Error(`Missing response schema for ${method}`);
      }
      const response = await generateNeutralResponse(schemaPath);
      return `  "${method}": ${JSON.stringify(response)},`;
    })
  );
  const methodNames = methods.map(({ method }) => `  "${method}",`);
  return `${imports.join("\n")}
${schemaImports.join("\n")}
import type { ${requestTypeName} } from "${requestTypeImport}";

export type ${name}Responses = {
${entries.join("\n")}
};

type ${name}RequestFor<Method extends keyof ${name}Responses> = Extract<
  ${requestTypeName},
  { readonly method: Method }
>;

export type ${name}Methods = {
  readonly [Method in keyof ${name}Responses]: (
    params: ${name}RequestFor<Method>["params"]
  ) => ${name}Responses[Method];
};

export const ${name}MethodNames = [
${methodNames.join("\n")}
] as const satisfies readonly (keyof ${name}Responses)[];

export const ${name}ResponseSchemas = {
${schemaEntries.join("\n")}
} as const;

export const ${name}NeutralResponses = {
${neutralEntries.join("\n")}
} satisfies Record<keyof ${name}Responses, unknown>;
`;
};

const main = async (): Promise<void> => {
  const commonSourcePath = readArgument("--common");
  const protocolDirectory = readArgument("--protocol");
  const schemaDirectory = readArgument("--schemas");
  const outputPath = readArgument("--output");
  const commonSource = await Bun.file(commonSourcePath).text();
  const typeFiles = await listFiles(protocolDirectory, ".ts");
  const responseFiles = new Map(
    typeFiles.map((file) => [
      path.basename(file, ".ts"),
      relativeImport(outputPath, file),
    ])
  );
  const responseSchemaFiles = await listFiles(schemaDirectory, ".json");
  const responseSchemaSources = new Map(
    responseSchemaFiles.map((file) => [path.basename(file, ".json"), file])
  );
  const schemaFiles = new Map(
    responseSchemaFiles.map((file) => [
      path.basename(file, ".json"),
      relativeImport(outputPath, file),
    ])
  );

  const renderDirection = async (
    mapName: string,
    macroName: string,
    requestTypeName: string
  ): Promise<string> => {
    const requestFile = path.join(protocolDirectory, `${requestTypeName}.ts`);
    const generatedMethods = extractGeneratedMethods(
      await Bun.file(requestFile).text()
    );
    const definitions = parseMethodDefinitions(
      extractMacroBody(commonSource, macroName)
    ).filter(({ method }) => generatedMethods.has(method));
    if (definitions.length !== generatedMethods.size) {
      throw new Error(
        `${requestTypeName} has ${generatedMethods.size} methods, but ${definitions.length} responses were mapped`
      );
    }
    return await renderMap(
      mapName,
      requestTypeName,
      relativeImport(outputPath, requestFile),
      definitions,
      responseFiles,
      schemaFiles,
      responseSchemaSources
    );
  };

  const client = await renderDirection(
    "CodexClient",
    "client_request_definitions",
    CLIENT_REQUEST
  );
  const server = await renderDirection(
    "CodexServer",
    "server_request_definitions",
    SERVER_REQUEST
  );
  const header = `// GENERATED CODE! DO NOT MODIFY BY HAND!\n// Source: openai/codex app-server-protocol at the commit recorded in UPSTREAM.md.\n\n`;
  await Bun.write(outputPath, `${header}${client}\n${server}`);
};

await main();
