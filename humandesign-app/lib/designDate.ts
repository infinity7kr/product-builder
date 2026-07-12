import { sunLongitude } from "./ephemeris";

function normalizeSignedDegrees(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

const DAY_MS = 86400 * 1000;

/**
 * Design(무의식) 시점 계산: 태양 황경이 출생 시점보다 정확히 88도 뒤처진 순간을 이분탐색으로 역산한다.
 * 지구 공전 속도가 근일점 부근에서 더 빠르기 때문에 정확히 88.0일 전은 아니고 약 88~89일 전 사이에서 변동한다.
 */
export function computeDesignDate(birthUtc: Date): Date {
  const birthSun = sunLongitude(birthUtc);
  const target = ((birthSun - 88) % 360 + 360) % 360;

  const diffAt = (t: number) => normalizeSignedDegrees(sunLongitude(new Date(t)) - target);

  let lo = birthUtc.getTime() - 92 * DAY_MS;
  let hi = birthUtc.getTime() - 84 * DAY_MS;

  const diffLo = diffAt(lo);
  const diffHi = diffAt(hi);
  if (diffLo > 0 || diffHi < 0) {
    throw new Error("Design 시점 탐색 구간이 태양 황경 목표값을 포함하지 않습니다.");
  }

  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (diffAt(mid) < 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return new Date((lo + hi) / 2);
}
