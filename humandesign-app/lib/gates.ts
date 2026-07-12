/**
 * 휴먼디자인 고정 참조 테이블.
 *
 * 출처: 공개 오픈소스 구현체 hdkit(jdempcy/hdkit, MIT License, https://github.com/jdempcy/hdkit)의
 * constants.js(GATE_WHEEL_ORDER + 58도 오프셋, 두 개의 독립 파일에서 동일하게 확인)와
 * hdkit_sample_app/app/services/bodygraph_data.rb(36채널 목록, 게이트→센터 매핑,
 * 타입/권위/정의 판정 로직)를 참고해 이식했다. 게이트→센터 매핑은 freehumandesignchart.com의
 * 공개 게이트-센터 표와 대조해 36개 채널 전부가 완전히 일치함을 확인했다(교차 검증 완료).
 * 게이트 휠 순서·게이트-센터-채널의 구조적 배치는 Ra Uru Hu의 공개 휴먼디자인 시스템에서 유래한
 * 사실적/구조적 데이터이며, 여러 독립 구현체에 공통으로 쓰이는 공개 정보다.
 */

export type Center =
  | "Head"
  | "Ajna"
  | "Throat"
  | "G"
  | "Heart"
  | "Spleen"
  | "Sacral"
  | "SolarPlexus"
  | "Root";

export const CENTER_LABEL_KO: Record<Center, string> = {
  Head: "머리(Head)",
  Ajna: "아즈나(Ajna)",
  Throat: "목(Throat)",
  G: "G센터(정체성)",
  Heart: "심장(Ego/Will)",
  Spleen: "비장(Spleen)",
  Sacral: "천골(Sacral)",
  SolarPlexus: "감정(Solar Plexus)",
  Root: "루트(Root)",
};

export const MOTOR_CENTERS: Center[] = ["Heart", "SolarPlexus", "Root", "Sacral"];

/**
 * 64게이트가 황도를 따라 배치되는 순서("Rave Mandala" 휠). 인덱스 0 = Gate 41이 시작되는 지점.
 */
export const GATE_WHEEL_ORDER: number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45,
  12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44,
  1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];

/** Gate 41의 시작점(0° Aries 기준 황경 오프셋, 도). Gate 41은 2°00'00" Aquarius에서 시작한다. */
export const GATE_WHEEL_OFFSET_DEG = 58;

export const GATE_CENTER: Record<number, Center> = {
  61: "Head",
  63: "Head",
  64: "Head",
  4: "Ajna",
  11: "Ajna",
  17: "Ajna",
  24: "Ajna",
  43: "Ajna",
  47: "Ajna",
  8: "Throat",
  12: "Throat",
  16: "Throat",
  20: "Throat",
  23: "Throat",
  31: "Throat",
  33: "Throat",
  35: "Throat",
  45: "Throat",
  56: "Throat",
  62: "Throat",
  1: "G",
  2: "G",
  7: "G",
  10: "G",
  13: "G",
  15: "G",
  25: "G",
  46: "G",
  21: "Heart",
  26: "Heart",
  40: "Heart",
  51: "Heart",
  18: "Spleen",
  28: "Spleen",
  32: "Spleen",
  44: "Spleen",
  48: "Spleen",
  50: "Spleen",
  57: "Spleen",
  3: "Sacral",
  5: "Sacral",
  9: "Sacral",
  14: "Sacral",
  27: "Sacral",
  29: "Sacral",
  34: "Sacral",
  42: "Sacral",
  59: "Sacral",
  6: "SolarPlexus",
  22: "SolarPlexus",
  30: "SolarPlexus",
  36: "SolarPlexus",
  37: "SolarPlexus",
  49: "SolarPlexus",
  55: "SolarPlexus",
  19: "Root",
  38: "Root",
  39: "Root",
  41: "Root",
  52: "Root",
  53: "Root",
  54: "Root",
  58: "Root",
  60: "Root",
};

export interface ChannelDef {
  gates: [number, number];
  centers: [Center, Center];
}

/** 36개 채널 (게이트 쌍 + 그 채널이 잇는 두 센터). */
export const CHANNELS: ChannelDef[] = [
  { gates: [61, 24], centers: ["Head", "Ajna"] },
  { gates: [43, 23], centers: ["Ajna", "Throat"] },
  { gates: [20, 10], centers: ["Throat", "G"] },
  { gates: [20, 57], centers: ["Throat", "Spleen"] },
  { gates: [20, 34], centers: ["Throat", "Sacral"] },
  { gates: [12, 22], centers: ["Throat", "SolarPlexus"] },
  { gates: [8, 1], centers: ["Throat", "G"] },
  { gates: [10, 57], centers: ["G", "Spleen"] },
  { gates: [10, 34], centers: ["G", "Sacral"] },
  { gates: [25, 51], centers: ["G", "Heart"] },
  { gates: [2, 14], centers: ["G", "Sacral"] },
  { gates: [57, 34], centers: ["Spleen", "Sacral"] },
  { gates: [28, 38], centers: ["Spleen", "Root"] },
  { gates: [55, 39], centers: ["SolarPlexus", "Root"] },
  { gates: [3, 60], centers: ["Sacral", "Root"] },
  { gates: [45, 21], centers: ["Throat", "Heart"] },
  { gates: [26, 44], centers: ["Heart", "Spleen"] },
  { gates: [40, 37], centers: ["Heart", "SolarPlexus"] },
  { gates: [50, 27], centers: ["Spleen", "Sacral"] },
  { gates: [6, 59], centers: ["SolarPlexus", "Sacral"] },
  { gates: [32, 54], centers: ["Spleen", "Root"] },
  { gates: [49, 19], centers: ["SolarPlexus", "Root"] },
  { gates: [64, 47], centers: ["Head", "Ajna"] },
  { gates: [63, 4], centers: ["Head", "Ajna"] },
  { gates: [17, 62], centers: ["Ajna", "Throat"] },
  { gates: [11, 56], centers: ["Ajna", "Throat"] },
  { gates: [16, 48], centers: ["Throat", "Spleen"] },
  { gates: [35, 36], centers: ["Throat", "SolarPlexus"] },
  { gates: [31, 7], centers: ["Throat", "G"] },
  { gates: [33, 13], centers: ["Throat", "G"] },
  { gates: [15, 5], centers: ["G", "Sacral"] },
  { gates: [46, 29], centers: ["G", "Sacral"] },
  { gates: [18, 58], centers: ["Spleen", "Root"] },
  { gates: [42, 53], centers: ["Sacral", "Root"] },
  { gates: [9, 52], centers: ["Sacral", "Root"] },
  { gates: [30, 41], centers: ["SolarPlexus", "Root"] },
];

export interface GateLine {
  gate: number;
  line: number;
}

function normalizeDegrees(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** 지오센트릭 황경(도)을 휴먼디자인 게이트+라인으로 변환한다. */
export function longitudeToGateLine(longitude: number): GateLine {
  const adjusted = normalizeDegrees(longitude + GATE_WHEEL_OFFSET_DEG);
  const percentageThrough = adjusted / 360;

  const gateIndex = Math.floor(percentageThrough * 64);
  const gate = GATE_WHEEL_ORDER[gateIndex];

  const exactLine = 384 * percentageThrough;
  const line = Math.floor(exactLine % 6) + 1;

  return { gate, line };
}
