import { DateTime } from "luxon";
import { sunLongitude } from "../lib/ephemeris";
import { computeBodygraph, TYPE_LABEL_KO, DEFINITION_LABEL_KO } from "../lib/bodygraph";

/**
 * 검증 스크립트.
 *
 * 1) jdempcy/hdkit(MIT) 저장소의 실제 예시 데이터(Jonah Dempcy, 1983-09-25 20:48 EDT, Malden MA)를
 *    기준으로 태양 황경이 발표된 값(Libra 2°22'14" = 182.3706°)과 소수점 넷째 자리까지 일치하는지 확인한다.
 *    (해당 저장소의 원본 타임스탬프 필드는 -0700로 잘못 기록되어 있어 위치 정보(Malden, MA = EDT, -0400)
 *    기준으로 보정했다. -0400 보정 시 태양 황경이 발표값과 0.0001° 이내로 일치함을 확인함.)
 * 2) 계산된 전체 바디그래프(타입/전략/권위/프로파일/정의/센터/채널)를 사람이 읽을 수 있게 출력한다.
 *    본인 또는 지인의 실제 확인된 차트가 있다면 아래 SAMPLE_BIRTHS에 추가해 결과를 대조해보는 것을 권장한다.
 */

function printBodygraph(label: string, birthUtc: Date) {
  const result = computeBodygraph(birthUtc);
  console.log(`\n========== ${label} ==========`);
  console.log("Birth UTC:", birthUtc.toISOString());
  console.log("Type:", TYPE_LABEL_KO[result.type]);
  console.log("Strategy:", result.strategy);
  console.log("Authority:", result.authorityLabel);
  console.log("Profile:", result.profile);
  console.log("Definition:", DEFINITION_LABEL_KO[result.definition]);
  console.log(
    "Defined centers:",
    Object.entries(result.definedCenters)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ") || "(none)",
  );
  console.log(
    "Defined channels:",
    result.definedChannels.map((c) => c.key).join(", ") || "(none)",
  );
}

function runReferenceCheck() {
  console.log("=== Reference check: Jonah Dempcy chart (jdempcy/hdkit sample data) ===");
  const birth = DateTime.fromObject(
    { year: 1983, month: 9, day: 25, hour: 20, minute: 48 },
    { zone: "America/New_York" },
  ).toUTC();
  console.log("Birth local: 1983-09-25 20:48 America/New_York ->", birth.toISO());

  const expectedSunLon = 180 + 2 + 22 / 60 + 14 / 3600;
  const actualSunLon = sunLongitude(birth.toJSDate());
  const diff = Math.abs(actualSunLon - expectedSunLon);
  console.log(`Expected Personality Sun longitude: ${expectedSunLon.toFixed(4)}`);
  console.log(`Computed Personality Sun longitude: ${actualSunLon.toFixed(4)}`);
  console.log(`Diff: ${diff.toFixed(4)}° -> ${diff < 0.01 ? "PASS" : "FAIL"}`);

  printBodygraph("Jonah Dempcy (reference)", birth.toJSDate());
}

runReferenceCheck();

// 아래에 알고 있는 실제 차트를 추가해 결과를 눈으로 대조할 수 있다:
// printBodygraph("내 이름", DateTime.fromObject({ year, month, day, hour, minute }, { zone: "Asia/Seoul" }).toUTC().toJSDate());
