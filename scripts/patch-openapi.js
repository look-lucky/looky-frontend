/**
 * orval 실행 전 openapi.json의 한글 태그를 영어로 변환합니다.
 * 한글 파일명이 EAS Build를 깨뜨리기 때문에 필요합니다.
 */
const fs = require("fs");
const path = require("path");

const TAG_TRANSLATIONS = {
  "고객센터 API": "customer-support",
};

const openapiPath = path.resolve(__dirname, "../openapi.json");
const schema = JSON.parse(fs.readFileSync(openapiPath, "utf-8"));

let patched = false;

if (schema.paths) {
  for (const methods of Object.values(schema.paths)) {
    for (const operation of Object.values(methods ?? {})) {
      if (operation?.tags) {
        operation.tags = operation.tags.map((tag) => {
          const translated = TAG_TRANSLATIONS[tag];
          if (translated) {
            console.log(`[patch-openapi] "${tag}" → "${translated}"`);
            patched = true;
            return translated;
          }
          return tag;
        });
      }
    }
  }
}

// binary 필드가 있는 엔드포인트의 content-type을 multipart/form-data로 변환
// 서버가 multipart를 기대하지만 OpenAPI spec이 application/json으로 잘못 명시된 경우 수정
const MULTIPART_OPERATIONS = ["createReview", "updateReview"];

if (schema.paths) {
  for (const methods of Object.values(schema.paths)) {
    for (const operation of Object.values(methods ?? {})) {
      if (
        MULTIPART_OPERATIONS.includes(operation?.operationId) &&
        operation?.requestBody?.content?.["application/json"]
      ) {
        const jsonContent = operation.requestBody.content["application/json"];
        delete operation.requestBody.content["application/json"];
        operation.requestBody.content["multipart/form-data"] = jsonContent;
        console.log(
          `[patch-openapi] ${operation.operationId}: application/json → multipart/form-data`
        );
        patched = true;
      }
    }
  }
}

if (patched) {
  fs.writeFileSync(openapiPath, JSON.stringify(schema, null, 2), "utf-8");
  console.log("[patch-openapi] openapi.json 패치 완료");
} else {
  console.log("[patch-openapi] 변환할 항목 없음, 스킵");
}
