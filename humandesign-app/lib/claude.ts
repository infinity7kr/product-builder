import { query } from "@anthropic-ai/claude-agent-sdk";
import type { BodygraphResult } from "./bodygraph";
import { TYPE_LABEL_KO, DEFINITION_LABEL_KO } from "./bodygraph";
import { CENTER_LABEL_KO } from "./gates";

const SYSTEM_PROMPT = `당신은 휴먼디자인(Human Design)에 정통한 전문 가이드입니다.
사용자가 제공하는, 이미 정확히 계산된 바디그래프 데이터(타입·전략·내적권위·프로파일·정의·정의된 센터·정의된 채널)를
근거로 따뜻하고 이해하기 쉬운 한국어로 해설을 작성합니다.

작성 규칙:
- 전달받은 타입·전략·권위·프로파일·센터·채널 값은 이미 정확하게 계산된 것이므로 다시 계산하거나 의심하지 말고 그대로 근거로 사용하세요.
- 운명을 단정짓는 말투 대신, 자기 자신의 에너지 패턴을 이해하고 실생활에 실험해보는 자기이해 도구로서의 톤을 유지하세요.
- 다음 순서로 구성하고, 각 항목마다 "## " 마크다운 헤더로 소제목을 달아주세요:
  (1) 타입·전략·내적권위 요약 — 이 사람이 어떻게 결정을 내리고 세상과 상호작용하도록 설계되었는지
  (2) 정의된 센터가 보여주는 에너지 패턴 — 어떤 센터가 일관되게 정의되어 있고, 그것이 일상에서 어떻게 나타나는지
  (3) 건강 & 컨디션 관리 — 정의/미정의 센터와 타입 특성을 고려한 컨디션 관리 포인트
  (4) 섭식 · 식습관 가이드 — 권위와 센터 구성을 고려한 식사 리듬/선택에 대한 조언
  (5) 수면 패턴 — 정의된 센터(특히 루트·비장·솔라플렉서스 등)를 고려한 수면 습관 조언
  (6) 진로 · 일하는 방식 — 타입과 정의된 센터를 고려한 일하는 방식, 잘 맞는 환경
- 각 섹션은 자연스러운 한국어 문단으로 쓰되, 특히 강조하고 싶은 핵심 표현은 **볼드**로 표시해도 좋습니다.
- 표(마크다운 테이블)는 사용하지 마세요 — 화면에 이미 구조화된 카드로 표시되므로 표는 중복됩니다. 헤더와 문단, 필요하다면 간단한 목록(-) 정도만 사용하세요.
- 과도하게 길게 쓰지 마세요.`;

function definedChannelLines(result: BodygraphResult): string {
  if (result.definedChannels.length === 0) return "- (정의된 채널 없음)";
  return result.definedChannels
    .map((c) => `- 채널 ${c.key} (${CENTER_LABEL_KO[c.centers[0]]} ↔ ${CENTER_LABEL_KO[c.centers[1]]})`)
    .join("\n");
}

function definedCenterLines(result: BodygraphResult): string {
  const defined = Object.entries(result.definedCenters)
    .filter(([, v]) => v)
    .map(([k]) => CENTER_LABEL_KO[k as keyof typeof CENTER_LABEL_KO]);
  return defined.length > 0 ? defined.join(", ") : "(정의된 센터 없음)";
}

export function buildBodygraphMarkdown(result: BodygraphResult): string {
  const pSun = result.personality.find((a) => a.body === "Sun")!;
  const pMoon = result.personality.find((a) => a.body === "Moon")!;
  const dSun = result.design.find((a) => a.body === "Sun")!;

  return [
    `- 타입: ${TYPE_LABEL_KO[result.type]}`,
    `- 전략: ${result.strategy}`,
    `- 내적 권위: ${result.authorityLabel}`,
    `- 프로파일: ${result.profile}`,
    `- 정의: ${DEFINITION_LABEL_KO[result.definition]}`,
    `- 정의된 센터: ${definedCenterLines(result)}`,
    `- 정의된 채널 (${result.definedChannels.length}개):`,
    definedChannelLines(result),
    `- Personality Sun: 게이트 ${pSun.gate}.${pSun.line}`,
    `- Personality Moon: 게이트 ${pMoon.gate}.${pMoon.line}`,
    `- Design Sun: 게이트 ${dSun.gate}.${dSun.line}`,
  ].join("\n");
}

export interface InterpretationResult {
  interpretation: string;
  /** 'oauth'면 API 키가 아닌 Claude 구독 로그인 세션으로 처리된 것 */
  apiKeySource: string;
}

export async function buildInterpretation(bodygraphMarkdown: string): Promise<InterpretationResult> {
  const userPrompt = [
    "다음은 계산이 끝난 휴먼디자인 바디그래프 데이터입니다. 이 데이터를 근거로 해설을 작성해주세요.",
    "",
    bodygraphMarkdown,
  ].join("\n");

  let interpretation = "";
  let apiKeySource = "unknown";

  for await (const message of query({
    prompt: userPrompt,
    options: {
      systemPrompt: SYSTEM_PROMPT,
      tools: [],
      disallowedTools: ["*"],
      permissionMode: "dontAsk",
    },
  })) {
    if (message.type === "system" && message.subtype === "init") {
      apiKeySource = message.apiKeySource;
    }

    if (message.type === "assistant" && message.error) {
      throw new Error(`Claude 호출 실패 (${message.error})`);
    }

    if (message.type === "result") {
      if (message.subtype === "success") {
        interpretation = message.result;
      } else {
        throw new Error(`Claude 응답 실패: ${message.subtype}`);
      }
    }
  }

  if (!interpretation) {
    throw new Error("Claude로부터 해석 결과를 받지 못했습니다.");
  }

  return { interpretation, apiKeySource };
}
