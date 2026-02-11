/**
 * 서버에서 OpenAPI JSON을 가져와 프로젝트 루트에 저장합니다.
 * 기존 spec과 비교하여 변경 사항을 로그로 출력합니다.
 * 사용: node scripts/fetch-openapi.js
 */
const fs = require("fs");
const path = require("path");

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.looky.kr";
const OPENAPI_ENDPOINT = "/v3/api-docs";
const OUTPUT_PATH = path.resolve(__dirname, "../openapi.json");

// 터미널 컬러
const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const METHODS = ["get", "post", "put", "patch", "delete"];

function loadExistingSpec() {
  try {
    return JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function getEndpoints(spec) {
  const endpoints = {};
  for (const [path, methods] of Object.entries(spec.paths ?? {})) {
    for (const method of METHODS) {
      if (methods[method]) {
        const key = `${method.toUpperCase()} ${path}`;
        endpoints[key] = methods[method];
      }
    }
  }
  return endpoints;
}

function getSchemas(spec) {
  return spec.components?.schemas ?? {};
}

function diffParams(oldOp, newOp) {
  const changes = [];
  const oldParams = (oldOp.parameters ?? []).map((p) => `${p.in}:${p.name}`);
  const newParams = (newOp.parameters ?? []).map((p) => `${p.in}:${p.name}`);
  const added = newParams.filter((p) => !oldParams.includes(p));
  const removed = oldParams.filter((p) => !newParams.includes(p));
  if (added.length) changes.push(`파라미터 추가: ${added.join(", ")}`);
  if (removed.length) changes.push(`파라미터 삭제: ${removed.join(", ")}`);
  return changes;
}

function diffRequestBody(oldOp, newOp) {
  const oldBody = JSON.stringify(oldOp.requestBody ?? null);
  const newBody = JSON.stringify(newOp.requestBody ?? null);
  if (oldBody !== newBody) return ["requestBody 변경"];
  return [];
}

function diffResponses(oldOp, newOp) {
  const changes = [];
  const oldCodes = Object.keys(oldOp.responses ?? {});
  const newCodes = Object.keys(newOp.responses ?? {});
  const added = newCodes.filter((c) => !oldCodes.includes(c));
  const removed = oldCodes.filter((c) => !newCodes.includes(c));
  if (added.length) changes.push(`응답 코드 추가: ${added.join(", ")}`);
  if (removed.length) changes.push(`응답 코드 삭제: ${removed.join(", ")}`);

  for (const code of newCodes) {
    if (oldCodes.includes(code)) {
      const oldSchema = JSON.stringify(oldOp.responses[code]);
      const newSchema = JSON.stringify(newOp.responses[code]);
      if (oldSchema !== newSchema) {
        changes.push(`${code} 응답 스키마 변경`);
      }
    }
  }
  return changes;
}

function formatType(prop) {
  if (!prop) return "unknown";
  if (prop.$ref) return prop.$ref.split("/").pop();
  if (prop.type === "array") {
    const itemType = prop.items?.$ref
      ? prop.items.$ref.split("/").pop()
      : prop.items?.type ?? "unknown";
    return `${itemType}[]`;
  }
  if (prop.enum) return `enum(${prop.enum.join("|")})`;
  return prop.format ? `${prop.type}(${prop.format})` : prop.type ?? "unknown";
}

function diffSchema(oldSchema, newSchema) {
  const details = [];
  const oldProps = oldSchema.properties ?? {};
  const newProps = newSchema.properties ?? {};
  const oldKeys = Object.keys(oldProps);
  const newKeys = Object.keys(newProps);

  // 필드 추가
  for (const key of newKeys) {
    if (!oldKeys.includes(key)) {
      details.push(`+ ${key}: ${formatType(newProps[key])}`);
    }
  }

  // 필드 삭제
  for (const key of oldKeys) {
    if (!newKeys.includes(key)) {
      details.push(`- ${key}: ${formatType(oldProps[key])}`);
    }
  }

  // 필드 타입 변경
  for (const key of newKeys) {
    if (!oldKeys.includes(key)) continue;
    const oldType = formatType(oldProps[key]);
    const newType = formatType(newProps[key]);
    if (oldType !== newType) {
      details.push(`${key}: ${oldType} → ${newType}`);
    } else if (JSON.stringify(oldProps[key]) !== JSON.stringify(newProps[key])) {
      // 타입은 같지만 다른 속성 변경 (description, nullable, etc.)
      const changes = [];
      if (oldProps[key].nullable !== newProps[key].nullable) {
        changes.push(newProps[key].nullable ? "nullable" : "non-nullable");
      }
      if (oldProps[key].description !== newProps[key].description) {
        changes.push("description 변경");
      }
      if (
        JSON.stringify(oldProps[key].enum) !==
        JSON.stringify(newProps[key].enum)
      ) {
        changes.push(`enum → (${(newProps[key].enum ?? []).join("|")})`);
      }
      if (changes.length) {
        details.push(`${key}: ${changes.join(", ")}`);
      } else {
        details.push(`${key}: 세부 속성 변경`);
      }
    }
  }

  // required 변경
  const oldRequired = new Set(oldSchema.required ?? []);
  const newRequired = new Set(newSchema.required ?? []);
  const nowRequired = [...newRequired].filter((r) => !oldRequired.has(r));
  const nowOptional = [...oldRequired].filter((r) => !newRequired.has(r));
  if (nowRequired.length) {
    details.push(`required 추가: ${nowRequired.join(", ")}`);
  }
  if (nowOptional.length) {
    details.push(`required 해제: ${nowOptional.join(", ")}`);
  }

  return details;
}

function printDiff(oldSpec, newSpec) {
  console.log("");
  console.log(c.bold("─── OpenAPI 변경 사항 ───"));
  console.log("");

  const oldEndpoints = getEndpoints(oldSpec);
  const newEndpoints = getEndpoints(newSpec);
  const oldKeys = Object.keys(oldEndpoints);
  const newKeys = Object.keys(newEndpoints);

  const addedEndpoints = newKeys.filter((k) => !oldKeys.includes(k));
  const removedEndpoints = oldKeys.filter((k) => !newKeys.includes(k));
  const commonEndpoints = newKeys.filter((k) => oldKeys.includes(k));

  // 엔드포인트 추가/삭제
  let endpointChanges = 0;

  if (addedEndpoints.length) {
    console.log(c.green(`  + 엔드포인트 ${addedEndpoints.length}개 추가`));
    addedEndpoints.forEach((ep) => console.log(c.green(`    + ${ep}`)));
    endpointChanges += addedEndpoints.length;
  }

  if (removedEndpoints.length) {
    console.log(c.red(`  - 엔드포인트 ${removedEndpoints.length}개 삭제`));
    removedEndpoints.forEach((ep) => console.log(c.red(`    - ${ep}`)));
    endpointChanges += removedEndpoints.length;
  }

  // 엔드포인트 변경 감지
  const modifiedEndpoints = [];
  for (const key of commonEndpoints) {
    const changes = [
      ...diffParams(oldEndpoints[key], newEndpoints[key]),
      ...diffRequestBody(oldEndpoints[key], newEndpoints[key]),
      ...diffResponses(oldEndpoints[key], newEndpoints[key]),
    ];
    if (changes.length) {
      modifiedEndpoints.push({ key, changes });
    }
  }

  if (modifiedEndpoints.length) {
    console.log(
      c.yellow(`  ~ 엔드포인트 ${modifiedEndpoints.length}개 변경`),
    );
    modifiedEndpoints.forEach(({ key, changes }) => {
      console.log(c.yellow(`    ~ ${key}`));
      changes.forEach((ch) => console.log(c.dim(`      ${ch}`)));
    });
    endpointChanges += modifiedEndpoints.length;
  }

  // 스키마(DTO) 추가/삭제
  const oldSchemas = Object.keys(getSchemas(oldSpec));
  const newSchemas = Object.keys(getSchemas(newSpec));
  const addedSchemas = newSchemas.filter((s) => !oldSchemas.includes(s));
  const removedSchemas = oldSchemas.filter((s) => !newSchemas.includes(s));

  let schemaChanges = 0;

  if (addedSchemas.length) {
    console.log("");
    console.log(c.green(`  + 스키마 ${addedSchemas.length}개 추가`));
    addedSchemas.forEach((s) => console.log(c.green(`    + ${s}`)));
    schemaChanges += addedSchemas.length;
  }

  if (removedSchemas.length) {
    console.log("");
    console.log(c.red(`  - 스키마 ${removedSchemas.length}개 삭제`));
    removedSchemas.forEach((s) => console.log(c.red(`    - ${s}`)));
    schemaChanges += removedSchemas.length;
  }

  // 변경된 스키마 감지
  const commonSchemas = newSchemas.filter((s) => oldSchemas.includes(s));
  const modifiedSchemaDetails = [];
  for (const name of commonSchemas) {
    const oldSchema = getSchemas(oldSpec)[name];
    const newSchema = getSchemas(newSpec)[name];
    if (JSON.stringify(oldSchema) === JSON.stringify(newSchema)) continue;

    const details = diffSchema(oldSchema, newSchema);
    modifiedSchemaDetails.push({ name, details });
  }

  if (modifiedSchemaDetails.length) {
    console.log("");
    console.log(
      c.yellow(`  ~ 스키마 ${modifiedSchemaDetails.length}개 변경`),
    );
    modifiedSchemaDetails.forEach(({ name, details }) => {
      console.log(c.yellow(`    ~ ${name}`));
      details.forEach((d) => {
        if (d.startsWith("+")) console.log(c.green(`      ${d}`));
        else if (d.startsWith("-")) console.log(c.red(`      ${d}`));
        else console.log(c.dim(`      ${d}`));
      });
    });
    schemaChanges += modifiedSchemaDetails.length;
  }

  console.log("");
  const total = endpointChanges + schemaChanges;
  if (total === 0) {
    console.log(c.dim("  변경 사항 없음"));
  } else {
    console.log(c.cyan(`  총 ${total}건 변경 감지`));
  }
  console.log(c.bold("────────────────────────"));
  console.log("");
}

async function fetchOpenApi() {
  const url = `${BASE_URL}${OPENAPI_ENDPOINT}`;
  console.log(`[fetch-openapi] ${url} 에서 OpenAPI spec 가져오는 중...`);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const newSpec = await res.json();
  const oldSpec = loadExistingSpec();

  if (oldSpec) {
    printDiff(oldSpec, newSpec);
  } else {
    console.log("[fetch-openapi] 기존 openapi.json 없음, 최초 생성");
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newSpec, null, 2), "utf-8");

  const pathCount = Object.keys(newSpec.paths ?? {}).length;
  console.log(
    `[fetch-openapi] openapi.json 저장 완료 (엔드포인트 ${pathCount}개)`,
  );
}

fetchOpenApi().catch((err) => {
  console.error("[fetch-openapi] 실패:", err.message);
  process.exit(1);
});
