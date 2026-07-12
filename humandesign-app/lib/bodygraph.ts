import { getActivations, type Activation, type CelestialBody } from "./ephemeris";
import { computeDesignDate } from "./designDate";
import {
  longitudeToGateLine,
  CHANNELS,
  MOTOR_CENTERS,
  type Center,
  type ChannelDef,
} from "./gates";

export type AuraType = "Generator" | "ManifestingGenerator" | "Manifestor" | "Projector" | "Reflector";
export type Authority = "SolarPlexus" | "Sacral" | "Splenic" | "Ego" | "SelfProjected" | "Mental" | "Lunar";
export type DefinitionType = "None" | "Single" | "Split" | "TripleSplit" | "QuadrupleSplit";

export interface ActivationDetail {
  body: CelestialBody;
  longitude: number;
  gate: number;
  line: number;
}

export interface DefinedChannel extends ChannelDef {
  key: string;
}

export interface BodygraphResult {
  personality: ActivationDetail[];
  design: ActivationDetail[];
  definedChannels: DefinedChannel[];
  definedCenters: Record<Center, boolean>;
  type: AuraType;
  strategy: string;
  authority: Authority;
  authorityLabel: string;
  profile: string;
  definition: DefinitionType;
}

const ALL_CENTERS: Center[] = [
  "Head",
  "Ajna",
  "Throat",
  "G",
  "Heart",
  "Spleen",
  "Sacral",
  "SolarPlexus",
  "Root",
];

function detailize(activations: Activation[]): ActivationDetail[] {
  return activations.map((a) => {
    const { gate, line } = longitudeToGateLine(a.longitude);
    return { ...a, gate, line };
  });
}

function computeDefinedChannels(activatedGates: Set<number>): DefinedChannel[] {
  return CHANNELS.filter((c) => activatedGates.has(c.gates[0]) && activatedGates.has(c.gates[1])).map(
    (c) => ({ ...c, key: `${c.gates[0]}-${c.gates[1]}` }),
  );
}

function computeDefinedCenters(definedChannels: DefinedChannel[]): Record<Center, boolean> {
  const centers = Object.fromEntries(ALL_CENTERS.map((c) => [c, false])) as Record<Center, boolean>;
  for (const ch of definedChannels) {
    centers[ch.centers[0]] = true;
    centers[ch.centers[1]] = true;
  }
  return centers;
}

