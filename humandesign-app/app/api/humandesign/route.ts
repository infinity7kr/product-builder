import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { computeBodygraph } from "@/lib/bodygraph";
import { buildBodygraphMarkdown, buildInterpretation } from "@/lib/claude";
import type { BirthInput, HumanDesignApiResponse } from "@/lib/types";

function parseBirthInput(body: unknown): BirthInput {
  if (typeof body !== "object" || body === null) {
    throw new Error("요청 형식이 올바르지 않습니다.");
  }
  const b = body as Record<string, unknown>;

  const year = Number(b.year);
  const month = Number(b.month);
  const day = Number(b.day);
  const hour = Number(b.hour);
  const minute = Number(b.minute);

  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error("연도는 1900~2100 사이여야 합니다.");
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("월은 1~12 사이여야 합니다.");
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error("일은 1~31 사이여야 합니다.");
  }
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error("시간은 0~23 사이여야 합니다.");
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error("분은 0~59 사이여야 합니다.");
  }

  const timeZone = typeof b.timeZone === "string" ? b.timeZone : "";
  if (!timeZone) {
    throw new Error("출생지의 시간대를 선택해주세요.");
  }

  return { year, month, day, hour, minute, timeZone };
}

export async function POST(request: Request) {
  let input: BirthInput;
  try {
    const body = await request.json();
    input = parseBirthInput(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "요청 형식이 올바르지 않습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const local = DateTime.fromObject(
      { year: input.year, month: input.month, day: input.day, hour: input.hour, minute: input.minute },
      { zone: input.timeZone },
    );
    if (!local.isValid) {
      throw new Error(local.invalidReason === "unsupported zone" ? "지원하지 않는 시간대입니다." : "생년월일시가 올바르지 않습니다.");
    }

    const bodygraph = computeBodygraph(local.toUTC().toJSDate());
    const markdown = buildBodygraphMarkdown(bodygraph);
    const { interpretation, apiKeySource } = await buildInterpretation(markdown);

    const response: HumanDesignApiResponse = {
      ...bodygraph,
      interpretation,
      apiKeySource,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "휴먼디자인 계산 또는 AI 해석 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
