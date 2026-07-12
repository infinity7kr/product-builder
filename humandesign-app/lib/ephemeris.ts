import * as Astronomy from "astronomy-engine";

export type CelestialBody =
  | "Sun"
  | "Earth"
  | "Moon"
  | "NorthNode"
  | "SouthNode"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export interface Activation {
  body: CelestialBody;
  /** 지오센트릭 황경 (도, 0~360, 황도 of-date 기준) */
  longitude: number;
}

const PLANET_BODIES: Array<[CelestialBody, Astronomy.Body]> = [
  ["Mercury", Astronomy.Body.Mercury],
  ["Venus", Astronomy.Body.Venus],
  ["Mars", Astronomy.Body.Mars],
  ["Jupiter", Astronomy.Body.Jupiter],
  ["Saturn", Astronomy.Body.Saturn],
  ["Uranus", Astronomy.Body.Uranus],
  ["Neptune", Astronomy.Body.Neptune],
  ["Pluto", Astronomy.Body.Pluto],
];

function normalizeDegrees(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** 태양의 지오센트릭 황경. 시간에 따라 단조 증가하므로 Design(88도 태양호) 역산의 기준으로 쓰인다. */
export function sunLongitude(date: Date): number {
  return normalizeDegrees(Astronomy.SunPosition(date).elon);
}

function moonLongitude(date: Date): number {
  return normalizeDegrees(Astronomy.EclipticGeoMoon(date).lon);
}

/** 행성(수성~명왕성)의 지오센트릭 황경 — EQJ 벡터를 황도 of-date(ECT) 프레임으로 회전시켜 산출 */
function planetLongitude(body: Astronomy.Body, date: Date): number {
  const geo = Astronomy.GeoVector(body, date, true);
  const rot = Astronomy.Rotation_EQJ_ECT(date);
  const ecl = Astronomy.RotateVector(rot, geo);
  const sph = Astronomy.SphereFromVector(ecl);
  return normalizeDegrees(sph.lon);
}

/**
 * 달의 실제(True) 승교점(North Node) 황경.
 * 달의 순간 상태벡터(위치+속도)로부터 궤도 각운동량 h = r × v 를 구하고,
 * 승교점 방향 벡터 n = k × h (k = 황도 극축) 의 방위각을 취한다 — 표준 궤도역학 정의.
 * 평균 교점(mean node) 근사식이 아니라 실제 순간 교점(true node)을 직접 계산하므로 더 정밀하다.
 */
function lunarNodeLongitude(date: Date): number {
  const state = Astronomy.GeoMoonState(date);
  const rot = Astronomy.Rotation_EQJ_ECT(date);
  const s = Astronomy.RotateState(rot, state);

  const hx = s.y * s.vz - s.z * s.vy;
  const hy = s.z * s.vx - s.x * s.vz;

  const nx = -hy;
  const ny = hx;

  return normalizeDegrees((Math.atan2(ny, nx) * 180) / Math.PI);
}

/** 주어진 UTC 시각의 13개 천체 지오센트릭 황경 (휴먼디자인 게이트 활성화 계산용) */
export function getActivations(date: Date): Activation[] {
  const sun = sunLongitude(date);
  const northNode = lunarNodeLongitude(date);

  const activations: Activation[] = [
    { body: "Sun", longitude: sun },
    { body: "Earth", longitude: normalizeDegrees(sun + 180) },
    { body: "Moon", longitude: moonLongitude(date) },
    { body: "NorthNode", longitude: northNode },
    { body: "SouthNode", longitude: normalizeDegrees(northNode + 180) },
  ];

  for (const [name, body] of PLANET_BODIES) {
    activations.push({ body: name, longitude: planetLongitude(body, date) });
  }

  return activations;
}
