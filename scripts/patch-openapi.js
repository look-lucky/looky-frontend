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

if (patched) {
  fs.writeFileSync(openapiPath, JSON.stringify(schema, null, 2), "utf-8");
  console.log("[patch-openapi] openapi.json 패치 완료");
} else {
  console.log("[patch-openapi] 변환할 한글 태그 없음, 스킵");
}