/** 정의된 채널로 연결된 센터들의 연결요소(그룹)를 union-find로 계산한다. */
function connectedComponents(definedChannels: DefinedChannel[]): Center[][] {
  const parent = new Map<Center, Center>(ALL_CENTERS.map((c) => [c, c]));

  function find(x: Center): Center {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    let cur = x;
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  function union(a: Center, b: Center) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  for (const ch of definedChannels) union(ch.centers[0], ch.centers[1]);

  const definedSet = new Set<Center>();
  for (const ch of definedChannels) {
    definedSet.add(ch.centers[0]);
    definedSet.add(ch.centers[1]);
  }

  const groups = new Map<Center, Center[]>();
  for (const c of definedSet) {
    const root = find(c);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(c);
  }
  return [...groups.values()];
}

function sameComponent(components: Center[][], a: Center, b: Center): boolean {
  return components.some((group) => group.includes(a) && group.includes(b));
}

function computeType(
  definedCenters: Record<Center, boolean>,
  components: Center[][],
): { type: AuraType; strategy: string } {
  const throatComponent = components.find((g) => g.includes("Throat"));
  const motorToThroat =
    definedCenters.Throat && !!throatComponent && MOTOR_CENTERS.some((m) => throatComponent.includes(m));

  const anyDefined = ALL_CENTERS.some((c) => definedCenters[c]);

  if (definedCenters.Sacral) {
    return motorToThroat
      ? { type: "ManifestingGenerator", strategy: "반응하기 — 삶이 주는 자극에 몸의 반응(직관적 예/아니오)으로 응답하세요. 시작하기 전에 충분히 알리면 마찰이 줄어듭니다." }
      : { type: "Generator", strategy: "반응하기 — 스스로 시작하기보다, 삶이 제시하는 것에 몸이 보이는 반응을 기다렸다가 응답하세요." };
  }
  if (motorToThroat) {
    return { type: "Manifestor", strategy: "알리기 — 행동하기 전에 영향을 받을 사람들에게 미리 알리면 저항이 줄어듭니다." };
  }
  if (!anyDefined) {
    return { type: "Reflector", strategy: "기다리기 — 중요한 결정은 달의 주기(약 28일)를 온전히 지켜본 뒤 내리세요." };
  }
  return { type: "Projector", strategy: "초대 기다리기 — 인정과 초대를 받을 때 에너지가 가장 잘 흐릅니다." };
}

const AUTHORITY_LABEL: Record<Authority, string> = {
  SolarPlexus: "감정 권위 (Emotional) — 즉각 결정하지 말고 감정의 파도가 가라앉을 때까지 기다리세요",
  Sacral: "천골 권위 (Sacral) — 몸에서 올라오는 즉각적인 반응(예/아니오)을 신뢰하세요",
  Splenic: "비장 권위 (Splenic) — 조용하고 즉각적인 직관의 신호를 그 순간에 신뢰하세요",
  Ego: "에고 권위 (Ego/Heart) — 그것을 원할 의지와 힘이 있는지를 기준으로 판단하세요",
  SelfProjected: "자기투사 권위 (Self-Projected) — 신뢰하는 사람에게 소리 내어 말하면서 스스로 명확해집니다",
  Mental: "환경/멘탈 권위 (Mental) — 내적 권위가 없으므로, 올바른 환경에서 대화를 통해 명확해지길 기다리세요",
  Lunar: "달의 권위 (Lunar) — 리플렉터 고유의 권위로, 약 28일의 달 주기를 지켜보며 결정하세요",
};

function computeAuthority(
  definedCenters: Record<Center, boolean>,
  components: Center[][],
): { authority: Authority; authorityLabel: string } {
  let authority: Authority;
  if (definedCenters.SolarPlexus) authority = "SolarPlexus";
  else if (definedCenters.Sacral) authority = "Sacral";
  else if (definedCenters.Spleen) authority = "Splenic";
  else if (
    definedCenters.Heart &&
    (sameComponent(components, "Heart", "Throat") || sameComponent(components, "Heart", "G"))
  )
    authority = "Ego";
  else if (definedCenters.G && sameComponent(components, "G", "Throat")) authority = "SelfProjected";
  else if (definedCenters.Head || definedCenters.Ajna) authority = "Mental";
  else authority = "Lunar";

  return { authority, authorityLabel: AUTHORITY_LABEL[authority] };
}

function computeDefinition(components: Center[][]): DefinitionType {
  switch (components.length) {
    case 0:
      return "None";
    case 1:
      return "Single";
    case 2:
      return "Split";
    case 3:
      return "TripleSplit";
    default:
      return "QuadrupleSplit";
  }
}

function computeProfile(personality: ActivationDetail[], design: ActivationDetail[]): string {
  const pSun = personality.find((a) => a.body === "Sun")!;
  const dSun = design.find((a) => a.body === "Sun")!;
  return `${pSun.line}/${dSun.line}`;
}

export function computeBodygraph(birthUtc: Date): BodygraphResult {
  const personality = detailize(getActivations(birthUtc));
  const design = detailize(getActivations(computeDesignDate(birthUtc)));

  const activatedGates = new Set<number>([...personality, ...design].map((a) => a.gate));

  const definedChannels = computeDefinedChannels(activatedGates);
  const definedCenters = computeDefinedCenters(definedChannels);
  const components = connectedComponents(definedChannels);

  const { type, strategy } = computeType(definedCenters, components);
  const { authority, authorityLabel } = computeAuthority(definedCenters, components);
  const definition = computeDefinition(components);
  const profile = computeProfile(personality, design);

  return {
    personality,
    design,
    definedChannels,
    definedCenters,
    type,
    strategy,
    authority,
    authorityLabel,
    profile,
    definition,
  };
}

export const TYPE_LABEL_KO: Record<AuraType, string> = {
  Generator: "제너레이터 (Generator)",
  ManifestingGenerator: "매니페스팅 제너레이터 (Manifesting Generator)",
  Manifestor: "매니페스터 (Manifestor)",
  Projector: "프로젝터 (Projector)",
  Reflector: "리플렉터 (Reflector)",
};

export const DEFINITION_LABEL_KO: Record<DefinitionType, string> = {
  None: "정의 없음",
  Single: "싱글 정의 (Single Definition)",
  Split: "스플릿 정의 (Split Definition)",
  TripleSplit: "트리플 스플릿 정의 (Triple Split Definition)",
  QuadrupleSplit: "쿼드러플 스플릿 정의 (Quadruple Split Definition)",
};
